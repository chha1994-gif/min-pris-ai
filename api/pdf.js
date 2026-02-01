import PDFDocument from "pdfkit";

export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const data = req.body;

    const doc = new PDFDocument();
    const chunks = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=tilbud.pdf");
      res.status(200).send(pdfBuffer);
    });

    doc.fontSize(20).text("Tilbud", { underline: true });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(Arbeid: ${data.tekst});
    doc.text(Timer: ${data.timer});
    doc.text(Dager: ${data.dager});
    doc.text(Arbeid: ${data.arbeid} kr);
    doc.text(Kjøring: ${data.kjoring} kr);
    doc.text(Forbruk: ${data.forbruk} kr);
    doc.text(Avfall: ${data.avfall} kr);
    doc.text(Total: ${data.total} kr);

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "PDF-feil" });
  }
}
