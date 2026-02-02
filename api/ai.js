import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      beskrivelse,
      timer,
      dager,
      arbeid,
      kjøring,
      avfall,
      materiell,
      hms,
      total,
      timepris,
      kmPerDag
    } = req.body;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
Du er en profesjonell håndverker som skriver tilbud til kunde.

Jobbbeskrivelse:
${beskrivelse}

Kalkyle:
- Timer: ${timer}
- Dager: ${dager}
- Timepris: ${timepris} kr
- Arbeid: ${arbeid} kr
- Kjøring (${kmPerDag} km/dag): ${kjøring} kr
- Avfall: ${avfall} kr
- Materiell: ${materiell} kr
- HMS: ${hms} kr

Totalpris: ${total} kr

Skriv en kort, ryddig og profesjonell tilbudstekst på norsk.
Ikke bruk punktliste.
Ikke bruk emoji.
Avslutt med at kunden kan ta kontakt ved spørsmål.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const text = response.output[0].content[0].text;

    return res.status(200).json({ text });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({
      error: "AI failed",
      message: err.message
    });
  }
}
