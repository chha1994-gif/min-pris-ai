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
      timepris,

      arbeid,
      kjøring,
      bom,
      avfall,
      materiell,
      hms,

      kmPerDag,

      totalEksMva,
      totalInkMva
    } = req.body;

    if (
      beskrivelse == null ||
      timer == null ||
      dager == null ||
      totalEksMva == null
    ) {
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

Kalkyle (ferdig beregnet – tallene er endelige):
Arbeid (${timer} timer × ${timepris} kr): ${arbeid} kr
Kjøring (${kmPerDag} km per dag i ${dager} dager): ${kjøring} kr
Bom: ${bom} kr
Avfall: ${avfall} kr
Materiell: ${materiell} kr
HMS-forbruk: ${hms} kr

Totalt eks. mva: ${totalEksMva} kr
Totalt inkl. mva: ${totalInkMva} kr

VIKTIG – MÅ FØLGES:
- Alle tall over er endelige og skal brukes nøyaktig slik de er oppgitt
- Ikke endre, tolke, estimere eller runde tall
- Ikke legg til nye kostnader eller forutsetninger
- Ikke bruk emoji

Oppgave:
Skriv en profesjonell og ryddig tilbudstekst på norsk.
Del gjerne opp i avsnitt.
Forklar kort hva tilbudet inkluderer.
Avslutt med en høflig setning om at kunden gjerne kan ta kontakt ved spørsmål.
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
