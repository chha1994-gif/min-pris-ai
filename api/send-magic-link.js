const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// MOCK store (bytt til KV senere)
const magicLinks = {};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    // ✅ Lag token
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Lagre token (10 min expiry mock)
    magicLinks[token] = {
      email,
      expires: Date.now() + 10 * 60 * 1000,
    };

    const link = https://minpris.app/login.html?token=${token};

    console.log("✨ Magic link:", link);

    await sgMail.send({
      to: email,
      from: "MinPris <kontakt@minpris.app>",
      subject: "Din magic link",
      html: `
        <h2>Logg inn i MinPris</h2>
        <p>Klikk for å logge inn:</p>
        <a href="${link}">${link}</a>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Magic link error:", err);
    return res.status(200).json({ success: true });
  }
};

// Eksporter store så verify-route kan lese den (mock only)
module.exports.magicLinks = magicLinks;
