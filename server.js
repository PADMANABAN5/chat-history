const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Chat history folder
const chatFolder = path.join(__dirname, "chatHistories");

// Create folder if it doesn't exist
if (!fs.existsSync(chatFolder)) {
  fs.mkdirSync(chatFolder);
}

// ✅ Save chat history to file
app.post("/api/saveChatHistory", async (req, res) => {
  try {
    const { username, model, timestamp, chatHistory } = req.body;

    if (!username || !chatHistory) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const filePath = path.join(chatFolder, `${username}.json`);
    const dataToSave = {
      username,
      model,
      timestamp,
      chatHistory,
    };

    fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), (err) => {
      if (err) {
        console.error("Error saving chat history:", err);
        return res.status(500).json({ success: false, error: "Failed to save chat history" });
      }
      res.json({ success: true });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ success: false, error: "Unexpected error occurred" });
  }
});

// ✅ Load chat history from file
app.get("/loadChat/:username", (req, res) => {
  const { username } = req.params;
  const filePath = path.join(chatFolder, `${username}.json`);

  if (!fs.existsSync(filePath)) {
    return res.json({ chatHistory: [] });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading chat:", err);
      return res.status(500).json({ message: "Failed to load chat." });
    }

    try {
      const parsedData = JSON.parse(data);
      res.json(parsedData); // { username, model, timestamp, chatHistory }
    } catch (parseError) {
      console.error("Error parsing chat file:", parseError);
      res.status(500).json({ message: "Corrupted chat file" });
    }
  });
});

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Chat API is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
