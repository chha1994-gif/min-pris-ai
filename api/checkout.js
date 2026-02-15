const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
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

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // 🔥 OPPRETT CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      // 🔥 KRITISK → webhook kan koble Stripe → bruker
      metadata: {
        userId: userId,
      },

      success_url:
        "https://min-pris-ai.vercel.app/?success=true&session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://min-pris-ai.vercel.app/?canceled=true",
    });

    return res.status(200).json({
      url: session.url,
    });

  } catch (err) {
    console.error("❌ Stripe checkout error:", err);

    return res.status(500).json({
      error: err.message || "Stripe checkout failed",
    });
  }
};
