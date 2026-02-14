export default async function handler(req, res) {
  console.log("🔥 webhook alive")

  return res.status(200).json({ ok: true })
}
