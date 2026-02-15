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

  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks);

    event = stripe.webhooks.constructEvent(rawBody, sig, secret);

  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  console.log("✅ Event received:", event.type);

  // 🎯 HANDLE EVENTS SAFELY
  switch (event.type) {

    case "customer.subscription.updated": {
      const subscription = event.data.object;

      console.log("🔄 Subscription updated");
      console.log("📊 Status:", subscription.status);

      if (subscription.status === "active") {
        console.log("✅ Subscription ACTIVE → User should be PRO");
      }

      if (subscription.status === "trialing") {
        console.log("⏳ Subscription TRIAL → User should be PRO (trial)");
      }

      if (subscription.status === "past_due") {
        console.log("⚠️ Subscription PAST DUE");
      }

      if (subscription.status === "canceled") {
        console.log("❌ Subscription CANCELED → User should be FREE");
      }

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;

      console.log("❌ Subscription deleted");
      console.log("📊 Status:", subscription.status);
      console.log("🚫 User should be downgraded to FREE");

      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object;

      console.log("💳 Checkout completed");
      console.log("👤 Customer:", session.customer);
      console.log("🧾 Subscription:", session.subscription);

      break;
    }

    default:
      console.log("ℹ️ Unhandled event:", event.type);
  }

  // ✅ ALWAYS return 200 to Stripe
  res.status(200).json({ received: true });
};

// 🔐 CRITICAL FOR STRIPE
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
