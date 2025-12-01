🔐 ChatVerse PQ — Post-Quantum Secure Real-Time Chat Application
Assignment-4 (Enhanced from Assignment-3)

ChatVerse PQ is a modern, real-time chat application built using Next.js, Node.js, Express, Socket.io, and MongoDB, now enhanced with Post-Quantum Cryptography (PQC) using the liboqs library.

Every message exchanged between users is encrypted using a hybrid cryptographic system:

AES-256 for fast symmetric encryption

Post-Quantum KEM (Kyber768) for secure session-key encapsulation

Offline keypair generation for enhanced side-channel security

This ensures long-term confidentiality even in the era of quantum computers.

🚀 Features
✅ Core Chat Features

Real-time one-to-one chat (Socket.io)

Group messaging

Online/offline status indicators

Typing indicators

Image sharing (Multer)

Lightweight + responsive UI using Tailwind CSS

🔐 Post-Quantum Security Features (NEW in Assignment-4)

Each user registers with a PQC public key

Messages encrypted using AES-256 session keys

Session keys encapsulated with Kyber768 KEM

Users fetch each other's PQ public keys from the server

Private keys never stored in browser or server database

Manually generated PQ keypairs (standalone C program)

Side-channel protection considerations:

WebCrypto API usage

Zero-copy buffers

No long-term storage of secret keys in frontend

CSP & CORS restrictions applied

🔧 PQC Hybrid Encryption Workflow
1️⃣ User Registration (Offline Key Generation)

Each user generates their Kyber768 keypair manually:

gcc keygen.c -loqs -o pq-keygen
./pq-keygen


Outputs:

public.key       → uploaded during registration  
secret.key       → kept offline, never uploaded  

2️⃣ Sending a Message

Sender requests receiver’s PQ public key from server

Browser generates a fresh AES-256 session key

Session key encapsulated using Kyber768:

ciphertext, shared_secret = KEM_Encaps(receiver_public_key)


Message encrypted using AES-256 with shared_secret

Socket.io sends:

{
  aes_ciphertext,
  kem_ciphertext,
  sender_id,
  receiver_id
}

3️⃣ Receiving a Message

Receiver loads offline secret.key into a local decryptor

Kyber decapsulation:

shared_secret = KEM_Decaps(kem_ciphertext, secret_key)


AES decrypts the message body

🏗️ Project Structure
chat-app/
 ├── pq/                        → Standalone PQC C programs
 │   └── keygen.c              → Kyber768 keypair generator
 │
 ├── app/                       → Next.js frontend
 │   ├── utils/crypto.ts       → AES + PQ encapsulation helpers
 │   ├── api/                  → Registration, login, uploads
 │   └── page.tsx              → Main chat interface
 │
 ├── server/
 │   ├── socket-server.js      → Secure realtime messaging
 │   └── pqc/kem.js            → liboqs KEM bindings for Node.js
 │
 ├── models/
 │   ├── User.js               → Stores PQ public key safely
 │   └── Message.js
 │
 ├── lib/
 │   └── mongodb.ts
 │
 ├── public/                   → Static assets & image uploads
 ├── package.json
 ├── tailwind.config.ts
 ├── tsconfig.json
 └── README.md                 → This file

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/MTech-IT-MNS-2025/Group-4.git
cd Group-4/Assignment-3

2️⃣ Install Dependencies
npm install

3️⃣ Start Backend (Express + Socket.io)
node server/socket-server.js

4️⃣ Start Frontend (Next.js)
npm run dev

5️⃣ Open Application

👉 http://localhost:3000

🧪 PQC Key Pair Generation (Required Step)

Inside the pq/ folder, compile and run:

gcc keygen.c -loqs -o keygen
./keygen


This generates:

public.key → upload during registration

secret.key → keep offline (required for decrypting)

🛡️ Security & Performance Considerations

To protect against browser-based side-channel attacks, we implemented:

✔ No private key stored inside browser localStorage/sessionStorage
✔ No PQC secret key stored on server
✔ AES uses WebCrypto (hardware accelerated)
✔ Session keys are short-lived
✔ CSP and sandbox policies prevent script injection
✔ Zero-copy typed arrays for cryptographic buffers
✔ PQC operations offloaded to Web Workers (optional enhancement)
📸 Screenshots
🔐 Login Page

(Insert your screenshot here)

💬 Private Chat Interface

(Insert your screenshot here)

🖼️ Image Sharing

(Insert your screenshot here)

🎯 Learning Outcomes

Through this upgraded assignment, we learned:

Cryptographic Concepts

Post-Quantum KEM (Kyber768)

AES-256 session key encryption

Hybrid cryptographic messaging systems

Key encapsulation vs symmetric encryption

Engineering Skills

Secure real-time systems

Side-channel resistant frontend design

liboqs integration with Node.js

Handling binary data in Next.js

WebCrypto API for AES-GCM

Secure key handling in distributed systems

🏁 Conclusion

ChatVerse PQ combines modern web technology with advanced Post-Quantum secure cryptography.
By integrating liboqs, KEM-based key encapsulation, and AES-256, we successfully converted a standard realtime chat app into a future-proof secure messaging system.

⭐ If you found this project useful, please consider starring the repository! 🌟
