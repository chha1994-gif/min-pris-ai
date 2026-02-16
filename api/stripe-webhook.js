const Stripe = require("stripe");
const getRawBody = require("raw-body");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  console.log("🔥 Stripe webhook called");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  try {
    switch (event.type) {

      case "checkout.session.completed":
        console.log("✅ Checkout completed");

        const session = event.data.object;

        console.log("Session ID:", session.id);
        console.log("Customer:", session.customer);

        // TODO: aktiver Pro / lagre i DB
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

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).send("Webhook handler failed");
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
