
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
    console.log("Stripe key prefix:", process.env.STRIPE_SECRET_KEY?.slice(0, 7));

    if (!customerId) {
      return res.status(200).json({ pro: false }); 
      // Ikke 400 → unngå UI-feil
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    const sub = subscriptions.data.length
      ? subscriptions.data[0]
      : null;

    const isPro =
      sub &&
      (sub.status === "active" || sub.status === "trialing");

    return res.status(200).json({ pro: isPro });

  } catch (err) {
    console.error("❌ check-pro error:", err);

    // KRITISK: Ikke returner 500 → ødelegger frontend state
    return res.status(200).json({ pro: false });
  }
};
