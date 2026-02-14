const Stripe = require("stripe");
const { buffer } = require("micro");

export const config = {
  api: {
    bodyParser: false, // KRITISK for Stripe
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let event;

  try {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  // ✅ Håndter events
  switch (event.type) {
    case "checkout.session.completed":
      console.log("✅ Payment success:", event.data.object);
      break;

    case "customer.subscription.updated":
      console.log("🔁 Subscription updated:", event.data.object);
      break;

    case "customer.subscription.deleted":
      console.log("❌ Subscription cancelled:", event.data.object);
      break;

    default:
      console.log(Unhandled event type: ${event.type});
  }

  res.status(200).json({ received: true });
}
