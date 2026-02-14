import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
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
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  console.log("✅ Event:", event.type);

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object;

        console.log("🔥 Checkout completed");

        break;
      }

      case "invoice.paid": {
        console.log("💰 Invoice paid → Pro aktiv");
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;

        console.log("🔁 Subscription updated");

        const cancelled = sub.cancel_at_period_end;
        const periodEnd = sub.current_period_end;

        console.log("cancelled:", cancelled);
        console.log("periodEnd:", periodEnd);

        break;
      }

      case "customer.subscription.deleted": {
        console.log("❌ Subscription deleted → Pro AV");
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    res.status(200).json({ received: true });

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

/* 🔧 Raw body helper */
async function buffer(readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}
