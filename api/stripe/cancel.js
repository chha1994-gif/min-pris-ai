const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Missing customerId" });
    }

    // Finn aktivt abonnement
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1
    });

    if (!subscriptions.data.length) {
      return res.status(404).json({ error: "No active subscription" });
    }

    const subscription = subscriptions.data[0];

    // Kanseller ved periodeslutt
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Cancel subscription error:", err);
    return res.status(500).json({
      error: err.message || "Cancel failed"
    });
  }
};
