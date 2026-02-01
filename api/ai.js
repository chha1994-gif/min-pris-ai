import OpenAI from "openai";

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY mangler" });
    }

    const client = new OpenAI({ apiKey });

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
    } = req.body;

    if (!beskrivelse || !total) {
      return res.status(400).json({ error: "Ugyldig input" });
    }

    const prompt = `
Lag en profesjonell tilbudstekst på norsk.

Arbeid:
${beskrivelse}

Kalkyle:
Timer: ${timer}
Dager: ${dager}
Arbeid: ${arbeid} kr
Kjøring: ${kjøring} kr
Avfall: ${avfall} kr
Materiell: ${materiell} kr
HMS: ${hms} kr
Totalpris: ${total} kr

Teksten skal være klar til å sendes til kunde.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;

    if (!text) {
      return res.status(500).json({ error: "Tom AI-respons" });
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error("AI FUNCTION CRASH:", err);
    return res.status(500).json({
      error: "Serverfeil i AI-funksjon",
      message: err.message,
    });
  }
}
