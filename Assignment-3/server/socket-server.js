// ------------------ IMPORTS ------------------
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { saveMessage } = require('./messagesStore');

// ------------------ APP SETUP ------------------
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

// ✅ Serve static files from the *main public folder*
expressApp.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
expressApp.use('/profiles', express.static(path.join(__dirname, '../public/profiles')));

// ✅ API routes
try {
  expressApp.use('/api/messages', require('./api/messages'));
  expressApp.use('/api/register', require('./api/register'));
  expressApp.use('/api/login', require('./api/login'));
} catch (err) {
  console.warn('⚠️ Some API routes missing — continuing without them');
}

// ------------------ FILE UPLOAD SETUP ------------------
const uploadsDir = path.join(__dirname, '../public/uploads');
const profilesDir = path.join(__dirname, '../public/profiles');

// Ensure folders exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type === 'profile' ? profilesDir : uploadsDir;
    cb(null, type);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ------------------ FILE UPLOAD ROUTE ------------------
expressApp.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const type = req.body.type === 'profile' ? 'profiles' : 'uploads';
    const filePath = `/${type}/${req.file.filename}`; // ✅ public path
    res.json({ url: filePath });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// ------------------ START NEXT + SOCKET.IO ------------------
app.prepare().then(() => {
  const server = createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
      expressApp(req, res);
    } else {
      handle(req, res, parse(req.url, true));
    }
  });

  const io = new Server(server, {
    cors: { origin: '*' },
  });

  // ------------------ SOCKET.IO HANDLERS ------------------
  const userStatus = {}; // global for all sockets

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    let currentUser = null;

    // User registers
    socket.on('register_user', (data) => {
      currentUser = data.username;
      userStatus[currentUser] = 'online';
      console.log(`🟢 ${currentUser} is online`);

      io.emit('user_status', { username: currentUser, status: 'online' });
    });

    // User disconnects
    socket.on('disconnect', () => {
      if (currentUser) {
        userStatus[currentUser] = 'offline';
        console.log(`🔴 ${currentUser} disconnected`);
        io.emit('user_status', { username: currentUser, status: 'offline' });
      }
    });

    // Get all users' statuses
    socket.on('get_all_statuses', () => {
      socket.emit('all_users_status', userStatus);
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
      // ✅ Save message to local JSON store
      saveMessage({ ...data, timestamp: new Date() });

      // ✅ Send to all connected clients
      io.emit('receive_message', data);

      // ✅ Notify all except sender
      socket.broadcast.emit('notification', {
        sender: data.sender,
        message: data.text,
      });
    });
  });

  // ------------------ START SERVER ------------------
  server.listen(port, () => {
    console.log(`🚀 Server running on http://${hostname}:${port}`);
    console.log(`🖼️  Uploads served from: http://${hostname}:${port}/uploads`);
  });
});

