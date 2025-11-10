const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersFile = path.join(__dirname, 'users.json');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  const users = fs.existsSync(usersFile)
    ? JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
    : [];

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

  res.json({ message: 'Login successful', user });
});

module.exports = router;
