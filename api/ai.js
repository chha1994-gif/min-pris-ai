import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    const prompt = `
Skriv en profesjonell tilbudstekst på norsk basert på dette:

Jobb: ${data.beskrivelse}

Dager: ${data.dager}
Timer: ${data.timer}

Kostnader:
- Arbeid: ${data.arbeid} kr
- Kjøring: ${data.kjøring} kr
- Avfall: ${data.avfall} kr
- Materiell: ${data.materiell} kr
- HMS: ${data.hms} kr

Totalpris: ${data.total} kr

Teksten skal være klar til å sende kunde.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    res.status(200).json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({
      error: "AI-feil",
      details: err.message
    });
  }
}
