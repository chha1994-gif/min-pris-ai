import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      beskrivelse,
      arbeidDetaljert,
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
      mva,
      totalInkMva
    } = req.body;

    if (!beskrivelse || !arbeidDetaljert || totalEksMva == null) {
      return res.status(400).json({ error: "Manglende kalkyledata" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const arbeidTekst = arbeidDetaljert
      .map(a =>
        – ${a.navn}: ${a.timer} t × ${timepris} kr = ${Math.round(a.pris)} kr
      )
      .join("\n");

    const prompt = `
Du er en profesjonell norsk håndverker som skriver tilbud til kunde.

Jobbbeskrivelse:
${beskrivelse}

Arbeid (eks. mva):
${arbeidTekst}

Øvrige kostnader (eks. mva):
– Kjøring (${kmPerDag} km per dag i ${dager} dager): ${kjøring} kr
– Bom: ${bom} kr
– HMS-forbruk: ${hms} kr
– Avfall: ${avfall} kr
– Materiell: ${materiell} kr

Sum eks. mva: ${totalEksMva} kr
Mva (25 %): ${mva} kr
Totalpris inkl. mva: ${totalInkMva} kr

VIKTIG:
- Alle tall er endelige og skal brukes nøyaktig
- Ikke regn, ikke estimer, ikke endre beløp
- Ikke bruk emoji

Oppgave:
Skriv en ryddig og profesjonell tilbudstekst på norsk.
Avslutt høflig.
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
    console.error(err);
    return res.status(500).json({ error: "AI-feil", message: err.message });
  }
}
