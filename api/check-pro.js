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

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    const sub = subscriptions.data.length ? subscriptions.data[0] : null;

    const isPro =
      sub &&
      (sub.status === "active" || sub.status === "trialing");

    return res.status(200).json({ isPro });

  } catch (err) {
    console.error("❌ check-pro error:", err);
    return res.status(500).json({
      error: err.message || "Server error",
    });
  }
};
