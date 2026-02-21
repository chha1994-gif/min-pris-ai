
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const customerId =
  req.cookies.stripeCustomerId || req.body.customerId;

console.log("CustomerId resolved:", JSON.stringify(customerId));

if (!customerId) {
  return res.status(200).json({ pro: false });
}

const subscriptions = await stripe.subscriptions.list({
  customer: customerId,
  status: "all",
  limit: 10,
});

const isPro = subscriptions.data.some(
  sub => sub.status === "active" || sub.status === "trialing"
);

return res.status(200).json({ pro: isPro });

  } catch (err) {
    console.error("❌ check-pro error:", err);

    // KRITISK: Ikke returner 500 → ødelegger frontend state
    return res.status(200).json({ pro: false });
  }
};
