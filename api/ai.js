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
Arbeid: ${arbeid} kr
Kjøring (${kmPerDag} km per dag i ${dager} dager): ${kjøring} kr
Avfall: ${avfall} kr
Materiell: ${materiell} kr
HMS-forbruk: ${hms} kr

Timer totalt: ${timer}
Antall dager: ${dager}
Timepris: ${timepris} kr

Totalpris eks. mva: ${totalEksMva} kr
Totalpris inkl. mva: ${totalInkMva} kr

VIKTIG – MÅ FØLGES:
- Alle tall over er endelige og skal brukes nøyaktig slik de er oppgitt
- Ikke endre, tolke, estimere eller runde tall
- Ikke legg til nye kostnader eller forutsetninger
- Ikke bruk emoji

Oppgave:
Skriv en profesjonell og ryddig tilbudstekst på norsk.
Du bestemmer selv struktur, rekkefølge og avsnitt.
Forklar kort hva tilbudet inkluderer.
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
