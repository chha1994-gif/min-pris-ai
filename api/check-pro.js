const Stripe = require("stripe");
const { kv } = require("@vercel/kv");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/minpris_session=([^;]+)/);

    if (!match) {
      return res.status(200).json({ pro: false });
    }

    const sessionId = match[1];

    // 🔎 Finn email fra session
    const email = await kv.get("session:" + sessionId);

    if (!email) {
      return res.status(200).json({ pro: false });
    }

    // 🔍 Stripe lookup
    const customers = await stripe.customers.search({
      query: 'email:"' + email + '"',
    });

    if (!customers.data.length) {
      return res.status(200).json({ pro: false });
    }

    const validStatuses = ["active", "trialing"];

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
      });

      const hasActive = subs.data.some(sub =>
        validStatuses.includes(sub.status)
      );

      if (hasActive) {
        return res.status(200).json({ pro: true });
      }
    }

    return res.status(200).json({ pro: false });

  } catch (err) {
    console.error("check-pro error:", err);
    return res.status(200).json({ pro: false });
  }
};
