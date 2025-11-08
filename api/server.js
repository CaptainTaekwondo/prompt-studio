// server.js (العقل المدبر لمشروع Prompt AI - إصدار Gemini)

const express = require('express');
const cors = require('cors');
// --- ✨ 1. جلب مكتبة جوجل للذكاء الاصطناعي ---
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json()); // (هام: للسماح باستقبال بيانات JSON)

// --- ✨ 2. وضع المفتاح السري الذي أعطيتني إياه ---
const GEMINI_API_KEY = 'AIzaSyCMxCMCqk4kMq2C6OJ19FTjXySRpvulHX4';
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
    5.  For Leonardo.ai: Include model presets if possible.
    6.  Make each prompt highly detailed, adding visual keywords, 8k, ultra-realistic, cinematic details based on the user's style.
    7.  Return ONLY the prompts, separated by "---".
    
    Example format:
    Midjourney: /imagine prompt: A cinematic shot... --ar 16:9 --v 6
    ---
    DALL-E 3: A detailed image of...
    ---
    Stable Diffusion: A photorealistic image of... \nNegative prompt: blurry, bad art...
    ---
    Grok (xAI): A hyper-realistic render of...
    ---
    Leonardo.ai: A moody portrait of...
  `;
}

// --- نقطة نهاية (Endpoint) لتوليد البرومبت ---
app.post('/api/generate-prompt', async (req, res) => {
    try {
        // 1. استقبال البيانات من الواجهة
        const { idea, type, style, lighting, composition } = req.body;
        
        // 2. بناء البرومبت الرئيسي
        const masterPrompt = createMasterPrompt(idea, type, style, lighting, composition);

        // --- ✨ 4. إرسال الطلب إلى Gemini ---
        console.log("Sending request to Gemini...");
        const result = await model.generateContent(masterPrompt);
        const response = await result.response;
        const generatedText = response.text();
        
        // (قد نحتاج لمعالجة النص هنا، لكننا سنرسله كما هو الآن)

        // 5. إرسال الرد للواجهة
        res.json({
            professionalPrompt: generatedText // (هذا هو الرد الحقيقي من Gemini)
        });

    } catch (error) {
        console.error("Error generating prompt:", error.message);
        res.status(500).json({ error: "فشل في توليد البرومبت من Gemini" });
    }
});

// --- تصدير التطبيق لـ Vercel ---
module.exports = app;
