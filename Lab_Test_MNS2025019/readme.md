

## **Platform Used**

* **Ubuntu (Linux)**
---

## **Software / Tools Used**

These are the **exact tools actually used** in the project:

* **Node.js** – Backend server (Express)
* **Express.js** – REST API for Diffie–Hellman computation
* **Emscripten** – To compile `myProg.c` into WebAssembly (`.wasm`)
* **WebAssembly (WASM)** – For fast modular exponentiation on both frontend & backend
* **JavaScript (Vanilla JS)** – Frontend logic, validation, and API calls
* **HTML & CSS** – Frontend UI
* **C Language** – `modexp` implementation compiled into WASM
---

## ▶️ How to Run
```
1️⃣ Install Dependencies
npm install

2️⃣ Start Server
node server/server.js

3️⃣ Open Client
client/index.html

🛠 WASM Build Command (Ubuntu)
emcc myProg.c -Os -s WASM=1 -s EXPORTED_FUNCTIONS='["_modexp"]' -o myProg.js

```
This project implements a full **Diffie–Hellman Key Exchange** using:

* WASM for modular exponentiation (fast + same code on client/server)
* Client-side random `a`
* Server-side random `b`
* Shared secret calculation on both ends
* CORS-enabled API communication
* Prime validation on frontend

Everything runs locally using **two terminals** (frontend + backend).

---
