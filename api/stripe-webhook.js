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
    console.error("❌ Signature verification failed:", err.message);
    return res.status(400).send("Webhook Error");
  }

  try {
    console.log("📨 Event:", event.type);

    switch (event.type) {

      // ✅ Checkout fullført → aktiver Pro
      case "checkout.session.completed": {
        const session = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
          { expand: ["customer", "customer_details"] }
        );

        const email =
          session.customer_details?.email ||
          session.customer?.email;

        const customerId = session.customer?.id;

        console.log("✅ Checkout completed");
        console.log("Customer:", customerId);
        console.log("Email:", email);

        if (email && customerId) {
          await saveProUser(email, customerId);
        }

        break;
      }

      // 🔄 Subscription oppdatert (valgfri logging)
      case "customer.subscription.updated": {
        const sub = event.data.object;

        console.log("🔄 Subscription updated:", {
          customer: sub.customer,
          status: sub.status,
        });

        break;
      }

      // ❌ Subscription slettet → fjern Pro
      case "customer.subscription.deleted": {
        const sub = event.data.object;

        console.log("❌ Subscription cancelled:", sub.customer);

        await removeProByCustomerId(sub.customer);

        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
  }

  // ✅ ALLTID 200 til Stripe
  return res.status(200).json({ received: true });
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};


// ------------------------------------------------------------------
// ✅ MOCK STORAGE (BYTT TIL DB / KV SENERE)
// ------------------------------------------------------------------

const proUsers = {}; // midlertidig memory store

async function saveProUser(email, customerId) {
  console.log("🎯 Activating Pro for:", email);

  proUsers[email] = {
    customerId,
    activatedAt: Date.now(),
  };
}

async function removeProByCustomerId(customerId) {
  console.log("🧹 Removing Pro for customer:", customerId);

  for (const email in proUsers) {
    if (proUsers[email].customerId === customerId) {
      delete proUsers[email];
      console.log("❌ Pro removed for:", email);
    }
  }
}
