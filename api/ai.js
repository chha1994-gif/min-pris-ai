export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY mangler" });
    }

    const {
      beskrivelse,
      timer,
      dager,
      arbeid,
      kjøring,
      avfall,
      materiell,
      hms,
      total
    } = req.body;

    const prompt = `
Lag en profesjonell tilbudstekst på norsk.

Jobb:
${beskrivelse}

Detaljer:
Timer: ${timer}
Dager: ${dager}
Arbeid: ${arbeid} kr
Kjøring: ${kjøring} kr
Avfall: ${avfall} kr
Materiell: ${materiell} kr
HMS: ${hms} kr

Totalpris: ${total} kr
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${apiKey}
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Du er en profesjonell håndverker som skriver tilbud." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: "Ugyldig svar fra OpenAI", data });
    }

    return res.status(200).json({
      text: data.choices[0].message.content
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
