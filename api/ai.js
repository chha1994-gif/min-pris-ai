const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Svar kun med teksten OK." },
        { role: "user", content: "Test" },
      ],
    });

    return res.status(200).json({
      text: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI CRASH:", err);
    return res.status(500).json({
      error: "AI failed",
      message: err.message,
    });
  }
};
