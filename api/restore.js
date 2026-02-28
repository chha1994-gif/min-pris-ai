const { kv } = require("@vercel/kv");
const Stripe = require("stripe");

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

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "unknown";

    const now = Date.now();
    const key = "restore:" + email.toLowerCase();

    // 🔎 Sjekk om brukt siste 30 dager
    const lastRestore = await kv.get(key);

    if (lastRestore && now - lastRestore < 30 * 24 * 60 * 60 * 1000) {
      return res.status(429).json({
        error: "Gjenoppretting kan kun brukes én gang per 30 dager."
      });
    }

    // 🔍 Sjekk Stripe for aktivt abonnement
    const customers = await stripe.customers.search({
      query: 'email:"' + email + '"'
    });

    if (!customers.data.length) {
      return res.status(404).json({ error: "Fant ingen aktiv konto." });
    }

    const validStatuses = ["active", "trialing"];
    let hasActive = false;

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all"
      });

      if (subs.data.some(sub => validStatuses.includes(sub.status))) {
        hasActive = true;
        break;
      }
    }

    if (!hasActive) {
      return res.status(404).json({ error: "Ingen aktivt abonnement funnet." });
    }

    // ✅ Logg restore
    await kv.set(key, now);

    await kv.set("restore_log:" + now, {
      email,
      ip,
      timestamp: now
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Restore error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
