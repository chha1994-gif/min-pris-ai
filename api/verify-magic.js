const { kv } = require("@vercel/kv");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false });
  }

  try {
    const { token } = req.body;

    const email = await kv.get(magic_${token});

    if (!email) {
      return res.status(200).json({ valid: false });
    }

    // ✅ Engangsbruk
    await kv.del(magic_${token});

    return res.status(200).json({
      valid: true,
      email
    });

  } catch (err) {
    console.error(err);
    return res.status(200).json({ valid: false });
  }
};
