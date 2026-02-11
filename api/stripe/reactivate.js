const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: "Missing subscriptionId" });
    }

    const sub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    res.status(200).json({ success: true, status: sub.status });

  } catch (err) {
    console.error("Reactivate error:", err);
    res.status(500).json({ error: err.message });
  }
};
