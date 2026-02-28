const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(200).json({ pro: false });
    }

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
    });

    const active = subs.data.some(sub =>
      ["active", "trialing"].includes(sub.status)
    );

    return res.status(200).json({ pro: active });

  } catch (err) {
    console.error("check-pro error:", err);
    return res.status(200).json({ pro: false });
  }
};
