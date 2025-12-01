# 🔐 ChatVerse – Post-Quantum Secure Real-Time Chat Application

ChatVerse is a **post-quantum secure real-time chat application** built using **Next.js, Node.js, Express, Socket.io, MongoDB, and liboqs**.  
It enables users to chat privately or in groups with **end-to-end post-quantum encryption**, send encrypted messages and images, receive live notifications, and view online/offline status — all while maintaining quantum-resistant security.

---

## 🚀 Project Overview

ChatVerse provides:
- 🔐 **Post-quantum secure encryption** using liboqs library (Kyber KEM).  
- 🔑 **Hybrid encryption scheme**: AES-256-GCM for message encryption + PQC-KEM for session key encapsulation.  
- 💬 Real-time one-to-one and group chat using Socket.io.  
- 📸 Secure image sharing with encrypted transmission.  
- 🟢 Online/offline user status visibility.  
- 🧠 Typing indicators and real-time notifications.  
- 🌈 Responsive and modern UI built with Tailwind CSS.  
- 🛡️ Protection against side-channel attacks with secure key handling.

---

## 🔒 Security Architecture

### Encryption Flow

```
┌─────────────┐                           ┌─────────────┐
│   Sender    │                           │  Receiver   │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │ 1. Generate AES-256 session key         │
       │ 2. Encrypt message with AES-GCM         │
       │ 3. Query server for receiver's PQC      │
       │    public key                           │
       │ 4. Encapsulate session key using        │
       │    Kyber KEM with receiver's public key │
       │ 5. Send: {ciphertext, encapsulated_key, │
       │          iv, auth_tag}                  │
       │────────────────────────────────────────>│
       │                                         │
       │                      6. Decapsulate key │
       │                         using private   │
       │                         key (Kyber KEM) │
       │                      7. Decrypt message │
       │                         with AES-GCM    │
       │                                         │
```

### Key Components

1. **Post-Quantum Key Encapsulation Mechanism (KEM)**
   - Algorithm: Kyber (NIST PQC standard)
   - Key Generation: Performed during user registration
   - Public keys stored in MongoDB
   - Private keys managed securely on client-side

2. **Symmetric Encryption**
   - Algorithm: AES-256-GCM
   - Session keys: Randomly generated per message
   - Provides both confidentiality and authenticity

3. **Side-Channel Attack Mitigation**
   - Session keys stored in memory only (never localStorage)
   - Private keys loaded from secure storage with memory clearing
   - Constant-time operations for cryptographic functions
   - Automatic key zeroing after use
   - No key material in browser console/logs

---

## ⚙️ Installation and Setup Guide

### Prerequisites

- Node.js (v18+)
- MongoDB
- **liboqs library** (for PQC operations)
- C compiler (GCC/Clang) for key generation utility

### 1️⃣ Install liboqs

#### On Linux/macOS:
```bash
git clone https://github.com/open-quantum-safe/liboqs.git
cd liboqs
mkdir build && cd build
cmake -GNinja -DCMAKE_INSTALL_PREFIX=/usr/local ..
ninja
sudo ninja install
```

#### On Windows:
Follow the [official liboqs installation guide](https://github.com/open-quantum-safe/liboqs/wiki/Platform-specific-notes-for-Windows)

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/MTech-IT-MNS-2025/Group-4.git
cd Group-4/Assignment-4
```

### 3️⃣ Install Dependencies

```bash
npm install
```

Additional packages required:
```bash
npm install node-liboqs buffer crypto-js
```

### 4️⃣ Generate PQC Key Pairs

For each user, generate a Kyber key pair using the standalone utility:

```bash
cd key-generation
gcc -o keygen keygen.c -loqs
./keygen <username>
```

This creates:
- `<username>_public.key` – Public key (to be registered)
- `<username>_private.key` – Private key (keep secure)

### 5️⃣ Configure Environment Variables

Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/chatverse-pqc
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SESSION_SECRET=your-secret-key-here
```

### 6️⃣ Start the Backend Server

```bash
node server/socket-server.js
```

### 7️⃣ Run the Frontend (Next.js)

In another terminal:

```bash
npm run dev
```

### 8️⃣ Open in Browser

Visit 👉 [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture Overview

```
chatverse-pqc/
 ├── app/                     → Next.js frontend
 │   ├── page.tsx             → Main chat interface
 │   ├── api/                 → API endpoints
 │   │   ├── auth/            → Registration with PQC key
 │   │   ├── messages/        → Encrypted message handling
 │   │   ├── keys/            → Public key retrieval
 │   │   └── upload/          → Encrypted file upload
 │
 ├── server/                  → Express + Socket.io backend
 │   ├── socket-server.js     → Real-time encrypted messaging
 │   └── pqc-handler.js       → liboqs integration
 │
 ├── lib/
 │   ├── mongodb.ts           → Database connection
 │   ├── crypto.ts            → AES encryption utilities
 │   └── pqc.ts               → KEM encapsulation/decapsulation
 │
 ├── models/
 │   ├── Message.ts           → Encrypted message schema
 │   └── User.ts              → User with PQC public key
 │
 ├── key-generation/          → Standalone C utility
 │   ├── keygen.c             → Kyber key pair generator
 │   └── README.md            → Key generation instructions
 │
 ├── security/
 │   ├── key-management.ts    → Secure key handling
 │   └── memory-protection.ts → Anti-side-channel measures
 │
 ├── public/                  → Static assets
 ├── package.json
 └── README.md
```

---

## 🧠 Technologies Used

| Category                  | Technology                       |
| ------------------------- | -------------------------------- |
| **Frontend**              | Next.js, React, Tailwind CSS     |
| **Backend**               | Node.js, Express.js              |
| **Realtime Engine**       | Socket.io                        |
| **Database**              | MongoDB (via Mongoose)           |
| **Post-Quantum Crypto**   | liboqs (Kyber KEM)               |
| **Symmetric Encryption**  | AES-256-GCM (Node.js crypto)     |
| **Key Management**        | Secure memory handling, WebCrypto API |
| **File Handling**         | Multer (encrypted uploads)       |
| **Other Tools**           | CORS, Nodemon, TypeScript        |

---

## 🔐 Security Features

### 1. Post-Quantum Key Encapsulation
- **Kyber-1024** for maximum security level
- Resistant to quantum computer attacks (Shor's algorithm)
- Public keys stored on server, private keys never leave client

### 2. End-to-End Encryption
- Every message encrypted with unique AES-256 session key
- Session key encapsulated using receiver's PQC public key
- Even server cannot decrypt messages

### 3. Side-Channel Attack Prevention
- **No localStorage usage** for cryptographic keys
- Session keys stored in `WeakMap` with automatic garbage collection
- Private keys loaded from IndexedDB with immediate zeroing
- Constant-time comparison for authentication tags
- Memory wiping after decryption operations

### 4. Forward Secrecy
- New session key for every message
- Compromise of one key doesn't affect other messages

### 5. Authentication
- AES-GCM provides authenticated encryption
- Prevents message tampering and replay attacks



## 🎯 Learning Outcomes

This project helped us learn:

* Implement **post-quantum cryptography** using liboqs library.
* Design **hybrid encryption schemes** (symmetric + asymmetric).
* Build **key encapsulation mechanisms** (KEM) for secure key exchange.
* Handle **side-channel attack prevention** in browser environments.
* Integrate **C libraries with Node.js** applications.
* Manage **secure key lifecycle** (generation, storage, deletion).
* Implement **end-to-end encryption** in real-time applications.
* Optimize **cryptographic performance** for chat applications.
* Work with **NIST post-quantum standards** (Kyber).
* Apply **security best practices** for web applications.

---

## ⚡ Performance Optimizations

1. **Key Caching**: Public keys cached in memory to reduce database queries
2. **Lazy Loading**: Private keys loaded only when needed
3. **Batch Encapsulation**: Group messages use single KEM operation
4. **Worker Threads**: Heavy crypto operations offloaded to Web Workers
5. **Streaming Encryption**: Large files encrypted in chunks
6. **Connection Pooling**: MongoDB connections reused efficiently

---

## 🧪 Testing

Run security tests:
```bash
npm run test:security
```

Test KEM operations:
```bash
npm run test:pqc
```

Performance benchmarks:
```bash
npm run benchmark
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` – Register with PQC public key
- `POST /api/auth/login` – Login and retrieve session

### Messaging
- `POST /api/messages/send` – Send encrypted message
- `GET /api/messages/:chatId` – Retrieve encrypted messages

### Key Management
- `GET /api/keys/:userId` – Get user's public key
- `POST /api/keys/rotate` – Rotate PQC key pair

### File Sharing
- `POST /api/upload/encrypt` – Upload encrypted file
- `GET /api/upload/:fileId` – Download and decrypt file

---

## 🛡️ Security Considerations

⚠️ **Important Notes:**

1. **Private Key Storage**: Store private keys securely (encrypted filesystem, hardware security module)
2. **Key Rotation**: Regularly rotate PQC key pairs
3. **Network Security**: Use HTTPS in production
4. **Input Validation**: All inputs sanitized to prevent injection attacks
5. **Rate Limiting**: Implemented to prevent brute force attacks
6. **Audit Logging**: All cryptographic operations logged

---

## 🏁 Conclusion

ChatVerse demonstrates the practical implementation of **post-quantum cryptography** in modern web applications. By combining **Kyber KEM** with **AES-256-GCM**, we achieve quantum-resistant security while maintaining excellent performance. The architecture carefully addresses side-channel vulnerabilities and provides a blueprint for building secure, future-proof communication systems.

---

## 📖 References

- [liboqs Documentation](https://github.com/open-quantum-safe/liboqs)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Kyber Specification](https://pq-crystals.org/kyber/)
- [AES-GCM Security](https://csrc.nist.gov/publications/detail/sp/800-38d/final)

---

⭐ *If you found this project helpful, please star the repository!* 🌟

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
