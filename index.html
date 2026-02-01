<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <title>MinPris</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f3f3f3;
      margin: 0;
      padding: 20px;
    }

    .container {
      max-width: 520px;
      margin: auto;
      background: #fff;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    h1 {
      text-align: center;
    }

    textarea, input {
      width: 100%;
      padding: 12px;
      margin-top: 10px;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 16px;
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    .hint {
      font-size: 14px;
      margin-top: 5px;
    }

    button {
      width: 100%;
      padding: 14px;
      margin-top: 15px;
      font-size: 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }

    .btn-main {
      background: #000;
      color: white;
    }

    .btn-pdf {
      background: #222;
      color: white;
    }

    .result {
      margin-top: 20px;
      padding: 15px;
      background: #f7f7f7;
      border-radius: 6px;
    }
  </style>
</head>
<body>

<div class="container">
  <h1>🏠 MinPris</h1>

  <textarea id="tekst" placeholder="Beskriv jobben… f.eks bad: riving 18t, rengjøring 10t"></textarea>

  <input type="number" id="timepris" placeholder="Timepris (kr)" />
  <input type="number" id="km" placeholder="Km per dag" />

  <div class="hint">
    Usikker? <a href="https://www.google.com/maps" target="_blank">Sjekk Google Maps</a>
  </div>

  <input type="number" id="avfall" placeholder="Avfall (kr)" />
  <input type="number" id="forbruk" placeholder="Forbruk per dag (kr)" />

  <button class="btn-main" onclick="beregn()">Beregn</button>
  <button class="btn-pdf" onclick="lastNedPDF()">Last ned tilbud (PDF)</button>

  <div class="result" id="resultat"></div>
</div>

<script>
function beregn() {
  const tekst = document.getElementById("tekst").value;
  const timepris = Number(document.getElementById("timepris").value);
  const km = Number(document.getElementById("km").value);
  const avfall = Number(document.getElementById("avfall").value);
  const forbruk = Number(document.getElementById("forbruk").value);

  const timer = [...tekst.matchAll(/(\d+)\s*t/gi)]
    .map(m => Number(m[1]))
    .reduce((a,b) => a + b, 0);

  const dager = Math.ceil(timer / 7.5);
  const arbeid = timer * timepris;
  const kjorekost = km * 5 * dager;
  const forbrukTotalt = forbruk * dager;

  const subtotal = arbeid + kjorekost + forbrukTotalt + avfall;
  const mva = subtotal * 0.25;
  const total = subtotal + mva;

  document.getElementById("resultat").innerHTML = `
    <strong>Resultat:</strong><br><br>
    ⏱ Timer: ${timer} t<br>
    📅 Arbeidsdager: ${dager}<br>
    💼 Arbeid: ${arbeid.toLocaleString()} kr<br>
    🚗 Kjøring: ${kjorekost.toLocaleString()} kr<br>
    🧱 Forbruk: ${forbrukTotalt.toLocaleString()} kr<br>
    🗑 Avfall: ${avfall.toLocaleString()} kr<br><br>
    💰 Pris eks. mva: ${subtotal.toLocaleString()} kr<br>
    💰 Pris inkl. mva: <strong>${total.toLocaleString()} kr</strong>
  `;
}

function lastNedPDF() {
  const data = {
    tekst: document.getElementById("tekst").value,
    timepris: Number(document.getElementById("timepris").value),
    km: Number(document.getElementById("km").value),
    avfall: Number(document.getElementById("avfall").value),
    forbruk: Number(document.getElementById("forbruk").value)
  };

  fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error("PDF-feil");
    return res.blob();
  })
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tilbud.pdf";
    a.click();
  })
  .catch(err => {
    alert("Kunne ikke generere PDF");
    console.error(err);
  });
}
</script>

</body>
</html>
