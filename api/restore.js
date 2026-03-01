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

    // 🔧 JUSTER DISSE TO
    const MAX_RESTORES = 1; // ← Endre denne senere hvis du vil
    const WINDOW_DAYS = 30;

    const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

    // 1️⃣ Finn Stripe customer
    const customers = await stripe.customers.search({
      query: email:"${normalizedEmail}"
    });

    if (!customers.data.length) {
      return res.status(404).json({ error: "Fant ingen aktiv konto." });
    }

    const customer = customers.data[0];
    const customerId = customer.id;

    const key = "restore_usage_" + customerId;

    // 2️⃣ Hent eksisterende restore-historikk
    let usage = await kv.get(key);
    usage = usage || [];

    // 3️⃣ Fjern restores eldre enn WINDOW
    usage = usage.filter(ts => now - ts < WINDOW_MS);

    if (usage.length >= MAX_RESTORES) {
      return res.status(429).json({
        error: Gjenoppretting kan kun brukes ${MAX_RESTORES} ganger per ${WINDOW_DAYS} dager.
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

    // 5️⃣ Registrer nytt restore
    usage.push(now);

    await kv.set(key, usage, {
      ex: 60 * 60 * 24 * WINDOW_DAYS
    });

    // 6️⃣ Logg restore (90 dager)
    await kv.set("restore_log:" + now, {
      customerId,
      email: normalizedEmail,
      ip,
      timestamp: now
    }, {
      ex: 60 * 60 * 24 * 90
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Restore error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
