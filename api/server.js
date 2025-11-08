// server.js (إصدار اختبار الاتصال - Simple Test)

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. المفتاح السري (الآمن) ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });


// --- نقطة نهاية (Endpoint) لتوليد البرومبت ---
app.post('/api/generate-prompt', async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error("مفتاح Gemini API غير موجود في الخزنة");
        }
        
        // --- ✨ هنا الاختبار البسيط: نسأل عن الوقت فقط ---
        const testPrompt = "What is the current time? Answer in English only.";
        
        console.log("Sending simple test prompt to Gemini...");
        
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        const generatedText = response.text();
        
        // 5. إرسال الرد للواجهة
        res.json({
            // إرسال الرد البسيط، مع رسالة تأكيد للنجاح
            professionalPrompt: `✅ الاتصال ناجح! هذا هو رد Gemini: ${generatedText}`
        });

    } catch (error) {
        console.error("Error generating prompt:", error.message);
        res.status(500).json({ error: "فشل في توليد البرومبت. (الخادم فشل في الاتصال بجوجل)" });
    }
});

module.exports = app;
