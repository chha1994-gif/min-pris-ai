import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false, // ⚠️ KRITISK for Stripe webhook
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send("Webhook Error");
  }

  console.log("📩 Stripe event:", event.type);

  switch (event.type) {

    case "checkout.session.completed":
      console.log("✅ Checkout fullført");
      break;

    case "customer.subscription.updated":
      console.log("🔁 Subscription oppdatert");
      break;

    case "customer.subscription.deleted":
      console.log("❌ Subscription slettet");
      break;

    case "invoice.paid":
      console.log("💰 Faktura betalt");
      break;

    case "invoice.payment_failed":
      console.log("⚠️ Betaling feilet");
      break;

    default:
      console.log("Unhandled event:", event.type);
  }

  res.status(200).json({ received: true });
}
