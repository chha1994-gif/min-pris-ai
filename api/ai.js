const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const beskrivelse = body.beskrivelse;
    const timer = body.timer;
    const dager = body.dager;
    const timepris = body.timepris;

    const arbeid = body.arbeid;
    const kjoring = body.kjoring || body.kjøring;
    const bom = body.bom;
    const avfall = body.avfall;
    const materiell = body.materiell;
    const hms = body.hms;

    const kmPerDag = body.kmPerDag;

    const totalEksMva = body.totalEksMva;
    const totalInkMva = body.totalInkMva;

    const ekstraPoster = Array.isArray(body.ekstraPoster)
      ? body.ekstraPoster
      : [];

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

    function round(n) {
      return Math.round(Number(n) || 0);
    }

    const arbeidR = round(arbeid);
    const kjoringR = round(kjoring);
    const bomR = round(bom);
    const avfallR = round(avfall);
    const materiellR = round(materiell);
    const hmsR = round(hms);
    const totalEksMvaR = round(totalEksMva);
    const totalInkMvaR = round(totalInkMva);

    var ekstraPosterTekst = "";

    if (ekstraPoster.length > 0) {
      for (var i = 0; i < ekstraPoster.length; i++) {
        var p = ekstraPoster[i];
        ekstraPosterTekst +=
          p.navn + ": " + round(p.pris) + " kr\n";
      }
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    var prompt = "";
    prompt += "Du er en profesjonell norsk håndverker som skriver tilbud til kunde.\n\n";
    prompt += "Jobbbeskrivelse:\n";
    prompt += beskrivelse + "\n\n";
    prompt += "Kalkyle (ferdig beregnet – tallene er endelige):\n";
    prompt += "Arbeid (" + timer + " timer × " + timepris + " kr): " + arbeidR + " kr\n";
    prompt += "Kjøring (" + kmPerDag + " km per dag i " + dager + " dager): " + kjoringR + " kr\n";
    prompt += "Bom: " + bomR + " kr\n";
    prompt += "Avfall: " + avfallR + " kr\n";
    prompt += "Materiell: " + materiellR + " kr\n";
    prompt += "HMS-forbruk: " + hmsR + " kr\n";

    if (ekstraPosterTekst) {
      prompt += "Ekstra poster:\n" + ekstraPosterTekst + "\n";
    }

    prompt += "Totalt eks. mva: " + totalEksMvaR + " kr\n";
    prompt += "Totalt inkl. mva: " + totalInkMvaR + " kr\n\n";
    prompt += "VIKTIG – MÅ FØLGES:\n";
    prompt += "- Alle tall over er endelige og skal brukes nøyaktig slik de er oppgitt\n";
    prompt += "- Ikke endre, tolke, estimere eller runde tall\n";
    prompt += "- Ikke legg til nye kostnader eller forutsetninger\n";
    prompt += "- Dersom ekstra poster er oppgitt, skal disse inkluderes i tilbudsteksten\n";
    prompt += "- Ikke bruk emoji\n\n";
    prompt += "Oppgave:\n";
    prompt += "Skriv en profesjonell og ryddig tilbudstekst på norsk.\n";
    prompt += "Del gjerne opp i avsnitt.\n";
    prompt += "Forklar kort hva tilbudet inkluderer.\n";
    prompt += "Avslutt med en høflig setning om at kunden gjerne kan ta kontakt ved spørsmål.\n";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const text =
      response.output &&
      response.output[0] &&
      response.output[0].content &&
      response.output[0].content[0] &&
      response.output[0].content[0].text
        ? response.output[0].content[0].text
        : "Kunne ikke generere tilbudstekst.";

    return res.status(200).json({ text });

  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({
      error: "AI failed",
      message: err.message
    });
  }
};
