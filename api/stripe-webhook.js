import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false, // Stripe krever raw body
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    const buf = await buffer(req);

    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  // ✅ Handle Stripe events
  switch (event.type) {

    case "checkout.session.completed":
      const session = event.data.object;
      console.log("✅ Payment success:", session.id);
      break;

    case "customer.subscription.updated":
      console.log("🔄 Subscription updated");
      break;

    case "customer.subscription.deleted":
      console.log("❌ Subscription cancelled");
      break;

    default:
      console.log(Unhandled event type: ${event.type});
  }

  res.status(200).json({ received: true });
}

// 🔥 Helper: read raw body
async function buffer(readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}
