const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    let customerId, email;

    // ✅ Støtt GET
    if (req.method === "GET") {
      customerId = req.query.customerId;
      email = req.query.email;
    }

    // ✅ Støtt POST
    if (req.method === "POST") {
      ({ customerId, email } = req.body);
    }

    console.log("📨 check-pro:", { customerId, email });

    let resolvedCustomerId = customerId;

    // Email fallback
    if (!resolvedCustomerId && email) {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (!customers.data.length) {
        return res.status(200).json({ pro: false });
      }

      resolvedCustomerId = customers.data[0].id;
    }

    if (!resolvedCustomerId) {
      return res.status(200).json({ pro: false });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: resolvedCustomerId,
      status: "all",
      limit: 10,
    });

    const validStatuses = ["active", "trialing"];

    const isPro = subscriptions.data.some(sub =>
      validStatuses.includes(sub.status)
    );

    return res.status(200).json({
      pro: isPro,
      customerId: resolvedCustomerId,
    });

  } catch (err) {
    console.error("❌ check-pro error:", err);
    return res.status(200).json({ pro: false });
  }
};
