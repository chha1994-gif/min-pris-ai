import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    tekst,
    timer,
    dager,
    prisEks,
    mva,
    total
  } = req.body;

  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfData = Buffer.concat(buffers);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tilbud.pdf"
    );

    res.send(pdfData);
  });

  // ===== PDF INNHOLD =====
  doc.fontSize(22).text("Tilbud – MinPris", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(Beskrivelse:\n${tekst});
  doc.moveDown();

  doc.text(Totale timer: ${timer} t);
  doc.text(Antall dager: ${dager});
  doc.moveDown();

  doc.text(Pris eks. mva: ${prisEks} kr);
  doc.text(MVA (25%): ${mva} kr);
  doc.text(Totalpris: ${total} kr);

  doc.moveDown(2);
  doc.text("Tilbudet er gyldig i 14 dager.", { italic: true });

  doc.end();
}
