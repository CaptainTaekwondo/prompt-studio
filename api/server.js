// server.js (العقل المدبر لمشروع Prompt AI)

const express = require('express');
const cors = require('cors');
// (سنحتاج مكتبة Google Gemini لاحقاً، لكننا سنجهز الكود الآن)
// const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json()); // (هام: للسماح باستقبال بيانات JSON)

// (!!! هام: سنضع المفتاح هنا لاحقاً !!!)
// const GEMINI_API_KEY = 'YOUR_GEMINI_KEY_HERE';
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- نقطة نهاية (Endpoint) لتوليد البرومبت ---
app.post('/api/generate-prompt', async (req, res) => {
    try {
        // 1. استقبال البيانات من الواجهة
        const { idea, style, lighting, composition } = req.body;

        // 2. (مؤقتاً) سنقوم برد "وهمي" (Mock) لأننا لم نربط Gemini بعد
        // (هذا هو البرومبت الرئيسي الذي تحدثنا عنه)
        const masterPrompt = `
            أنت خبير في كتابة البرومبتات لبرامج توليد الصور.
            الفكرة الأساسية: "${idea}"
            الأسلوب الفني: "${style}"
            الإضاءة: "${lighting}"
            التكوين: "${composition}"
            
            (هذا رد وهمي - سيتم استبداله بـ Gemini)
            A hyper-realistic cinematic shot of: ${idea}, ${style}, ${lighting}, ${composition}, 8k, ultra-detailed.
        `;

        // (مستقبلاً، سنرسل هذا "البرومبت الرئيسي" إلى Gemini ليقوم بالعمل الحقيقي)

        // 3. إرسال الرد للواجهة
        res.json({
            professionalPrompt: masterPrompt 
        });

    } catch (error) {
        console.error("Error generating prompt:", error);
        res.status(500).json({ error: "فشل في توليد البرومبت" });
    }
});

// --- تصدير التطبيق لـ Vercel ---
module.exports = app;
