import OpenAI from "openai";

export const config = {
  runtime: "nodejs"
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const d = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Lag en profesjonell tilbudstekst:

Arbeid: ${d.tekst}
Timer: ${d.timer}
Dager: ${d.dager}
Arbeid: ${d.arbeid} kr
Kjøring: ${d.kjoring} kr
Forbruk: ${d.forbruk} kr
Avfall: ${d.avfall} kr
Total: ${d.total} kr
`
        }
      ]
    });

    res.status(200).json({
      text: completion.choices[0].message.content
    });
  } catch (err) {
    res.status(500).json({ error: "AI-feil" });
  }
}
