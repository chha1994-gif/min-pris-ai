export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { start, end } = req.body;

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_BACKEND_KEY,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
        },
        body: JSON.stringify({
          origin: { address: start },
          destination: { address: end },
          travelMode: "DRIVE"
        })
      }
    );

    const data = await response.json();

    const route = data.routes?.[0];
    if (!route) {
      return res.status(400).json({ error: "Ingen rute funnet" });
    }

    const km = route.distanceMeters / 1000;

    res.status(200).json({ km });

  } catch (err) {
    res.status(500).json({ error: "Feil ved beregning", details: err.message });
  }
}
