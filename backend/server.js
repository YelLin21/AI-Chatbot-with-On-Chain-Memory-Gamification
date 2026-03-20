const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AI Chatbot backend is running with Gemini API" });
});

app.post("/chat", async (req, res) => {
  try {
    const { message, walletAddress } = req.body;

    if (!message || !walletAddress) {
      return res.status(400).json({
        error: "message and walletAddress are required",
      });
    }

    const prompt = `
You are a helpful AI chatbot for a blockchain rewards app.

Rules:
- Give a clear and short answer.
- Be helpful and accurate.
- Keep the reply simple for students.
- At the end, also score this message from 1 to 10 for engagement.

User wallet: ${walletAddress}
User message: ${message}

Return your answer in this exact JSON format:
{
  "reply": "your answer here",
  "points": 10
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const rawText = response.text || "";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        reply: rawText || "No reply generated",
        points: 5,
      };
    }

    return res.json({
      success: true,
      reply: parsed.reply || "No reply generated",
      points: Number(parsed.points) || 5,
    });
  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      error: "Failed to get AI response",
      details: error.message || "Unknown error",
    });
  }
});

app.post("/redeem", async (req, res) => {
  try {
    const { walletAddress, pointsToBurn } = req.body;

    if (!walletAddress || !pointsToBurn) {
      return res.status(400).json({
        error: "walletAddress and pointsToBurn are required",
      });
    }

    return res.json({
      success: true,
      message: `Redeem request received for ${pointsToBurn} points from ${walletAddress}`,
    });
  } catch (error) {
    console.error("Redeem error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message || "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});