export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { start, end } = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: "Start eller slutt mangler" });
    }

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_BACKEND_KEY,
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.travelAdvisory.tollInfo"
        },
        body: JSON.stringify({
          origin: { address: start },
          destination: { address: end },
          travelMode: "DRIVE",
          extraComputations: ["TOLLS"]
        })
      }
    );

    const data = await response.json();
    const route = data.routes?.[0];

    const distanceMeters = route?.distanceMeters || 0;
    const tolls =
      route?.travelAdvisory?.tollInfo?.estimatedPrice?.[0]?.units || 0;

    res.status(200).json({
      distanceMeters,
      tolls
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfeil" });
  }
}
