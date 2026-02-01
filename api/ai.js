import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { beskrivelse, timepris, km, avfall, forbruk } = req.body;

    const prompt = `
Du er en profesjonell håndverker.
Regn ut tilbud basert på:

Beskrivelse: ${beskrivelse}
Timepris: ${timepris} kr
Km per dag: ${km}
Avfall: ${avfall} kr
Forbruk per dag: ${forbruk} kr

Regn ut:
- Antall dager
- Antall timer
- Arbeid
- Kjøring
- Forbruk
- Totalpris

Svar tydelig med tall.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.status(200).json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
