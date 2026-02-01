01:37
Du har sendt
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tekst, timer, total } = req.body;

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
            content: "Du er en profesjonell håndverker som skriver tilbud til kunde."
          },
          {
            role: "user",
            content: `
Lag et ryddig og profesjonelt tilbud basert på dette:

Arbeid: ${tekst}
Estimert tid: ${timer} timer
Totalpris: ${total} kr inkl mva

Skriv på norsk, kort og seriøst.
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
