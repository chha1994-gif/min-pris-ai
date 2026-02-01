export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, payload } = req.body;

  // =========================
  // 🔢 BEREGNING
  // =========================
  if (type === "calculate") {
    const { description, rate, kmPerDay, waste, material, hmsPerDay } = payload;

    // Finn timer i teksten (f.eks 40t, 10 timer)
    const matches = description.match(/(\d+)\s*t/g) || [];
    const hours = matches.reduce((sum, m) => sum + Number(m), 0);

    const days = Math.ceil(hours / 7.5);
    const laborCost = hours * rate;
    const drivingCost = kmPerDay * days * 15;
    const hmsCost = hmsPerDay * days;

    const total =
      laborCost +
      drivingCost +
      waste +
      material +
      hmsCost;

    return res.status(200).json({
      hours,
      days,
      laborCost,
      drivingCost,
      waste,
      material,
      hmsCost,
      total
    });
  }

  // =========================
  // ✍️ TILBUDSTEKST
  // =========================
  if (type === "offer") {
    const prompt = `
Lag en profesjonell norsk tilbudstekst basert på dette:

Timer: ${payload.hours}
Dager: ${payload.days}
Arbeid: ${payload.laborCost} kr
Kjøring: ${payload.drivingCost} kr
Avfall: ${payload.waste} kr
Materiell: ${payload.material} kr
HMS: ${payload.hmsCost} kr
Totalpris: ${payload.total} kr
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Bearer ${process.env.OPENAI_API_KEY}
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Du skriver korte, tydelige norske tilbud." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      })
    });

    const raw = await aiRes.text();

    if (!aiRes.ok) {
      return res.status(500).json({ error: raw });
    }

    const data = JSON.parse(raw);

    return res.status(200).json({
      text: data.choices[0].message.content
    });
  }

  res.status(400).json({ error: "Ukjent type" });
}
