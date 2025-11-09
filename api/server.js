const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// استخدام environment variable من Vercel
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/generate-prompt', async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY غير موجود في environment variables");
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const { idea, type, style, lighting, composition } = req.body;
        
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
        
        const result = await model.generateContent(fullPrompt);
        const generatedText = await result.response.text();

        res.json({ professionalPrompt: generatedText });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: `فشل في توليد البرومبت: ${error.message}` });
    }
});

// خدمة الملفات الثابتة
app.use(express.static('.'));

module.exports = app;
