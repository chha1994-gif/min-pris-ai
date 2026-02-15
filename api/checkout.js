const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

module.exports = async function handler(req, res) {
  console.log("🔥 Checkout API called");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("Missing STRIPE_PRICE_ID");
    }

    const { source } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      success_url:
        "https://minpris.app/?success=true&session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://minpris.app/?cancelled=true",

      metadata: {
        source: source || "unknown",
      },
    });

    console.log("✅ Session created:", session.id);

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("❌ Checkout error:", err.message);

    return res.status(500).json({
      error: err.message || "Checkout failed",
    });
  }
};
