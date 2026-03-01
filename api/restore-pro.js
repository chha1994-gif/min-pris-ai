import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  try {
    console.log("🔄 Restore attempt for session:", sessionId);

    // 1️⃣ Hent Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || !session.customer) {
      return res.status(400).json({ error: "Invalid session" });
    }

    const customerId = session.customer;

    // 2️⃣ Sjekk aktiv subscription
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const pro = subs.data.length > 0;

    console.log("🔎 Pro status:", pro, "Customer:", customerId);

    if (pro) {
      // 🔥 HttpOnly cookie (sikker server-side auth)
      res.setHeader(
        "Set-Cookie",
        stripeCustomerId=${customerId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000
      );
    }

    return res.status(200).json({
      pro,
      customerId
    });

  } catch (err) {
    console.error("❌ Restore error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
