import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { description, price } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du skriver profesjonelle tilbud til kunder i Norge."
        },
        {
          role: "user",
          content: `
Lag et kort og profesjonelt tilbud basert på dette:

Arbeid: ${description}
Totalpris: ${price} kr

Svar på norsk.
`
        }
      ]
    });

    res.status(200).json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI-feil" });
  }
}
