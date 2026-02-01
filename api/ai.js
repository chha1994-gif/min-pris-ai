17:06
Du har sendt
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const data = req.body;

    const prompt = `
Lag en profesjonell tilbudstekst basert på dette:

Arbeid: ${data.tekst}
Timer: ${data.timer}
Dager: ${data.dager}
Arbeid: ${data.arbeid} kr
Kjøring: ${data.kjøring} kr
Forbruk: ${data.forbruk} kr
Avfall: ${data.avfall} kr
Totalpris: ${data.total} kr

Skriv høflig, profesjonelt og klart.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({
      tekst: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI-feil" });
  }
}
