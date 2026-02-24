import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, text, html } = req.body;

  if (!to) {
    return res.status(400).json({ error: "Missing recipient" });
  }

  try {
    await sgMail.send({
      to,
      from: "MinPris <post@minpris.app>", // må være verified i SendGrid
      subject: subject || "MinPris",
      text: text || "",
      html: html || "",
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("SENDGRID ERROR:", error.response?.body || error);
    return res.status(500).json({ error: "Email failed" });
  }
}
