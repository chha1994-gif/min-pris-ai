const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    var customerId;
    var email;

    if (req.method === "GET") {
      customerId = req.query.customerId;
      email = req.query.email;
    }

    if (req.method === "POST") {
      customerId = req.body.customerId;
      email = req.body.email;
    }

    console.log("check-pro request:", customerId, email);

    var validStatuses = ["active", "trialing"];

    // 🔹 Hvis customerId finnes
    if (customerId) {
      var subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });

      var isPro = subs.data.some(function (sub) {
        return validStatuses.includes(sub.status);
      });

      return res.status(200).json({
        pro: isPro,
        customerId: customerId,
      });
    }

    // 🔹 Email fallback
    if (email) {
      var normalizedEmail = email.trim().toLowerCase();

      var customers = await stripe.customers.search({
        query: 'email:"' + normalizedEmail + '"',
      });

      if (!customers.data.length) {
        return res.status(200).json({ pro: false });
      }

      for (var i = 0; i < customers.data.length; i++) {
        var customer = customers.data[i];

        var subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: "all",
          limit: 10,
        });

        var hasActive = subs.data.some(function (sub) {
          return validStatuses.includes(sub.status);
        });

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
    console.error("check-pro error:", err);
    return res.status(200).json({ pro: false });
  }
};
