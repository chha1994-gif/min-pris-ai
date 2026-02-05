export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { start, end } = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: "Start og sluttadresse mangler" });
    }

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 👇 VIKTIG: backend-key fra Vercel
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

    if (!data.routes || !data.routes.length) {
      return res.status(500).json({ error: "Ingen rute funnet", data });
    }

    const route = data.routes[0];

    return res.status(200).json({
      distanceMeters: route.distanceMeters,
      duration: route.duration
    });

  } catch (err) {
    console.error("Routes API error:", err);
    return res.status(500).json({ error: "Serverfeil" });
  }
}
