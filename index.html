<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <title>MinPris – tilbudskalkulator</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #f4f4f4;
      padding: 20px;
    }

    .box {
      max-width: 600px;
      margin: auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    h1 {
      margin-bottom: 15px;
    }

    input, textarea, button {
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      font-size: 16px;
    }

    textarea {
      resize: vertical;
    }

    button {
      background: black;
      color: white;
      border: none;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.85;
    }

    .result {
      margin-top: 15px;
      padding: 10px;
      background: #eee;
    }
  </style>
</head>
<body>

<div class="box">
  <h1>MinPris – tilbudskalkulator</h1>

  <textarea id="beskrivelse" placeholder="Beskriv jobben..."></textarea>

  <input id="timepris" type="number" placeholder="Timepris (kr)">
  <input id="km" type="number" placeholder="Km per dag">
  <small>Usikker? <a href="https://maps.google.com" target="_blank">Sjekk Google Maps</a></small>

  <input id="avfall" type="number" placeholder="Avfall (kr)">
  <input id="forbruk" type="number" placeholder="Forbruk per dag (kr)">

  <button onclick="beregn()">Beregn</button>
  <button onclick="genererTekst()">Generer tilbudstekst</button>
  <button onclick="lastNedPDF()">Last ned tilbud (PDF)</button>

  <div class="result" id="resultat">–</div>
</div>

<script>
let beregnet = {};

function beregn() {
  const timepris = Number(document.getElementById("timepris").value);
  const km = Number(document.getElementById("km").value);
  const avfall = Number(document.getElementById("avfall").value);
  const forbruk = Number(document.getElementById("forbruk").value);

  const dager = Math.max(1, Math.ceil(km / 40));
  const timer = dager * 7.5;

  const arbeid = timer * timepris;
  const kjøring = km * 5;
  const total = arbeid + kjøring + avfall + forbruk;

  beregnet = {
    dager,
    timer,
    arbeid,
    kjøring,
    avfall,
    forbruk,
    total
  };

  document.getElementById("resultat").innerHTML = `
    <b>Dager:</b> ${dager}<br>
    <b>Timer:</b> ${timer}<br>
    <b>Arbeid:</b> ${arbeid} kr<br>
    <b>Kjøring:</b> ${kjøring} kr<br>
    <b>Avfall:</b> ${avfall} kr<br>
    <b>Forbruk:</b> ${forbruk} kr<br><br>
    <b>Total:</b> ${total} kr
  `;
}

async function genererTekst() {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      beskrivelse: document.getElementById("beskrivelse").value,
      ...beregnet
    })
  });

  const data = await res.json();
  document.getElementById("resultat").innerText = data.text || "Noe gikk galt";
}

async function lastNedPDF() {
  const res = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      beskrivelse: document.getElementById("beskrivelse").value,
      ...beregnet
    })
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tilbud.pdf";
  a.click();
}
</script>

</body>
</html>
