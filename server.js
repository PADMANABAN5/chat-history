// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const chatDir = path.join(__dirname, "chats");
if (!fs.existsSync(chatDir)) fs.mkdirSync(chatDir);

// Load chat history
app.get("/chat/:username", (req, res) => {
  const filePath = path.join(chatDir, `${req.params.username}.txt`);
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.json([]);
    const lines = data.trim().split("\n").map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
    res.json(lines);
  });
});

// Save message
app.post("/chat", (req, res) => {
  const { username, user, system } = req.body;
  const filePath = path.join(chatDir, `${username}.txt`);
  const message = JSON.stringify({ user, system }) + "\n";
  fs.appendFile(filePath, message, (err) => {
    if (err) return res.status(500).send("Error saving chat");
    res.send("Message saved");
  });
});

const PORT = 10000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
