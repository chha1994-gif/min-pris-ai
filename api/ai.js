import OpenAI from "openai";

export const config = {
  runtime: "nodejs"
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    const prompt = `
Lag en profesjonell tilbudstekst basert på:

Beskrivelse: ${data.beskrivelse}
Timepris: ${data.timepris}
Km per dag: ${data.km}
Avfall: ${data.avfall}
Forbruk: ${data.forbruk}
Totalpris: ${data.total}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.status(200).json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI-feil", details: err.message });
  }
}
