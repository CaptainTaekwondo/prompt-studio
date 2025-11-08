// server.js (إصدار اختبار الاتصال - Simple Test)

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. جلب المفتاح السري من "خزنة" Vercel ---
// (هذا هو المفتاح الجديد الذي يجب أن يعمل)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// (يجب أن نتحقق من وجود المفتاح قبل محاولة استخدامه)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;


// --- نقطة نهاية (Endpoint) لتوليد البرومبت ---
app.post('/api/generate-prompt', async (req, res) => {
    try {
        // 1. التحقق النهائي: هل المفتاح صالح؟
        if (!GEMINI_API_KEY || !model) {
            return res.status(500).json({ 
                error: "فشل الإعداد: مفتاح Gemini API غير موجود في خزنة Vercel." 
            });
        }
        
        // --- ✨ هنا الاختبار الذري: نسأل عن التاريخ والوقت فقط ---
        const testPrompt = "What is the current date and time? Answer in English only and be concise.";
        
        console.log("Sending final sanity test to Gemini...");
        
        // 2. إرسال السؤال البسيط
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        const generatedText = response.text();
        
        // 3. إرسال الرد للواجهة
        res.json({
            // إرسال الرد البسيط، مع رسالة تأكيد للنجاح
            professionalPrompt: `✅ الاتصال ناجح! هذا هو رد Gemini: ${generatedText}`
        });

    } catch (error) {
        console.error("Error generating prompt:", error);
        // هذا الخطأ سيظهر إذا كانت الخدمة "غير مفعلة" (403)
        res.status(500).json({ error: `فشل في توليد البرومبت. (السبب: ${error.message})` });
    }
});

module.exports = app;
