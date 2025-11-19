📘 Diffie–Hellman Key Exchange (Client–Server using WebAssembly)

This project implements the Diffie–Hellman Shared Secret Key Exchange using WebAssembly (WASM) to perform fast modular exponentiation on both the Client and Server sides.
All exponentiation is computed using the same WASM module compiled from the original myProg.c file.

🚀 Platform Used

Ubuntu (Linux)

🧰 Software / Tools Used

Node.js

Express.js

WebAssembly (WASM) (compiled from original myProg.c)

JavaScript (Client + Server)

Fetch API

📄 Project Description
🔹 Client-Side

User inputs p (prime) and g (generator)

Browser generates random secret a

Computes
x = gᵃ mod p (via WASM)

Sends ⟨g, p, x⟩ to the server

Displays:

a (client secret)

x

b (server secret)

y = gᵇ mod p

K (shared secret)

🔹 Server-Side

Receives ⟨g, p, x⟩ from client

Generates random secret b

Computes using WASM:

y = gᵇ mod p

K = xᵇ mod p

Sends ⟨y, K⟩ back to client

📌 Key Point

✔ All modular exponentiation is performed using the same WebAssembly module compiled from the original myProg.c.
