export default async function handler(req, res) {
  // Tillat kun POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      description,
      totalHours,
      days,
      hourRate,
      laborCost,
      kmPerDay,
      drivingCost,
      waste,
      material,
      hmsCost,
      total
    } = req.body;

    if (!description || !total) {
      return res.status(400).json({ error: "Mangler data" });
    }

    const prompt = `
Skriv en profesjonell, kort og tydelig tilbudstekst på norsk basert på dette:

Beskrivelse av jobb:
${description}

Detaljer:
- Timer totalt: ${totalHours}
- Antall dager: ${days}
- Timepris: ${hourRate} kr
- Arbeid: ${laborCost} kr
- Kjøring: ${drivingCost} kr
- Avfall: ${waste} kr
- Materiell: ${material} kr
- HMS: ${hmsCost} kr

Totalpris: ${total} kr

Teksten skal:
- være klar for å sendes til kunde
- forklare kort hva som er inkludert
- avsluttes med totalpris
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: Bearer ${process.env.OPENAI_API_KEY}
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Du er en profesjonell norsk håndverker som skriver tilbud." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "Feil fra OpenAI" });
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: "Tom respons fra AI" });
    }

    res.status(200).json({ text });

  } catch (err) {
    console.error("Serverfeil:", err);
    res.status(500).json({ error: "Intern serverfeil" });
  }
}
