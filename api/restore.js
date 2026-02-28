const Stripe = require("stripe");
const { kv } = require("@vercel/kv");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const key = "restore:" + email.toLowerCase();

    // 🔎 Sjekk om restore brukt siste 30 dager
    const lastRestore = await kv.get(key);

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    if (lastRestore && Date.now() - Number(lastRestore) < THIRTY_DAYS) {
      return res.status(429).json({
        error: "Restore limit reached. Please wait before trying again."
      });
    }

    // 🔎 Finn Stripe customer via e-post
    const customers = await stripe.customers.search({
      query: email:"${email}"
    });

    if (!customers.data.length) {
      return res.status(404).json({ error: "No active account found." });
    }

    const customer = customers.data[0];

    // 🔎 Sjekk aktiv subscription
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1
    });

    if (!subs.data.length) {
      return res.status(403).json({ error: "No active subscription." });
    }

    // ✅ Sett HttpOnly cookie
    res.setHeader(
      "Set-Cookie",
      stripeCustomerId=${customer.id}; Path=/; HttpOnly; Secure; SameSite=Lax
    );

    // ✅ Logg restore-tidspunkt
    await kv.set(key, Date.now());

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Restore error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
