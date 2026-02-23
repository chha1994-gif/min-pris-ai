import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  try {
    const { customerId } = req.body

    if (!customerId) {
      return res.status(200).json({ success: true })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://minpris.app"
    })

    return res.status(200).json({
      success: true,
      url: session.url
    })

  } catch (err) {
    console.error("Stripe portal error:", err)
    return res.status(200).json({ success: true })
  }
}
