import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      total
    } = req.body;

    if (!beskrivelse || !total) {
      return res.status(400).json({ error: "Manglende data" });
    }

    const prompt = `
Skriv en profesjonell tilbudstekst på norsk basert på dette:

Jobbbeskrivelse:
${beskrivelse}

Kalkyle:
- Timer: ${timer}
- Dager: ${dager}
- Arbeid: ${arbeid} kr
- Kjøring: ${kjøring} kr
- Avfall: ${avfall} kr
- Materiell: ${materiell} kr
- HMS: ${hms} kr
- Totalpris: ${total} kr

Krav:
- Kort og ryddig
- Klar totalpris
- Passer for håndverk/bygg
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du skriver tilbudstekster for håndverksbedrifter." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const text = completion.choices[0].message.content;

    return res.status(200).json({ text });

  } catch (error) {
    console.error("AI error:", error);
    return res.status(500).json({
      error: "AI-feil",
      message: error.message
    });
  }
}
