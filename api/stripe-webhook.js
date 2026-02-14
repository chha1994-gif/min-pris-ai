const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  switch (event.type) {
    case "checkout.session.completed":
      console.log("✅ Payment success");
      break;

    case "customer.subscription.deleted":
      console.log("❌ Subscription cancelled");
      break;

    case "customer.subscription.updated":
      console.log("🔄 Subscription updated");
      break;

    default:
      console.log(Unhandled event type: ${event.type});
  }

  res.status(200).json({ received: true });
};
