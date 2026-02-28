const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1️⃣ Kun les customerId fra HttpOnly cookie
    const customerId = req.cookies.stripeCustomerId;

    if (!customerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // 2️⃣ Verifiser at abonnement finnes (ekstra sikkerhet)
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    if (!subs.data.length) {
      return res.status(403).json({ error: "No subscription found" });
    }

    // 3️⃣ Lag Stripe Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://minpris.app"
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe portal error:", err);
    return res.status(500).json({ error: "Portal failed" });
  }
};
