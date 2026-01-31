import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { tekst, timepris, km, avfall, forbruk } = req.body;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `Estimer antall arbeidstimer basert på teksten: "${tekst}". 
Svar kun med et tall.`,
    });

    const timer = parseInt(response.output[0].content[0].text);
    const dager = Math.ceil(timer / 7.5);

    const total =
      timer * timepris +
      km * 15 * dager +
      avfall +
      forbruk * dager;

    res.status(200).json({
      timer,
      dager,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Noe gikk galt" });
  }
}
