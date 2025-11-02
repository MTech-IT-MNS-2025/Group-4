const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const uploadsDir = path.join(__dirname, 'public', 'uploads');
const profilesDir = path.join(__dirname, 'public', 'profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

const users = {};
const userStatuses = {};
const groups = {};
const userProfiles = {};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error:', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    maxHttpBufferSize: 1e8
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('register_user', (data) => {
      const { username, profilePicture } = data;
      users[username] = socket.id;
      userStatuses[username] = 'online';
      if (profilePicture) {
        userProfiles[username] = profilePicture;
      }
      io.emit('user_status', { username, status: 'online', profilePicture: userProfiles[username] });
      socket.emit('all_users_status', userStatuses);
      socket.emit('all_user_profiles', userProfiles);
      socket.emit('all_groups', Object.keys(groups));
    });

    socket.on('update_profile_picture', (data) => {
      const { username, profilePicture } = data;
      userProfiles[username] = profilePicture;
      io.emit('profile_updated', { username, profilePicture });
    });

    socket.on('create_group', (data) => {
      const { groupName, creator } = data;
      if (!groups[groupName]) {
        groups[groupName] = {
          members: [creator],
          createdBy: creator,
          createdAt: new Date()
        };
        socket.join(groupName);
        io.emit('group_created', { groupName, members: groups[groupName].members });
        io.emit('all_groups', Object.keys(groups));
      }
    });

    socket.on('join_group', (data) => {
      const { groupName, username } = data;
      if (groups[groupName]) {
        if (!groups[groupName].members.includes(username)) {
          groups[groupName].members.push(username);
        }
        socket.join(groupName);
        io.to(groupName).emit('user_joined_group', { groupName, username });
        socket.emit('group_members', { groupName, members: groups[groupName].members });
      }
    });

    socket.on('send_group_message', (data) => {
      const { groupName, sender, text, imageUrl } = data;
      io.to(groupName).emit('receive_group_message', {
        groupName,
        sender,
        text,
        imageUrl,
        timestamp: new Date(),
      });
    });

    socket.on('send_message', async (data) => {
      const { sender, receiver, text, imageUrl } = data;
      const receiverSocketId = users[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          sender,
          text,
          imageUrl,
          timestamp: new Date(),
        });
        io.to(receiverSocketId).emit('notification', {
          sender,
          message: text || 'Sent an image',
        });
      }
      socket.emit('message_sent', {
        receiver,
        text,
        imageUrl,
        timestamp: new Date(),
      });
    });

    socket.on('typing', (data) => {
      const { sender, receiver } = data;
      const receiverSocketId = users[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { username: sender });
      }
    });

    socket.on('typing_group', (data) => {
      const { groupName, sender } = data;
      socket.to(groupName).emit('user_typing_group', { groupName, username: sender });
    });

    socket.on('stop_typing', (data) => {
      const { sender, receiver } = data;
      const receiverSocketId = users[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', { username: sender });
      }
    });

    socket.on('stop_typing_group', (data) => {
      const { groupName, sender } = data;
      socket.to(groupName).emit('user_stop_typing_group', { groupName, username: sender });
    });

    socket.on('disconnect', () => {
      for (const [username, socketId] of Object.entries(users)) {
        if (socketId === socket.id) {
          delete users[username];
          userStatuses[username] = 'offline';
          io.emit('user_status', { username, status: 'offline' });
          break;
        }
      }
    });
  });

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  }).listen(port, () => {
    console.log(`Server: http://${hostname}:${port}`);
  });
});
