export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tekst, total } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": Bearer ${process.env.OPENAI_API_KEY},
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Du er en profesjonell håndverker som skriver tilbud."
          },
          {
            role: "user",
            content: `
Lag et profesjonelt tilbud basert på dette:

Arbeid: ${tekst}
Totalpris: ${total} kr

Skriv kort, ryddig og profesjonelt.
`
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      tekst: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI-feil" });
  }
}
