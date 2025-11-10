
# 💬 ChatVerse

Connect instantly with anyone, anywhere 🌐  
---

# 📘 Project Overview

This project is a **real-time one-to-one private messaging application** that allows users to chat seamlessly.  
It integrates **Next.js** for the frontend and backend, **Socket.io** for real-time communication, and **MongoDB** for data storage.

Users can log in, send and receive messages instantly, and retrieve chat history anytime — even if they were offline.

---

## ⚙️ Key Features

- 🧑‍💬 Real-time one-to-one chat  
- 💾 Persistent chat history using MongoDB  
- 🔐 Secure login with unique usernames  
- 📶 Online/offline user detection  
- 💬 “User typing…” live status  
- 📁 Optional media/file upload support  
- ✨ Responsive design for all screen sizes  

---

# 📸 Screenshots



<p align="center">
  <img src="img1.jpg" alt="Chat Interface" width="80%">
</p>

<p align="center">
  <img src="img2.jpg" alt="User Chat Window" width="80%">
</p>

---

# 🧭 Project Architecture

## 📂 Project Folder Structure

This document explains the structure of the **chat-app** project and the purpose of each directory and file.  
It helps developers quickly understand where to place and find code related to **API routes**, **database connections**, **socket logic**, and **file uploads**.

---

| **Path**                                                             | **Description**                                                                  |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `/app/`                                                              | Contains the main application code including routes, pages, and API logic.       |
| `/lib/`                                                              | Utility functions, hooks, and configuration files shared across the application. |
| `/models/`                                                           | Database models, schema definitions, and contribution logs.                      |
| `/models/Contributions.txt`                                          | Tracks contributions made by each team member.                                   |
| `/models/Login.jpeg`                                                 | Static image asset used in the login or documentation section.                   |
| `/README.md`                                                         | Project documentation detailing setup, architecture, and contribution roles.     |
| `/eslint.config.mjs`                                                 | ESLint configuration file for maintaining code quality and style consistency.    |
| `/launch-chatverse.sh`                                               | Shell script used to initialize or deploy the ChatVerse environment.             |
| `/next.config.ts`                                                    | Next.js configuration file managing routes, environments, and plugins.           |
| `/server.js`                                                         | Handles backend logic, WebSocket (Socket.io) connections, and API setup.         |
| `/package.json`                                                      | Lists dependencies, scripts, and metadata of the project.                        |
| `/tailwind.config.ts`                                                | Tailwind CSS configuration for theming and custom styles.                        |
| `/img1.jpg`, `/img2.jpg`                                             | Sample images used for UI previews or documentation.                             |
| `/vercel.svg`, `/next.svg`, `/globe.svg`, `/file.svg`, `/window.svg` | SVG assets used in the frontend interface.                                       |

---

# 🧱 Technologies Used

| Layer | Technology | Purpose |
| :---- | :---------- | :------- |
| 🌐 Frontend | Next.js (React) | Interface and user interaction |
| ⚙️ Backend | Node.js + Socket.io | Real-time message handling |
| 🗄️ Database | MongoDB (Mongoose) | Persistent chat storage |
| 🎨 Styling | Tailwind CSS / CSS Modules | Clean, responsive UI |
| 🧰 Tools | Multer, Sharp | File upload & image optimization |

---

# 🧑‍💻 Team Roles and Responsibilities

## 🎨 Frontend Engineer
### Responsibilities:
- Developed responsive and interactive UI components (login, chat pages).
- Integrated real-time message updates via WebSocket.
- Implemented input validation, loading states, and error handling.
- Optimized design for mobile and desktop.
- Enhanced visuals through modern styling and animations.

### Deliverables:
✅ Login and Chat Pages  
✅ Real-time message updates  
✅ Error & Loading States  
✅ Responsive UI for all screens  

---

## 🖥️ Backend Engineer
### Responsibilities:
- Set up and configured Node.js server integrated with Next.js.  
- Implemented Socket.io for private one-to-one real-time messaging.  
- Developed and managed API endpoints for messages, uploads, and user status.  
- Managed environment configurations and error handling.  
- Added server logs for debugging and monitoring performance.  

### Deliverables:
✅ WebSocket Communication Setup  
✅ RESTful APIs for message storage  
✅ Error & Log Management  
✅ Server performance monitoring  

---

# 🎯 Objective

The goal is to **integrate MongoDB** into the real-time chat app built with **Next.js** and **Socket.io** to enable:
- Persistent message storage (chat history)  
- Offline message delivery  
- User data management (username, online/offline status)  
- Secure communication handling  

---

## 🧱 MongoDB Overview

MongoDB is a **NoSQL database** that stores data in a flexible, JSON-like format.  
For this project, it is used to:
- Store user information  
- Store chat messages  
- Retrieve previous conversations between two users  

This ensures that chat data is **not lost** after disconnection or refresh.

---

## 🧩 Setup and Configuration Steps

### 1️⃣ Install MongoDB and Mongoose
```bash
npm install mongoose
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
````

---

## 🗄️ Database Connection

* Set up MongoDB connection
* Handle connection errors
* Create connection pool
* Cache connection

---

## 🔄 CRUD Operations

**Description:**
Enable Create, Read, Update, and Delete functionality for messages.
Support real-time message storage for both online and offline users.
Fetch chat history instantly on user login.

**Operations:**

* **Create:** Save new message to MongoDB
* **Read:** Retrieve message history between two users
* **Update:** Allow editing/deletion (optional)
* **Delete:** Manage message removal if required

✅ **Deliverable:**
Reliable message storage and retrieval ensuring real-time consistency.

---

## ⚙️ Query Optimization

**Tasks:**

* Create appropriate indexes
* Optimize slow queries
* Monitor query performance
* Implement pagination for message retrieval

---

# 🏁 Learning Outcomes

* Hands-on experience integrating **Next.js + Socket.io + MongoDB**
* Understanding of **real-time event-driven systems**
* Full-stack development practice (frontend, backend, and database)
* Enhanced debugging and API design skills
* Deployment-ready real-time chat architecture

---

# 🚀 How to Run Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/chatverse.git
cd chatverse
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start the Application

```bash
npm run dev
```

### 4️⃣ Open in Browser

Navigate to: **[http://localhost:3000](http://localhost:3000)**

---

# 🏗️ Future Enhancements

* ✅ Message reactions
* ✅ Message encryption
* ✅ AI-based chat summaries

---

# 💡 Conclusion

**ChatVerse** is a complete real-time private chat solution that integrates a powerful tech stack — Next.js, Socket.io, and MongoDB — with a responsive and modern UI.
It demonstrates a full-cycle web app architecture covering frontend, backend, database, and deployment.

---


