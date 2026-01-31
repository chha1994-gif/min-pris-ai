import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tekst, timer, total } = req.body;

  const doc = new PDFDocument();
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const pdf = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=prisoverslag.pdf");
    res.send(pdf);
  });

  doc.fontSize(22).text("Prisoverslag", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(Beskrivelse:\n${tekst});
  doc.moveDown();

  doc.text(Estimert arbeidstid: ${timer} timer);
  doc.text(Total pris: ${total} kr);

  doc.end();
}
