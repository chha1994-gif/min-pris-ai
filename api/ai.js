import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      beskrivelse,
      timer,
      dager,
      arbeid,
      kjøring,
      avfall,
      materiell,
      hms,
      total,
    } = req.body;

    if (!beskrivelse || !total) {
      return res.status(400).json({ error: "Manglende data" });
    }

    const prompt = `
Skriv en profesjonell tilbudstekst på norsk.

Jobbbeskrivelse:
${beskrivelse}

Kalkyle:
- Timer: ${timer}
- Dager: ${dager}
- Arbeid: ${arbeid} kr
- Kjøring: ${kjøring} kr
- Avfall: ${avfall} kr
- Materiell: ${materiell} kr
- HMS: ${hms} kr
- Totalpris: ${total} kr

Teksten skal være klar til å sendes til kunde.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du er en profesjonell håndverker." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 400,
    });

    const text = completion.choices[0].message.content;

    return res.status(200).json({ text });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({
      error: "AI-feil",
      message: err.message,
    });
  }
}
