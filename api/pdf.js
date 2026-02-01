import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  const data = req.body;

  const doc = new PDFDocument();
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdf = Buffer.concat(buffers);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  });

  doc.fontSize(20).text("Tilbud", { underline: true });
  doc.moveDown();

  Object.entries(data).forEach(([k, v]) => {
    doc.fontSize(12).text(${k}: ${v});
  });

  doc.end();
}
