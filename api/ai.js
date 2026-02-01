import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const d = req.body;

    const prompt = `
Lag et profesjonelt tilbud:

Arbeid: ${d.tekst}
Timer: ${d.timer}
Dager: ${d.dager}
Arbeid: ${d.arbeid} kr
Kjøring: ${d.kjøring} kr
Forbruk: ${d.forbruk} kr
Avfall: ${d.avfall} kr
Totalpris: ${d.total} kr
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ text: completion.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: "AI-feil" });
  }
}
