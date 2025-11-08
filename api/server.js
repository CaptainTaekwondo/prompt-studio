// server.js (العقل المدبر لمشروع Prompt AI - الإصدار النهائي والآمن)

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. جلب المفتاح السري من "خزنة" Vercel (آمن) ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

// --- 2. "البرومبت الرئيسي" السري (تعليمات النظام) ---
function createMasterPrompt(idea, type, style, lighting, composition) {
  // ترجمة النوع
  const mediaType = (type === 'video') ? 'video scene' : 'image';

  // بناء البرومبت الرئيسي
  return `
    You are a world-class prompt engineer for AI image and video generators.
    Your task is to take a simple user idea and convert it into multiple, expert-level, detailed professional prompts in ENGLISH.
    
    RULES:
    1.  All prompts MUST be in ENGLISH.
    2.  Generate a list of 5 professional prompts, one for each of the following platforms: Midjourney, DALL-E 3, Stable Diffusion, Grok (xAI), and Leonardo.ai.
    3.  For Midjourney: Include parameters like --ar, --v 6, --style raw.
    4.  For Stable Diffusion: Include a detailed "Negative prompt:".
    5.  For DALL-E 3: Use simple, clear descriptive language.
    6.  For Leonardo.ai: Include model presets if possible.
    7.  Make each prompt highly detailed, adding visual keywords, 8k, ultra-realistic, cinematic details based on the user's style.
    8.  Return ONLY the 5 prompts, separated by "---".
    9.  DO NOT include my instructions or any other text in your response. Only the 5 prompts.
    
    USER INPUTS:
    - Core Idea: "${idea}"
    - Type: ${mediaType}
    - Style: "${style}"
    - Lighting: "${lighting}"
    - Composition: "${composition}"
  `;
}

// --- نقطة نهاية (Endpoint) لتوليد البرومبت ---
app.post('/api/generate-prompt', async (req, res) => {
    try {
        // التحقق من أن المفتاح تم جلبه بنجاح من الخزنة
        if (!GEMINI_API_KEY || !model) {
            return res.status(500).json({ 
                error: "فشل الإعداد: مفتاح Gemini API غير موجود أو غير مُفعَّل." 
            });
        }
        
        // 1. استقبال البيانات من الواجهة
        const { idea, type, style, lighting, composition } = req.body;
        
        // 2. بناء "رسالة المستخدم" (ما سنرسله للدردشة)
        const userMessage = `
          Core Idea: "${idea}"
          Type: ${type === 'video' ? 'video scene' : 'image'}
          Style: "${style}"
          Lighting: "${lighting}"
          Composition: "${composition}"
        `;
        
        // 3. بدء "دردشة" جديدة وإرسال رسالة المستخدم
        const chat = model.startChat();
        const result = await chat.sendMessage(userMessage); 
        const response = await result.response;
        const generatedText = response.text();
        
        // 4. إرسال الرد للواجهة
        res.json({
            professionalPrompt: generatedText // (هذا هو الرد الحقيقي من Gemini)
        });

    } catch (error) {
        console.error("Error generating prompt:", error.message);
        res.status(500).json({ error: `فشل في توليد البرومبت. (السبب: ${error.message})` });
    }
});

module.exports = app;
