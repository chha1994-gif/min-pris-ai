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

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        console.log("✅ Checkout completed");

        const session = event.data.object;

        console.log("Customer:", session.customer);
        console.log("Subscription:", session.subscription);

        // 👉 Her setter du PRO i databasen/localStorage/backend
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

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    res.status(500).send("Webhook handler failed");
  }
};

export const config = {
  api: {
    bodyParser: false, // 🔥 KRITISK for Stripe signature
  },
};
