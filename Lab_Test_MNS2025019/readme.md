# Diffie–Hellman Key Exchange (Client–Server Web Application using WebAssembly)

This project implements the Diffie–Hellman shared secret key generation system using WebAssembly (WASM) for modular exponentiation on both the Client and Server sides.
The computation uses the original unmodified myProg.c compiled to WebAssembly.

1. Platform Used

Ubuntu (Linux)

2. Software / Tools Used

Node.js
Express.js
WebAssembly (WASM) compiled from original myProg.c
JavaScript (Client-side & Server-side)
Fetch API

3. Project Description
Client-Side

User inputs p (prime) and g (generator).
Generates random a ∈ Z*_p.
Computes x = gᵃ mod p using WASM modexp.
Sends <g, p, x> to the server endpoint /compute.
Displays final output <K, y, a>.
Server-Side
Receives <g, p, x> from client.
Generates random b ∈ Z*_p.
Computes:
y = gᵇ mod p (using WASM)
K = xᵇ mod p (using WASM)
Returns <K, y> to client in JSON.

All exponentiation is performed using the same WebAssembly module, compiled from the original myProg.c.
