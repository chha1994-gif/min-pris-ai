const { kv } = require("@vercel/kv");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({ valid: false });
    }

    // 🔎 Finn email fra magic token
    const email = await kv.get("magic:" + token);

    if (!email) {
      return res.status(200).json({ valid: false });
    }

    // 🔥 Engangsbruk – slett token
    await kv.del("magic:" + token);

    // 🔐 Opprett session
    const sessionId = crypto.randomUUID();

    // Lagre session i 7 dager
    await kv.set("session:" + sessionId, email, { ex: 60 * 60 * 24 * 7 });

    // 🍪 Sett HttpOnly cookie
    res.setHeader("Set-Cookie",
      "minpris_session=" + sessionId +
      "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=" + (60 * 60 * 24 * 7)
    );

    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error("verify-magic error:", err);
    return res.status(500).json({ valid: false });
  }
};
