const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

module.exports = async function handler(req, res) {
  console.log("🔥 Stripe webhook called");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  console.log("✅ Event received:", event.type);

  // 🎯 Håndter events du bryr deg om
  switch (event.type) {

    case "checkout.session.completed":
      console.log("💳 Checkout completed");
      break;

    case "customer.subscription.updated":
      const sub = event.data.object;

      console.log("📦 Subscription updated:");
      console.log("Status:", sub.status);
      console.log("Cancel at period end:", sub.cancel_at_period_end);
      console.log("Period end:", sub.current_period_end);
      break;

    case "customer.subscription.deleted":
      console.log("🛑 Subscription deleted");
      break;

    case "invoice.paid":
      console.log("💰 Invoice paid");
      break;

    default:
      console.log("ℹ️ Unhandled event type");
  }

  return res.status(200).json({ received: true });
};

// 🚨 KRITISK for Stripe signature verification
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
