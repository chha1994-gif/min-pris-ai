const { kv } = require("@vercel/kv");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "unknown";

    // 1️⃣ Finn Stripe customer først
    const customers = await stripe.customers.search({
      query: email:"${normalizedEmail}"
    });

    if (!customers.data.length) {
      return res.status(404).json({ error: "Fant ingen aktiv konto." });
    }

    const customer = customers.data[0];
    const customerId = customer.id;

    // 2️⃣ Bruk customerId som restore-key (ikke email)
    const key = "restore_" + customerId;

    // 3️⃣ Sjekk om restore brukt siste 30 dager
    const lastRestore = await kv.get(key);

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    if (lastRestore && now - lastRestore < THIRTY_DAYS) {
      return res.status(429).json({
        error: "Gjenoppretting kan kun brukes én gang per 30 dager."
      });
    }

    // 4️⃣ Sjekk aktivt abonnement
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5
    });

    const validStatuses = ["active", "trialing"];

    const hasActive = subs.data.some(sub =>
      validStatuses.includes(sub.status)
    );

    if (!hasActive) {
      return res.status(403).json({
        error: "Ingen aktivt abonnement funnet."
      });
    }

    // 5️⃣ Lagre restore timestamp (30 dager TTL)
    await kv.set(key, now, {
      ex: 60 * 60 * 24 * 30 // 30 dager
    });

    // 6️⃣ Logg restore (90 dager TTL)
    await kv.set("restore_log:" + now, {
      customerId,
      email: normalizedEmail,
      ip,
      timestamp: now
    }, {
      ex: 60 * 60 * 24 * 90 // 90 dager
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Restore error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
