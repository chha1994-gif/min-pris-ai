const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    let customerId, email;

    // GET support
    if (req.method === "GET") {
      customerId = req.query.customerId;
      email = req.query.email;
    }

    // POST support
    if (req.method === "POST") {
      ({ customerId, email } = req.body);
    }

    console.log("📨 check-pro request:", { customerId, email });

    const validStatuses = ["active", "trialing"];

    // 🔹 Hvis vi allerede har customerId
    if (customerId) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });

      console.log(
        "📦 Subscriptions for customer:",
        subs.data.map(s => ({ id: s.id, status: s.status }))
      );

      const isPro = subs.data.some(sub =>
        validStatuses.includes(sub.status)
      );

      return res.status(200).json({
        pro: isPro,
        customerId,
      });
    }

    // 🔹 Robust email search
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();

      const customers = await stripe.customers.search({
        query: email:"${normalizedEmail}",
      });

      if (!customers.data.length) {
        console.log("❌ No customers found for email:", normalizedEmail);
        return res.status(200).json({ pro: false });
      }

      console.log(
        "👥 Found customers:",
        customers.data.map(c => c.id)
      );

      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: "all",
          limit: 10,
        });

        console.log(
         📦 Subscriptions for ${customer.id}:`,
          subs.data.map(s => ({ id: s.id, status: s.status }))
        );

        const hasActive = subs.data.some(sub =>
          validStatuses.includes(sub.status)
        );

        if (hasActive) {
          return res.status(200).json({
            pro: true,
            customerId: customer.id,
          });
        }
      }

      return res.status(200).json({ pro: false });
    }

    return res.status(200).json({ pro: false });

  } catch (err) {
    console.error("❌ check-pro error:", err);
    return res.status(200).json({ pro: false });
  }
};
