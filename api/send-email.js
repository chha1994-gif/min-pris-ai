const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, html } = req.body;

  if (!to) {
    return res.status(400).json({ error: "Missing recipient" });
  }

  const safeHtml = html || "<p>Test OK</p>";

  try {
    await sgMail.send({
      to,
      from: "MinPris <post@minpris.app>",
      subject: subject || "MinPris",
      html: safeHtml,
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("SENDGRID ERROR:", error.response?.body || error);
    res.status(500).json({ error: "Email failed" });
  }
};
