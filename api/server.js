// server.js (باستخدام Google Secret Manager)

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager'); 

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️⚠️ يجب تغيير هذا بمعرف المشروع الخاص بك (Project ID)
const PROJECT_ID = 'YOUR_GOOGLE_CLOUD_PROJECT_ID'; 
// هذا هو اسم السر الذي سنقوم بإنشائه في خزنة جوجل
const SECRET_NAME = 'gemini-api-key-prompt-studio';

// عميل Secret Manager (لجلب المفتاح)
const secretManagerClient = new SecretManagerServiceClient();

// --- دالة جلب المفتاح من خزنة جوجل ---
async function getApiKeyFromSecretManager() {
    if (PROJECT_ID === 'YOUR_GOOGLE_CLOUD_PROJECT_ID') {
         throw new Error("يجب تحديث المتغير PROJECT_ID في server.js بمعرف المشروع الصحيح.");
    }
    try {
        const [version] = await secretManagerClient.accessSecretVersion({
            name: `projects/${PROJECT_ID}/secrets/${SECRET_NAME}/versions/latest`,
        });
        // المفتاح يكون في صيغة Buffer، نقوم بتحويله إلى نص (string)
        const apiKey = version.payload.data.toString('utf8');
        return apiKey;
    } catch (error) {
        console.error("فشل جلب المفتاح من خزنة جوجل:", error);
        // هذا الخطأ سيظهر إذا لم تكن هناك صلاحية أو المفتاح غير موجود
        throw new Error(`فشل إعداد الخزنة: ${error.details || error.message}`);
    }
}

// --- نقطة النهاية لتوليد البرومبت (الآن يجلب المفتاح في كل طلب) ---
app.post('/api/generate-prompt', async (req, res) => {
    try {
        // 1. جلب المفتاح مباشرة من خزنة جوجل في بداية كل طلب (أكثر أماناً)
        const GEMINI_API_KEY = await getApiKeyFromSecretManager();
        
        // 2. إعداد Gemini API باستخدام المفتاح الذي تم جلبه للتو
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 3. استقبال بيانات المستخدم (نفس ما كان موجوداً)
        const { idea, type, style, lighting, composition } = req.body;
        
        // بناء البرومبت الرئيسي (نفس ما كان موجوداً)
        const mediaType = (type === 'video') ? 'video scene' : 'image';
        const fullPrompt = `
            You are a world-class prompt engineer for AI image and video generators.
            Your task is to take a simple user idea and convert it into multiple, expert-level, detailed professional prompts in ENGLISH.
            
            RULES:
            1. All prompts MUST be in ENGLISH.
            2. Generate a list of 5 professional prompts, one for each of the following platforms: Midjourney, DALL-E 3, Stable Diffusion, Grok (xAI), and Leonardo.ai.
            3. For Midjourney: Include parameters like --ar, --v 6, --style raw.
            4. For Stable Diffusion: Include a detailed "Negative prompt:".
            5. For DALL-E 3: Use simple, clear descriptive language.
            6. For Leonardo.ai: Include model presets if possible.
            7. Make each prompt highly detailed, adding visual keywords, 8k, ultra-realistic, cinematic details based on the user's style.
            8. Return ONLY the 5 prompts, separated by "---".
            9. DO NOT include my instructions or any other text in your response.

            USER INPUTS:
            - Core Idea: "${idea}"
            - Type: ${mediaType}
            - Style: "${style}"
            - Lighting: "${lighting}"
            - Composition: "${composition}"
        `;
        
        // 4. إرسال البرومبت إلى Gemini
        const result = await model.generateContent(fullPrompt);
        const generatedText = await result.response.text();

        // 5. إعادة النتيجة
        res.json({
            professionalPrompt: generatedText
        });

    } catch (error) {
        console.error("Error generating prompt:", error.message);
        res.status(500).json({ error: `فشل في توليد البرومبت. (السبب: ${error.message})` });
    }
});

module.exports = app;
