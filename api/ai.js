export default async function handler(req, res) {
  const { tekst, timepris, km, avfall, forbruk } = req.body;

  // Estimat basert på tekst
  let timer = tekst.toLowerCase().includes("riving") ? 40 : 20;
  let dager = Math.ceil(timer / 7.5);

  const kjorekost = km * dager * 4;
  const forbrukTotal = forbruk * dager;

  const prisEks =
    timer * timepris +
    kjorekost +
    avfall +
    forbrukTotal;

  const mva = Math.round(prisEks * 0.25);
  const total = prisEks + mva;

  res.json({
    timer,
    dager,
    prisEks,
    mva,
    total
  });
}
