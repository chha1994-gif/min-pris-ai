import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  const { tekst, timepris, km, avfall, forbruk } = req.body;

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Estimer antall arbeidstimer basert på teksten:
"${tekst}"
Svar kun med et tall.`
      }
    ]
  });

  const timer = parseInt(ai.choices[0].message.content);
  const dager = Math.ceil(timer / 7.5);

  const total =
    timer * timepris +
    km * 15 * dager +
    avfall +
    forbruk * dager;

  res.json({
    timer,
    total,
    tekst: Arbeidet omfatter ${tekst}.
  });
}
