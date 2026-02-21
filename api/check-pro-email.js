import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { email } = req.body;

  if (!email) return res.json({ pro:false });

  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1
    });

    if (!customers.data.length) {
      return res.json({ pro:false });
    }

    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({
  customer: customerId,
  status: "all",
  limit: 10
});

const pro = subs.data.some(
  sub => sub.status === "active" || sub.status === "trialing"
);

    res.json({ pro, customerId });

  } catch {
    res.json({ pro:false });
  }
}
