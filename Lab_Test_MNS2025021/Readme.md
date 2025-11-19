# 🚀 Diffie–Hellman Key Exchange in WebAssembly (WASM)

A lightweight demonstration of the **Diffie–Hellman Key Exchange** implemented in **C**, compiled to **WebAssembly using Emscripten**, and executed in a simple **Node.js + HTML frontend**.

This project shows how native C cryptographic code can run directly inside the browser at high speed using WASM.


## 🖥️ Platform Used
- Windows 10 / 11


## 🛠️ Software & Tools Used
- Node.js
- Express.js
- Emscripten
- WebAssembly
- HTML / JavaScript


## 🔐 Project Summary

This project computes:

- Alice’s public value:  
  `X = g^A mod p`

- Bob’s public value:  
  `Y = g^B mod p`

- Shared secret:  
  `K = Y^A mod p = X^B mod p`

Computation is done using a fast C function (`modexp`) compiled to WASM.


## 📂 Project Folder Structure

    dh-wasm/
    │   myProg.c
    │   package.json
    │
    ├── frontend/
    │   index.html
    │   main.js
    │   modexp.js
    │   modexp.wasm
    │
    └── server/
      server.js

# ⚙️ Emscripten Build Command (C → WASM)
    emcc myProg.c -O3 -s WASM=1 -s WASM_BIGINT=0 -s ENVIRONMENT=web -s MODULARIZE=1 -s EXPORT_NAME=createModexpModule -s EXPORTED_FUNCTIONS="['_modexp']" -s EXPORTED_RUNTIME_METHODS="['cwrap']" -o frontend/modexp.js

This generates:
- `frontend/modexp.js`  
- `frontend/modexp.wasm`

# ▶️ How to Run the Project
1️⃣ Install Node dependencies
  
    npm install

2️⃣ Start the server

    cd server
    node server.js


Expected:

    Server running at http://localhost:3000

3️⃣ Open in browser
      
    http://localhost:3000


Enter A and B, then click Run DH.

🔢 Sample Output

    Given g = 5, p = 23
    A = 6, B = 15
    
    Alice computes X = g^A mod p = 8
    Bob computes   Y = g^B mod p = 19
    
    Alice's key = Y^A mod p = 2
    Bob's key   = X^B mod p = 2
    
    Shared Secret Key = 2
    
# 🔍 MD5 Digest Command Used (During Lab Test)

Windows CMD command used to compute MD5 hash:

    certutil -hashfile dh-wasm-zip.zip MD5
