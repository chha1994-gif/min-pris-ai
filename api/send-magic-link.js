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

    console.log("📨 Magic link requested for:", email);

    // ✅ Generer token
    const token = crypto.randomUUID();

    // ✅ Lagre token → email (15 min expiry)
    await kv.set(magic:${token}, email, { ex: 900 });

    const link = https://minpris.app/login.html?token=${token};

    // ✅ SendGrid request
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: Bearer ${process.env.SENDGRID_API_KEY},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: "Logg inn i MinPris",
          },
        ],
        from: {
          email: "kontakt@minpris.app", // må være verifisert i SendGrid
          name: "MinPris",
        },
        content: [
          {
            type: "text/html",
            value: `
              <h2>MinPris</h2>
              <p>Klikk for å logge inn:</p>
              <a href="${link}">Åpne MinPris</a>
              <p>Linken utløper om 15 minutter.</p>
            `,
          },
        ],
      }),
    });

    console.log("📬 SendGrid status:", response.status);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("❌ Magic link error:", err);
    return res.status(200).json({ ok: false }); // aldri 500 til frontend
  }
};
