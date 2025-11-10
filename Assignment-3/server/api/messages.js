const express = require('express');
const router = express.Router();
const { saveMessage, getMessages } = require('../messagesStore');

// Save a message
router.post('/', (req, res) => {
  const msg = req.body;
  if (!msg.sender || !msg.text) return res.status(400).json({ message: 'Invalid data' });
  saveMessage({ ...msg, timestamp: new Date() });
  res.json({ success: true });
});

// Get message history
router.get('/', (req, res) => {
  const { user1, user2, groupName } = req.query;
  if (groupName) {
    return res.json([]); // handle group later
  }
  const history = getMessages(user1, user2);
  res.json(history);
});

module.exports = router;
