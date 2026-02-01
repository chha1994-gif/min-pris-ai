import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const {
      tekst,
      timer,
      dager,
      arbeid,
      kjøring,
      forbruk,
      avfall,
      total
    } = req.body;

    const prompt = `
Lag en profesjonell tilbudstekst basert på dette:

Arbeid: ${tekst}
Timer: ${timer}
Dager: ${dager}
Arbeid: ${arbeid} kr
Kjøring: ${kjøring} kr
Forbruk: ${forbruk} kr
Avfall: ${avfall} kr
Totalpris: ${total} kr
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
    res.status(500).json({ error: "AI-feil" });
  }
}
