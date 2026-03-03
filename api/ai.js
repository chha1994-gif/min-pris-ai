const OpenAI = require("openai");

module.exports = async function handler(req, res) {
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
      totalInkMva,

      ekstraPoster
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

    const round = 👎 => Math.round(Number(n) || 0);

    // 🔥 Rund alle tall før de sendes til AI
    const arbeidR = round(arbeid);
    const kjøringR = round(kjøring);
    const bomR = round(bom);
    const avfallR = round(avfall);
    const materiellR = round(materiell);
    const hmsR = round(hms);
    const totalEksMvaR = round(totalEksMva);
    const totalInkMvaR = round(totalInkMva);

    // 🔥 Rund ekstra poster også
    const ekstraPosterR =
      ekstraPoster && ekstraPoster.length > 0
        ? ekstraPoster.map(p => ({
            navn: p.navn,
            pris: round(p.pris)
          }))
        : [];

    const ekstraPosterTekst =
      ekstraPosterR.length > 0
        ? ekstraPosterR
            .map(p => ${p.navn}: ${p.pris} kr)
            .join("\n")
        : null;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
Du er en profesjonell norsk håndverker som skriver tilbud til kunde.

Jobbbeskrivelse:
${beskrivelse}

Kalkyle (ferdig beregnet – tallene er endelige):
Arbeid (${timer} timer × ${timepris} kr): ${arbeidR} kr
Kjøring (${kmPerDag} km per dag i ${dager} dager): ${kjøringR} kr
Bom: ${bomR} kr
Avfall: ${avfallR} kr
Materiell: ${materiellR} kr
HMS-forbruk: ${hmsR} kr
${ekstraPosterTekst ? Ekstra poster:\n${ekstraPosterTekst} : ""}

Totalt eks. mva: ${totalEksMvaR} kr
Totalt inkl. mva: ${totalInkMvaR} kr

VIKTIG – MÅ FØLGES:
- Alle tall over er endelige og skal brukes nøyaktig slik de er oppgitt
- Ikke endre, tolke, estimere eller runde tall
- Ikke legg til nye kostnader eller forutsetninger
- Dersom ekstra poster er oppgitt, skal disse inkluderes i tilbudsteksten
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
