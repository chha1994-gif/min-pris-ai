const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function handler(req, res) {
  console.log("📨 send-email called");
  console.log("📨 body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, subject, html } = req.body;

    if (!to) {
      console.log("❌ Missing 'to'");
      return res.status(200).json({ success: false });
    }

    const msg = {
      to,
      from: "kontakt@minpris.app",
      subject,
      html,
    };

    console.log("📨 Sending to:", to);

    await sgMail.send(msg);

    console.log("✅ Email sent");

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ SendGrid error:", err);
    return res.status(200).json({ success: false });
  }
};
