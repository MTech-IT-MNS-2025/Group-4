# 📘 Diffie–Hellman Key Exchange (Client–Server using WebAssembly)

This project implements the Diffie–Hellman Shared Secret Key Exchange using WebAssembly (WASM) to perform fast modular exponentiation on both the Client and Server sides.
All exponentiation is computed using the same WASM module compiled from the original myProg.c file.

# 🚀 Platform Used

Ubuntu (Linux)

# 🧰 Software / Tools Used

Node.js

Express.js

WebAssembly (WASM) (compiled from original myProg.c)

JavaScript (Client + Server)

Fetch API

# ▶️ Running and Installation
```
npm install
node server/server.js
client/index.html
emcc myProg.c -Os -s WASM=1 -s EXPORTED_FUNCTIONS='["_modexp"]' -o myProg.js
```


