import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const {
      tekst,
      timepris,
      kmPerDag,
      avfall,
      forbrukPerDag
    } = req.body;

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Hvor mange arbeidstimer vil denne jobben ta?
Svar kun med et tall.

Jobb:
${tekst}
`
        }
      ]
    });

    const timer = parseInt(ai.choices[0].message.content);
    const dager = Math.ceil(timer / 7.5);

    const total =
      (timer * timepris) +
      (dager * kmPerDag * 15) +
      (dager * forbrukPerDag) +
      Number(avfall);

    res.json({
      timer,
      dager,
      total
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
