// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const chatFilePath = './chats.json';

app.use(cors());
app.use(express.json());

// Load existing chat data from file
let chatStorage = {};
if (fs.existsSync(chatFilePath)) {
  const fileData = fs.readFileSync(chatFilePath);
  chatStorage = JSON.parse(fileData);
}

// Save chatStorage to file
function saveChatToFile() {
  fs.writeFileSync(chatFilePath, JSON.stringify(chatStorage, null, 2));
}

// Save chat history
app.post('/api/saveChatHistory', (req, res) => {
  const { username, model, chatHistory, timestamp } = req.body;

  if (!chatStorage[username]) chatStorage[username] = [];

  chatStorage[username].push({ model, chatHistory, timestamp });

  saveChatToFile(); // persist to file

  res.status(200).json({ message: 'Chat history saved successfully' });
});

// Load chat history
app.get('/loadChat/:username', (req, res) => {
  const username = req.params.username;
  const chats = chatStorage[username] || [];

  res.status(200).json({ chatHistory: chats });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


