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
      totalEksMva,
      totalInkMva,
      timepris,
      kmPerDag
    } = req.body;

    // Enkel validering – fail fast
    if (!beskrivelse || !timer || !dager || !totalEksMva) {
      return res.status(400).json({
        error: "Manglende data i kalkyle"
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
Du er en profesjonell norsk håndverker som skriver tilbud til kunde.

Jobbbeskrivelse:
${beskrivelse}

Kalkyle (ferdig beregnet – tallene er faste):
- Timer: ${timer}
- Dager: ${dager}
- Timepris: ${timepris} kr
- Arbeid: ${arbeid} kr
- Kjøring (${kmPerDag} km per dag): ${kjøring} kr
- Avfall: ${avfall} kr
- Materiell: ${materiell} kr
- HMS: ${hms} kr

Totalpris eks. mva: ${totalEksMva} kr
Totalpris inkl. mva: ${totalInkMva} kr

VIKTIG:
- Tallene over er endelige og skal ikke endres, tolkes eller justeres
- Ikke legg til nye kostnader
- Ikke rund av eller estimer priser
- Ikke bruk punktliste
- Ikke bruk emoji

Oppgave:
Skriv en kort, ryddig og profesjonell tilbudstekst på norsk basert på informasjonen over.
Avslutt med en høflig setning om at kunden gjerne kan ta kontakt ved spørsmål eller avklaringer.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const text =
      response.output?.[0]?.content?.[0]?.text ||
      "Kunne ikke generere tilbudstekst.";

    return res.status(200).json({ text });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({
      error: "AI failed",
      message: err.message
    });
  }
}
