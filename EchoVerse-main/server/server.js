// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// Initialize Gemini with API key as environment variable
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY ;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.use(cors());
app.use(express.json());

// Rate limiting variables
const REQUESTS_PER_MINUTE = 60;
const requestCounts = new Map();

// Simple rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  
  const userRequests = requestCounts.get(ip) || {};
  if (userRequests.minute === minute) {
    if (userRequests.count >= REQUESTS_PER_MINUTE) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    userRequests.count++;
  } else {
    userRequests.minute = minute;
    userRequests.count = 1;
  }
  requestCounts.set(ip, userRequests);
  next();
};

app.post('/api/translate', rateLimiter, async (req, res) => {
  const { text, targetLang } = req.body;
  
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Please provide text and target language' });
  }

  // Check text length
  if (text.length > 1000) {
    return res.status(400).json({ error: 'Text too long. Please limit to 1000 characters.' });
  }

  try {
    const prompt = `Translate this text to ${targetLang}. Only provide the translation without any additional text or explanation: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API key ${API_KEY ? 'is' : 'is not'} configured`);
});