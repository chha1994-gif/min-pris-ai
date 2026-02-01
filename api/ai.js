import OpenAI from "openai";

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: "Svar bare: OK",
    });

    return res.status(200).json({
      text: response.output_text || "INGEN TEKST",
    });

  } catch (err) {
    console.error("AI TEST ERROR:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
}
