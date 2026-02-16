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

    // Hent subscriptions fra Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    const sub = subscriptions.data[0];

    const isPro = sub && sub.status === "active";

    console.log("🔎 Pro check:", {
      customerId,
      status: sub ? sub.status : "none",
      isPro,
    });

    return res.status(200).json({ isPro });

  } catch (err) {
    console.error("❌ Check-pro error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
