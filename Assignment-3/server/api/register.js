const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersFile = path.join(__dirname, 'users.json');

router.post('/', async (req, res) => {
  const { username, password, profilePicture } = req.body;

  const users = fs.existsSync(usersFile)
    ? JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
    : [];

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, profilePicture });

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.json({ message: 'Registered successfully' });
});

module.exports = router;
