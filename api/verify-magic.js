const { kv } = require("@vercel/kv");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    const token = req.query.token;

    if (!token) {
      console.log("❌ No token provided");
      return res.status(400).json({ valid: false });
    }

    const key = "magic:" + token;
    console.log("🔎 Looking for token:", key);

    const email = await kv.get(key);
    console.log("📨 Found email:", email);

    if (!email) {
      console.log("❌ Token not found or expired");
      return res.status(200).json({ valid: false });
    }

    // 🔎 Sjekk om bruker allerede har session
    const existingSessionId = await kv.get("user_session:" + email);

    if (existingSessionId) {
      console.log("♻️ Removing old session:", existingSessionId);
      await kv.del("session:" + existingSessionId);
    }

    // 🔐 Opprett ny session
    const sessionId = crypto.randomUUID();
    console.log("✅ Creating session:", sessionId);

    await kv.set("session:" + sessionId, email, {
      ex: 60 * 60 * 24 * 7
    });

    await kv.set("user_session:" + email, sessionId, {
      ex: 60 * 60 * 24 * 7
    });

    // 🍪 Sett cookie
    res.setHeader(
      "Set-Cookie",
      "minpris_session=" + sessionId +
      "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=" + (60 * 60 * 24 * 7)
    );

    // 🔥 Slett token ETTER session er opprettet
    await kv.del(key);
    console.log("🗑 Token deleted");

    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error("❌ verify-magic error:", err);
    return res.status(500).json({ valid: false });
  }
};
