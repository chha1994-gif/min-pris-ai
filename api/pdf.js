import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  const data = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=tilbud.pdf");

  doc.pipe(res);

  doc.fontSize(20).text("Tilbud", { underline: true });
  doc.moveDown();

  Object.entries(data).forEach(([key, value]) => {
    doc.fontSize(12).text(${key}: ${value});
  });

  doc.end();
}
