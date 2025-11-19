

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

## **Commands to Run the Project**

### **1️⃣ Frontend (Runs on Python Server)**

Open Terminal 1 and run:

```bash
cd ~/diffie-frontend/dist
python3 -m http.server 8000
```

Access in browser:

```
http://127.0.0.1:8000
```

---

### **2️⃣ Backend (Node.js Server)**

Open Terminal 2 and run:

```bash
cd ~/diffie-frontend/server
node server.js
```

Backend runs at:

```
http://localhost:3000
```

---

### **3️⃣ Compile C Code to WebAssembly (Using Emscripten)**

From the project root:

```bash
cd ~/diffie-frontend
source ~/emsdk/emsdk_env.sh    # LOAD Emscripten (path may vary)

emcc src/myProg.c -O2 \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s 'EXPORT_NAME="MyModule"' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -s EXPORTED_FUNCTIONS='["_modexp"]' \
  -s WASM_BIGINT=0 \
  -o dist/myProg.js
```

This generates:

* `dist/myProg.js`
* `dist/myProg.wasm`

---

## **Command Used to Calculate the MD5 Digest**

### To compress the folder:

```bash
zip -r diffie-frontend.zip diffie-frontend
```

### To generate MD5:

```bash
md5sum diffie-frontend.zip
```

Example output:

```
c42427afea81efb2561a9b855a5bf1  diffie-frontend.zip
```

### Last four hexadecimal digits (as required):

```
5bf1
```

---

## ✔ Summary of Functionality

This project implements a full **Diffie–Hellman Key Exchange** using:

* WASM for modular exponentiation (fast + same code on client/server)
* Client-side random `a`
* Server-side random `b`
* Shared secret calculation on both ends
* CORS-enabled API communication
* Prime validation on frontend

Everything runs locally using **two terminals** (frontend + backend).

---
