
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du er en norsk håndverker som skriver profesjonelle tilbud.",
        },
        {
          role: "user",
          content: "Skriv en kort testtekst som bekrefter at API fungerer.",
        },
      ],
    });

    return res.status(200).json({
      text: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    return res.status(500).json({
      error: "AI crashed",
      details: error.message,
    });
  }
}
