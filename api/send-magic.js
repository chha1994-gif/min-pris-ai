const crypto = require("crypto");
const { kv } = require("@vercel/kv");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    console.log("Magic link requested for:", email);

    const token = crypto.randomUUID();

    // ✅ String concatenation instead of backticks
    await kv.set("magic:" + token, email, { ex: 900 });

    const link = "https://minpris.app/login.html?token=" + token;

    console.log("Generated link:", link);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Magic link error:", err);
    return res.status(200).json({ ok: false });
  }
};
