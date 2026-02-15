const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// 🚨 KRITISK for Stripe signature verification i Vercel
const config = {
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

  let event;

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks);

    event = stripe.webhooks.constructEvent(rawBody, sig, secret);

  } catch (err) {
    console.error("❌ Signature error:", err.message);

    // ✅ KORREKT TEMPLATE STRING (backticks!)
    return res.status(400).send(Webhook Error: ${err.message});
  }

  console.log("✅ Event received:", event.type);

  switch (event.type) {
    case "customer.subscription.updated":
      console.log("🔄 Subscription updated");
      break;

    case "customer.subscription.deleted":
      console.log("❌ Subscription cancelled");
      break;

    case "checkout.session.completed":
      console.log("💰 Checkout completed");
      break;

    default:
      console.log("ℹ️ Unhandled event:", event.type);
  }

  // ✅ ALLTID returner 200 til Stripe
  res.status(200).json({ received: true });
};

module.exports.config = config;
