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
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo"
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

    const km = route.distanceMeters / 1000;

    let toll = 0;

    if (route.travelAdvisory?.tollInfo?.estimatedPrice?.length) {
      toll = Number(route.travelAdvisory.tollInfo.estimatedPrice[0].units || 0);
    }

    return res.status(200).json({
      km: Math.round(km * 10) / 10,
      toll
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });
  }
}
