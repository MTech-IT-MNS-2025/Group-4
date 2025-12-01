
---

# 🔐 **ChatVerse – Post-Quantum Secure Real-Time Chat Application**

ChatVerse is a **real-time, end-to-end encrypted chat platform** that uses **Post-Quantum Cryptography (PQC)** to secure communication against future quantum attacks.
It is built using **Next.js, Node.js, Socket.io, MongoDB**, and **Kyber-based PQC encryption**, with an AES-GCM hybrid layer for message protection.

The application supports **private chat, group chat, encrypted image sharing, typing indicators, notifications, and online/offline status** — all secured using quantum-resistant key exchange.

---

# 🚀 **Features**

### 🔐 Post-Quantum Encryption (Kyber768 + AES-256-GCM)

* Each user receives a **Kyber PQC secret key** during registration.
* Messages use **AES-256-GCM symmetric encryption**.
* AES keys are encrypted using **Kyber768 KEM** (Hybrid PQC scheme).

### 💬 Real-Time Chat

* Private one-to-one chat
* Typing indicator
* Online/offline status
* Message read status
* Notifications

### 📸 Encrypted Media Sharing

* Images are encrypted client-side before upload.
* Server cannot view image content.

### 🔑 Secure Key Handling

* PQC private keys stored securely on client side.
* Keys are never sent to the server.
* AES keys generated per-message → **Forward Secrecy**.

### 🧩 Modern UI

* Responsive interface built using **Tailwind CSS**.
* Login, Register, Chat, and Secret Key download pages.

---

# 📦 **Tech Stack**

### **Frontend**

* Next.js 14 (App Router)
* React
* Tailwind CSS
* WebCrypto API (AES-256-GCM)

### **Backend**

* Node.js
* Express.js
* Socket.io (real-time communication)
* MongoDB + Mongoose

### **Cryptography**

* Kyber768 (Post-Quantum KEM)
* AES-256-GCM (symmetric encryption)
* Hybrid Encryption = **Kyber KEM + AES-GCM**
* Native PQC processing via **node-liboqs / native-crypto**

---

# 📁 **Project Structure**

*(This matches your folder view from the screenshots)*

```
chat-app/
 ├── app/                # Next.js frontend (UI, pages)
 ├── server/             # Socket.io + Express backend
 ├── lib/                # Crypto utilities (AES-GCM, PQC helpers)
 ├── models/             # MongoDB models (User, Messages)
 ├── native-crypto/      # PQC key generation / bindings
 ├── public/             # Static assets
 ├── launch-chatverse.sh # Optional startup script
 ├── package.json
 ├── next.config.ts
 └── README.md
```

---

# 🛡️ **Security Architecture**

### **1. Registration**

* User enters username/password
* System generates **Kyber PQC key pair**
* User gets secret key and must store it safely
* Server stores only the **public key**

### **2. Message Sending**

1. Client generates **fresh AES-256 session key**
2. Message encrypted using AES-GCM
3. AES key encapsulated using receiver's **Kyber public key**
4. Encrypted payload sent over Socket.io

### **3. Message Receiving**

1. Receiver decapsulates AES session key using their **Kyber private key**
2. Message is decrypted using AES-GCM
3. UI displays "Decrypted" tag

### **4. Forward Secrecy**

* Every message uses a new AES key
* One key leak does not expose past messages

---

# ⚙️ **Installation & Setup**

### **1. Install Dependencies**

```
npm install
```

### **2. Start Backend (Socket Server)**

```
node server/socket-server.js
```

### **3. Start Next.js Frontend**

```
npm run dev
```

### **4. Open Application**

Visit:

```
http://localhost:3000
```

---

# 🧪 **Testing Features**

You can test:

✔ Two browsers → private chat
✔ PQC key loading
✔ Encrypted messages
✔ Typing indicator
✔ Online status
✔ Encrypted images

Your screenshots show full working examples of both users chatting and decrypting messages.

---

# 🛡️ **Important Security Notes**

* Your PQC secret key must be saved — **without it, messages cannot be decrypted**.
* Keys are stored on the client-side (local storage / secure storage).
* Server **never** sees or stores private keys.
* AES session keys are never stored.
* Decryption failures show:
  `AES decryption failed – possible key mismatch`

---

# ⭐ **Learning Outcomes**

This project demonstrates:

* Real-world implementation of **Post-Quantum Cryptography**
* Hybrid encryption (PQC + AES)
* Secure real-time messaging
* Key lifecycle management
* Integrating C/PQC libraries with JavaScript
* Scalable chat architecture using Socket.io

---




---


