import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: "Skriv en kort, profesjonell tilbudstekst på norsk."
    });

    const text =
      completion.output[0].content[0].text || "Ingen tekst generert";

    return res.status(200).json({ text });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({
      error: "AI failed",
      message: err.message || String(err)
    });
  }
}
