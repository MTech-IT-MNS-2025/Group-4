// Load the WASM module
let modInstancePromise = MyModule();

async function init() {
  const Module = await modInstancePromise;

  console.log("WASM loaded successfully!");

  const modexp = Module.cwrap("modexp", "number",
    ["number", "number", "number"]
  );

  const pInput = document.getElementById('p');
  const gInput = document.getElementById('g');
  const connectBtn = document.getElementById('connect');
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  const valA = document.getElementById('val-a');
  const valX = document.getElementById('val-x');
  const serverResponse = document.getElementById('server-response');

  connectBtn.addEventListener('click', async () => {

    const p = parseInt(pInput.value.trim(), 10);
    const g = parseInt(gInput.value.trim(), 10);

    console.log("DEBUG: p =", p, "g =", g);

    if (!Number.isInteger(p) || p <= 2) {
      alert("Please enter valid prime p > 2");
      return;
    }
    if (!Number.isInteger(g) || g <= 1) {
      alert("Please enter valid g > 1");
      return;
    }

    const a = Math.floor(Math.random() * (p - 1)) + 1;

    status.textContent = "Computing x = g^a mod p using wasm...";
    results.hidden = true;

    const x = modexp(g, a, p);

    valA.textContent = a;
    valX.textContent = x;
    results.hidden = false;

    status.textContent = "Sending values to server...";

    try {
      const resp = await fetch("http://localhost:3000/api/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p, g, x })
      });

      const json = await resp.json();
      serverResponse.textContent = JSON.stringify(json, null, 2);

      status.textContent = "Received response from server";

    } catch (err) {
      serverResponse.textContent = "Network error: " + err.message;
      status.textContent = "Network error";
    }

  });
}

init();
