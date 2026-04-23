const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
const CHAT_MODELS = [
  process.env.GEMINI_MODEL_PRIMARY || "gemini-1.5-flash",
  process.env.GEMINI_MODEL_FALLBACK || "gemini-1.5-flash-8b",
];
const FALLBACK_REPLY =
  "I am having trouble reaching the AI service right now. Please try again in a moment.";

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

const normalizeModelText = (response) => {
  if (!response) return "";
  if (typeof response.text === "string") return response.text;
  if (typeof response.text === "function") return response.text() || "";
  return "";
};

const getProviderStatusCode = (error) => {
  const numericStatus = Number(error?.status);
  if (Number.isFinite(numericStatus) && numericStatus > 0) return numericStatus;

  const message = error?.message;
  if (!message || typeof message !== "string") return 0;

  const codeMatch = message.match(/"code"\s*:\s*(\d{3})/);
  return codeMatch ? Number(codeMatch[1]) : 0;
};

const isExpectedProviderError = (error) => {
  const status = getProviderStatusCode(error);
  return [429, 500, 502, 503, 504].includes(status);
};

const extractRetryAfterSeconds = (error) => {
  const retryDelayMatch = error?.message?.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (retryDelayMatch) return Number(retryDelayMatch[1]);

  const plainTextDelayMatch = error?.message?.match(/retry in\s+([\d.]+)s/i);
  if (plainTextDelayMatch) {
    return Math.ceil(Number(plainTextDelayMatch[1]));
  }

  return null;
};

const parseModelPayload = (rawText) => {
  if (!rawText) {
    return {
      reply: "No reply generated",
      points: 5,
    };
  }

  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidateJson = fencedMatch ? fencedMatch[1].trim() : trimmed;

  try {
    const parsed = JSON.parse(candidateJson);
    return {
      reply: parsed?.reply || "No reply generated",
      points: Number(parsed?.points) || 5,
    };
  } catch {
    return {
      reply: trimmed,
      points: 5,
    };
  }
};

const generateReplyWithFallbackModels = async (prompt) => {
  let lastError;

  for (const model of CHAT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const rawText = normalizeModelText(response);
      return parseModelPayload(rawText);
    } catch (error) {
      lastError = error;
      const status = getProviderStatusCode(error);
      console.warn(
        `Model ${model} failed (${status || "unknown"}):`,
        error?.message || error
      );
    }
  }

  return {
    reply: FALLBACK_REPLY,
    points: 1,
    degraded: true,
    retryAfterSeconds: extractRetryAfterSeconds(lastError),
    failureStatus: getProviderStatusCode(lastError),
    failureMessage: lastError?.message || "All configured Gemini models failed",
  };
};

app.post("/chat", async (req, res) => {
  try {
    const { message, walletAddress, chatHistory = [] } = req.body;

    if (!message || !walletAddress) {
      return res.status(400).json({
        error: "message and walletAddress are required",
      });
    }

    const normalizedMessage = String(message).trim();
    const recentMessages = Array.isArray(chatHistory)
      ? chatHistory.slice(-12)
      : [];

    const looksLikeSpam =
      normalizedMessage.length < 5 ||
      /^(hi|hello|ok|yo|test|h+|lol)$/i.test(normalizedMessage);

    if (looksLikeSpam) {
      return res.json({
        success: true,
        reply:
          "Please ask a more meaningful question so I can help and award points fairly.",
        points: 0,
        flagged: "low_effort",
      });
    }

    const prompt = `
You are a helpful AI chatbot for a blockchain rewards app.

Rules:
- Give a clear and short answer.
- Be helpful and accurate.
- Keep the reply simple for students.
- Score engagement from 0 to 10.
- Return 0 points for repeated or low-effort spam messages.
- Return JSON only.

Recent chat history (latest up to 12 entries):
${JSON.stringify(recentMessages)}


User wallet: ${walletAddress}
User message: ${normalizedMessage}

Return your answer in this exact JSON format:
{
  "reply": "your answer here",
  "points": 10
}
`;

    const parsed = await generateReplyWithFallbackModels(prompt);

    if (parsed.degraded) {
      const expectedFailure = isExpectedProviderError({
        status: parsed.failureStatus,
      });

      if (expectedFailure) {
        console.warn(
          "Chat degraded due to Gemini provider quota/capacity:",
          parsed.failureMessage
        );
      } else {
        console.error("Chat degraded due to unexpected provider error:", parsed.failureMessage);
      }
    }

    return res.json({
      success: true,
      reply: parsed.reply || "No reply generated",
      points: Number(parsed.points) || 5,
      degraded: Boolean(parsed.degraded),
      retryAfterSeconds:
        typeof parsed.retryAfterSeconds === "number" ? parsed.retryAfterSeconds : null,
    });
  } catch (error) {
    const expectedFailure = isExpectedProviderError(error);

    if (expectedFailure) {
      console.warn("Chat degraded due to Gemini provider quota/capacity:", error?.message || error);
    } else {
      console.error("Chat error:", error);
    }

    return res.json({
      success: false,
      degraded: true,
      reply: FALLBACK_REPLY,
      points: 1,
      error: "Failed to get AI response",
      details: error?.message || "Unknown error",
      retryAfterSeconds: extractRetryAfterSeconds(error),
    });
  }
});

app.post("/redeem", async (req, res) => {
  try {
    const { walletAddress, pointsToBurn, conversationId } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "walletAddress is required",
      });
    }

    if (!pointsToBurn || pointsToBurn < 5) {
      return res.status(400).json({
        success: false,
        message: "Need at least 5 points to redeem",
      });
    }

    return res.json({
      success: true,
      message: `Redeem successful for ${pointsToBurn} points from ${walletAddress}`,
      txDigest: "demo_tx_digest_123456",
      rewardObjectId: "demo_reward_object_7890",
      conversationId,
    });
  } catch (error) {
    console.error("Redeem route error:", error);
    return res.status(500).json({
      success: false,
      message: "Redeem failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});