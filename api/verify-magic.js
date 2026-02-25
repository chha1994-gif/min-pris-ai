const { magicLinks } = require("./send-magic-link");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false });
  }

  try {
    const { token } = req.body;

    const record = magicLinks[token];

    if (!record) {
      return res.status(200).json({ valid: false });
    }

    if (Date.now() > record.expires) {
      delete magicLinks[token];
      return res.status(200).json({ valid: false });
    }

    // ✅ Engangsbruk
    delete magicLinks[token];

    return res.status(200).json({
      valid: true,
      email: record.email,
    });

  } catch (err) {
    console.error("❌ Verify magic error:", err);
    return res.status(200).json({ valid: false });
  }
};
