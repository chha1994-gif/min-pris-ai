01:09
Du har sendt
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Svar kun med tekst." },
        { role: "user", content: "Si hei og bekreft at API fungerer." }
      ],
      max_tokens: 50,
    });

    res.status(200).json({
      text: response.choices[0].message.content,
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({
      error: err.message || "Unknown error",
    });
  }
}
