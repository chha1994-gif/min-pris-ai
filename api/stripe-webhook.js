const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  console.log("🔥 webhook hit");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  console.log("✅ Event type:", event.type);

  res.status(200).json({ received: true });
};
