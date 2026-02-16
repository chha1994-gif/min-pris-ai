const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const customerId = req.cookies.stripeCustomerId;

    if (!customerId) {
      return res.status(400).json({ error: "Missing customerId" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://minpris.app"
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe portal error:", err);
    return res.status(500).json({
      error: err.message || "Portal failed"
    });
  }
};
