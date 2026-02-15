const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// 🔥 KRITISK for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // ✅ KORREKT TEMPLATE STRING (BACKTICKS)
    return res.status(400).send(Webhook Error: ${err.message});
  }

  console.log("✅ Event received:", event.type);

  // 🎯 Handle Stripe events
  switch (event.type) {
    case "customer.subscription.updated":
      console.log("🔄 Subscription updated");
      break;

    case "customer.subscription.deleted":
      console.log("❌ Subscription cancelled");
      break;

    case "checkout.session.completed":
      console.log("💳 Checkout completed");
      break;

    default:
      console.log("ℹ️ Unhandled event:", event.type);
  }

  // ✅ ALWAYS respond 200 to Stripe
  res.status(200).json({ received: true });
};
