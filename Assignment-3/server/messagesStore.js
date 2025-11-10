const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'messages.json');

// Ensure messages.json exists
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([]));

function saveMessage(msg) {
  const messages = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  messages.push(msg);
  fs.writeFileSync(dbPath, JSON.stringify(messages, null, 2));
}

function getMessages(user1, user2) {
  const messages = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  return messages.filter(
    (m) =>
      (m.sender === user1 && m.receiver === user2) ||
      (m.sender === user2 && m.receiver === user1)
  );
}

module.exports = { saveMessage, getMessages };
