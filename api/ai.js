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
      timepris,
      kmPerDag,
      avfall,
      materiellTotalt,
      forbrukHmsPerDag
    } = req.body;

    if (!beskrivelse || !timepris) {
      return res.status(400).json({ error: "Mangler påkrevde felt" });
    }

    const systemPrompt = `
Du er en kalkulasjonsmotor for håndverkstilbud i Norge.

REGLER (IKKE BRYT):
- 1 dag = 7.5 timer
- Du skal tolke antall timer fra beskrivelsen
- Kilometerpris = 15 kr per km
- kmPerDag * dager * 15
- HMS-forbruk = forbrukHmsPerDag * dager
- Avfall og materiell er faste beløp

RETURNER KUN GYLDIG JSON MED FELTENE:
{
  timer: number,
  dager: number,
  arbeid: number,
  kjoring: number,
  avfall: number,
  materiell: number,
  hms: number,
  total: number,
  tilbudstekst: string
}
`;

    const userPrompt = `
Beskrivelse: ${beskrivelse}
Timepris: ${timepris}
Km per dag: ${kmPerDag}
Avfall: ${avfall}
Materiell totalt: ${materiellTotalt}
HMS forbruk per dag: ${forbrukHmsPerDag}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2
    });

    const text = completion.choices[0].message.content;

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "AI returnerte ugyldig JSON",
        raw: text
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("AI ERROR:", error);
    return res.status(500).json({ error: "Noe gikk galt i AI-endepunktet" });
  }
}
