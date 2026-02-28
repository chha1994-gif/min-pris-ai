const crypto = require("crypto");
const { kv } = require("@vercel/kv");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function handler(req, res) {

  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);
  console.log("API KEY EXISTS:", !!process.env.SENDGRID_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const token = crypto.randomUUID();

    await kv.set("magic:" + token, email, { ex: 900 });

    const link = "https://minpris.app/login.html?token=" + token;

    await sgMail.send({
      to: email,
      from: {
        email: "kontakt@minpris.app",
        name: "MinPris"
      },
      subject: "Logg inn i MinPris",
      html:
        "<h2>MinPris</h2>" +
        "<p>Klikk for å logge inn:</p>" +
        "<a href=\"" + link + "\">Åpne MinPris</a>" +
        "<p>Linken utløper om 15 minutter.</p>"
    });

    console.log("MAIL SENT OK");

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("SENDGRID ERROR FULL:", err.response?.body || err);
    return res.status(500).json({ ok: false });
  }
};
