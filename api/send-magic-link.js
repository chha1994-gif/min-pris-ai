const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const { kv } = require("@vercel/kv");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Lagre i KV
    await kv.set(magic_${token}, email, { ex: 600 });

    const link = https://minpris.app/login.html?token=${token};

    await sgMail.send({
      to: email,
      from: "MinPris <kontakt@minpris.app>",
      subject: "Din magic link",
      html: <a href="${link}">Logg inn</a>
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(200).json({ success: true });
  }
};
