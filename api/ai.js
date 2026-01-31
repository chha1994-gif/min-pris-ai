import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { tekst, timepris, km, avfall, forbruk } = req.body;

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Estimer antall arbeidstimer basert på denne teksten:
"${tekst}"

Svar KUN med et tall (timer).
`
        }
      ]
    });

    const timer = parseInt(ai.choices[0].message.content);
    const dager = Math.ceil(timer / 7.5);

    const arbeidskost = timer * timepris;
    const reisekost = dager * km * 5;
    const forbrukTotalt = dager * forbruk;

    const sumEks = arbeidskost + reisekost + avfall + forbrukTotalt;
    const mva = Math.round(sumEks * 0.25);
    const total = sumEks + mva;

    res.status(200).json({
      timer,
      dager,
      pris_eks: sumEks,
      mva,
      total
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
