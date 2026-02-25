const { kv } = require("@vercel/kv");

module.exports = async function handler(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(200).json({ valid: false });
    }

    console.log("🔑 Verifying token:", token);

    const email = await kv.get(magic:${token});

    if (!email) {
      console.log("❌ Token invalid / expired");
      return res.status(200).json({ valid: false });
    }

    // ✅ Slett token etter bruk
    await kv.del(magic:${token});

    console.log("✅ Token valid for:", email);

    return res.status(200).json({
      valid: true,
      email,
    });

  } catch (err) {
    console.error("❌ Verify error:", err);
    return res.status(200).json({ valid: false });
  }
};
