import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const { beskrivelse, timer, dager, arbeid, kjøring, avfall, forbruk, total } = req.body;

    const prompt = `
Lag et profesjonelt tilbud basert på:

Arbeid: ${beskrivelse}
Timer: ${timer}
Dager: ${dager}
Arbeid: ${arbeid} kr
Kjøring: ${kjøring} kr
Avfall: ${avfall} kr
Forbruk: ${forbruk} kr
Totalpris: ${total} kr
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du skriver profesjonelle håndverkertilbud på norsk." },
        { role: "user", content: prompt }
      ]
    });

    res.status(200).json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI-feil" });
  }
}
