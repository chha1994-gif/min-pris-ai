const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Tillat kun POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // 🔥 Viktig: Les RAW body (ikke req.body)
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks);

    // ✅ Verifiser Stripe signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }

  // 🎯 Håndter Stripe events
  switch (event.type) {

    case "checkout.session.completed":
      console.log("✅ Checkout completed");
      
      const session = event.data.object;
      console.log("Customer:", session.customer);
      console.log("Email:", session.customer_email);
      
      // 👉 Her kan du aktivere Pro / lagre i DB
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

  // ✅ Stripe krever 200 OK
  res.status(200).json({ received: true });
};
