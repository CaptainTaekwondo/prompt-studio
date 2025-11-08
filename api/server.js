// server.js (العقل المدبر لمشروع Prompt AI - إصدار Gemini الآمن)

const express = require('express');
const cors = require('cors');
// --- ✨ 1. جلب مكتبة جوجل للذكاء الاصطناعي ---
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json()); // (هام: للسماح باستقبال بيانات JSON)

// --- ✨ 2. (الآمن) جلب المفتاح السري من "خزنة" Vercel ---
// (هذا يخبر الكود: "اذهب إلى خزنة Vercel وأحضر المفتاح")
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- 3. "البرومبت الرئيسي" السري (الذي سيأمر Gemini) ---
function createMasterPrompt(idea, type, style, lighting, composition, platform) {
  // ترجمة النوع
  const mediaType = (type === 'video') ? 'video scene' : 'image';

  // بناء البرومبت الرئيسي
  return `
    You are a world-class prompt engineer for AI image and video generators.
    Your task is to take a simple user idea and convert it into multiple, expert-level, detailed professional prompts in ENGLISH.
    
    The user's core idea is: "${idea}"
    The user wants a: ${mediaType}
    The style should be: "${style}"
    The lighting should be: "${lighting}"
    The composition should be: "${composition}"

    Based on these inputs, generate a list of 5 professional prompts, one for each of the following platforms: Midjourney, DALL-E 3, Stable Diffusion, Grok (xAI), and Leonardo.ai.
    
    RULES:
    1.  All prompts MUST be in ENGLISH.
    2.  For Midjourney: Include parameters like --ar, --v 6, --style raw.
    3.  For Stable Diffusion: Include a detailed "Negative prompt:".
    4.  For DALL-E 3: Use simple, clear descriptive language.
    5.  For Leonardo.ai: Include model presets
