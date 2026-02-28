module.exports = async function handler(req, res) {

  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({ ok: true, test: "Route works" });
};
