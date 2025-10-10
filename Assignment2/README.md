
# Assignment 2
All Group 4 solutions for Assignment 2 will be stored here.

# 🧮 Task 1: Listing All Available Algorithms (liboqs)

## 🎯 Objective
The goal of this task is to **explore all post-quantum algorithms** supported in the local liboqs build and understand their basic properties such as key and ciphertext sizes.

---

## 🧠 Concept Overview

**liboqs** is an open-source C library developed by the **Open Quantum Safe (OQS)** project.  
It provides implementations of **Post-Quantum Cryptography (PQC)** algorithms — cryptosystems designed to remain secure against quantum attacks.

This task helps you identify which **KEMs (Key Encapsulation Mechanisms)** and **SIGs (Digital Signature Schemes)** are available in your build of liboqs.

---

## ⚙️ Features Implemented

The program (`list_algorithms.c`) lists:

- All **available KEM algorithms** (e.g., Kyber512, NTRU, BIKE, etc.)
- All **available Signature algorithms** (e.g., Dilithium, Falcon, SPHINCS+, etc.)
- For each KEM, it prints:
  - Algorithm name  
  - Public key length  
  - Secret key length  
  - Ciphertext length  

---

## 🧩 Functions & APIs Used

| Function | Description |
|-----------|--------------|
| `OQS_KEM_alg_count()` | Returns number of available KEM algorithms. |
| `OQS_KEM_alg_identifier(i)` | Returns the name (string) of the *i-th* KEM algorithm. |
| `OQS_SIG_alg_count()` | Returns number of available Signature algorithms. |
| `OQS_SIG_alg_identifier(i)` | Returns the name (string) of the *i-th* Signature algorithm. |
| `OQS_KEM_new(name)` | Initializes a KEM object for that algorithm. |
| `OQS_KEM_free()` | Frees allocated memory for KEM structure. |
| `OQS_SIG_new(name)` | Initializes a Signature object for that algorithm. |
| `OQS_SIG_free()` | Frees allocated memory for SIG structure. |

---

## 🧠 What is KEM and SIG?

- **KEM (Key Encapsulation Mechanism)** — used for key exchange. It allows two parties to securely agree on a shared secret without directly sending it.  
- **SIG (Signature Scheme)** — used for signing and verifying messages to ensure authenticity and integrity.

---







🛡️ Digital Signature Demo (sig_demo)

sig_demo.c is a demonstration of Digital Signatures using Post-Quantum Cryptography (PQC) and classical cryptography (RSA-2048 and ECDSA-P256).
It highlights key generation, signing, verification, key & signature sizes, and execution timings.

🚀 Features

Post-Quantum Cryptography (PQC):

Dilithium2/3/5 & fallback ML-DSA algorithms

Key generation, signing, and verification

Hexadecimal signature output

Timing measurements (ms)

Classical Cryptography:

RSA-2048

ECDSA-P256

SHA-256 hashing for signing

Key & signature sizes displayed

Performance Comparison between PQC and classical signatures

📝 Table of Contents

Overview

Dependencies

Installation

Compilation

Usage

Algorithm Details

Sample Output

Contributing

License

🔍 Overview

This project demonstrates digital signatures by:

Generating public/private key pairs for PQC and classical algorithms

Signing a sample message:

"Post-Quantum Cryptography is the future"


Verifying the signature

Measuring execution time for keygen, signing, and verification

Printing key sizes and signature lengths

🧩 Dependencies

GCC compiler

OpenSSL (libssl-dev)

Open Quantum Safe (liboqs)

Ubuntu/Debian Installation:

sudo apt update
sudo apt install build-essential libssl-dev cmake ninja-build git


Build liboqs:

git clone --branch main https://github.com/open-quantum-safe/liboqs.git
cd liboqs
mkdir build && cd build
cmake -GNinja -DCMAKE_INSTALL_PREFIX=/usr/local ..
ninja
sudo ninja install

⚙️ Compilation

Compile the demo program using:

gcc -O2 -o sig_demo sig_demo.c -I/usr/local/include -L/usr/local/lib -loqs -lcrypto

🏃 Usage

Run the program:

LD_LIBRARY_PATH=/usr/local/lib ./sig_demo


The program will:

Select a PQC algorithm (Dilithium2 preferred)

Generate public/private keys

Sign and verify the sample message

Print signature in hexadecimal

Display timings, key sizes, and verification results

🔑 Algorithm Details
1️⃣ Post-Quantum Signature (PQC)

Algorithms: Dilithium2/3/5, fallback ML-DSA variants

Uses OQS library for signing & verification

Outputs:

Public key length

Secret key length

Signature length

Measures execution time in milliseconds

2️⃣ RSA-2048

Uses OpenSSL RSA functions

Signs SHA-256 hashed message

Key size: ~2048 bits

Signature size: ~256 bytes

3️⃣ ECDSA-P256

Uses OpenSSL EC_KEY

Signs SHA-256 hashed message

Compact public key (~65 bytes)

Signature size: ~64–72 bytes

📊 Sample Output
=== PQC Signature Demo ===
Using PQC signature algorithm: Dilithium2
Public key length: 1312 bytes
Secret key length: 2528 bytes
Signature length:  2420 bytes

Message: "Post-Quantum Cryptography is the future"
Signature (2420 bytes): 12ab34cd... (hex)
Verification: SUCCESS ✅

Timings (ms):
  Key generation : 2.345
  Signing        : 0.456
  Verification   : 0.123

=== Classical RSA-2048 and ECDSA-P256 Comparison ===

-- RSA-2048 --
Public key size: ~294 bytes
Signature size : 256 bytes
Verification: SUCCESS ✅
Timings (ms): keygen=45.678, sign=1.234, verify=0.987

-- ECDSA P-256 --
Public key size: ~65 bytes
Signature size : 72 bytes
Verification: SUCCESS ✅
Timings (ms): keygen=0.456, sign=0.123, verify=0.078
