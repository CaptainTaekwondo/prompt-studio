// server.js (الإصدار الاحترافي v3.0 - Static Engine - مع الأبعاد)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. مكتبة بيانات المنصات (تم تحديثها لتستخدم الأبعاد) ---
const platformsData = {
    // 🖼️ منصات الصور
    'midjourney': {
        name: 'Midjourney', logo: '🎨', url: 'https://www.midjourney.com',
        // --- ✨ (محدّث) إضافة الأبعاد ---
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `/imagine prompt: ${idea}, ${style || 'realistic'} style, ${lighting || 'natural'} lighting, ${composition || 'medium shot'} composition, 8K resolution, ultra-detailed, cinematic quality --ar ${aspectRatio || '1:1'} --v 6.2 --style raw`
    },
    'dalle3': {
        name: 'DALL-E 3', logo: '🤖', url: 'https://openai.com/dall-e-3',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `A professional ${style || 'realistic'} image of "${idea}" with ${lighting || 'natural'} lighting and ${composition || 'creative'} composition. (Aspect Ratio: ${aspectRatio || '1:1'}). Highly detailed, 8K resolution, cinematic quality.`
    },
    'stablediffusion': {
        name: 'Stable Diffusion', logo: '⚙️', url: 'https://stability.ai/stable-diffusion',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `(masterpiece, best quality, 8K UHD:1.3), ${idea}, (${style || 'photorealistic'}:1.2), ${lighting || 'studio light'}, ${composition || 'dynamic angle'}, detailed background, sharp focus, aspect ratio ${aspectRatio || '1:1'}\n📝 Negative prompt: (blurry:1.2), low quality, worst quality, cartoon, anime, deformed, ugly`
    },
    'leonardo': {
        name: 'Leonardo.ai', logo: '🦁', url: 'https://leonardo.ai',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `${idea} | ${style || 'realistic'} style | ${lighting || 'professional'} lighting | ${composition || 'well-composed'} | Aspect Ratio ${aspectRatio || '1:1'} | 8K | ultra-detailed | cinematic`
    },
    'adobefirefly': {
        name: 'Adobe Firefly', logo: '🔥', url: 'https://firefly.adobe.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Professional ${style || 'realistic'} photograph of ${idea} with ${lighting || 'natural'} lighting, ${composition || 'balanced'} composition. Aspect Ratio ${aspectRatio || '1:1'}. 8K resolution, high detail, commercial quality`
    },
    'gemini': {
        name: 'Google Gemini', logo: '💎', url: 'https://gemini.google.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Create a detailed, visually stunning image of ${idea} in ${style || 'realistic'} style. Use ${lighting || 'natural'} lighting and ${composition || 'professional'} composition. Aspect Ratio ${aspectRatio || '1:1'}. Focus on high quality, 8K resolution.`
    },
    'chatgpt': {
        name: 'ChatGPT DALL-E', logo: '💬', url: 'https://chatgpt.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Generate a detailed image description of ${idea} with ${style || 'realistic'} aesthetic, ${lighting || 'natural'} lighting, and ${composition || 'creative'} framing. Aspect Ratio ${aspectRatio || '1:1'}. Make it visually compelling.`
    },
    'grok': {
        name: 'Grok AI', logo: '🦄', url: 'https://x.ai/grok',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Create a highly detailed visual description of ${idea} with ${style || 'realistic'} style, ${lighting || 'dramatic'} lighting, and ${composition || 'creative'} composition. Aspect Ratio ${aspectRatio || '1:1'}. Be vivid for AI generation.`
    },
    // 🎬 منصات الفيديو
    'runway': {
        name: 'Runway ML', logo: '🎬', url: 'https://runwayml.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Cinematic video scene of ${idea} with ${style || 'realistic'} visual style, ${lighting || 'dramatic'} lighting and ${composition || 'dynamic'} camera movement. Aspect Ratio ${aspectRatio || '16:9'}. Smooth motion, 4K resolution.`
    },
    'pika': {
        name: 'Pika Labs', logo: '⚡', url: 'https://pika.art',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `A short video clip of ${idea} in ${style || 'cinematic'} style, featuring ${lighting || 'moody'} lighting and ${composition || 'creative'} framing. Aspect Ratio ${aspectRatio || '16:9'}. Smooth animation, 4-second duration.`
    },
    'luma': {
        name: 'Luma Dream Machine', logo: '✨', url: 'https://lumalabs.ai',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Cinematic video of ${idea} with ${style || 'realistic'} visual style, ${lighting || 'cinematic'} lighting, and ${composition || 'professional'} camera work. Aspect Ratio ${aspectRatio || '16:9'}. High motion consistency, 4K quality.`
    },
    'stablevideo': {
        name: 'Stable Video', logo: '📹', url: 'https://stability.ai/stable-video',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `(masterpiece video:1.3), ${idea}, ${style || 'realistic'}, ${lighting || 'professional'}, ${composition || 'dynamic'}, aspect ratio ${aspectRatio || '16:9'}, smooth motion, 25fps\nNegative prompt: jerky motion, flickering`
    },
    'kaiber': {
        name: 'Kaiber', logo: '🌊', url: 'https://kaiber.ai',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `An artistic video of ${idea} in ${style || 'cinematic'} style with ${lighting || 'emotional'} lighting. Aspect Ratio ${aspectRatio || '16:9'}. Dreamlike motion, 4-second duration.`
    },
};

// --- 2. نقطة API الرئيسية (المعدلة لترسل JSON) ---
app.post('/api/generate-prompt', (req, res) => {
    try {
        // --- ✨ (محدّث) استقبال الأبعاد ---
        const { idea, type, style, lighting, composition, aspectRatio, platform } = req.body;
        
        if (!idea) {
            return res.status(400).json({ error: 'Idea is required' });
        }

        const imagePlatforms = ['midjourney', 'dalle3', 'stablediffusion', 'leonardo', 'adobefirefly', 'gemini', 'chatgpt', 'grok'];
        const videoPlatforms = ['runway', 'pika', 'luma', 'stablevideo', 'kaiber', 'grok'];
        
        let targetPlatforms = [];

        if (platform && platform !== 'all') {
            if (platformsData[platform]) {
                targetPlatforms = [platform];
            } else {
                return res.status(400).json({ error: 'Platform not found' });
            }
        } 
        else {
            targetPlatforms = type === 'video' ? videoPlatforms : imagePlatforms;
        }

        // --- 3. بناء الرد المنظم (JSON) ---
        const results = targetPlatforms.map(platformId => {
            const data = platformsData[platformId];
            if (!data) return null; 
            const promptFunction = data.prompt;
            
            return {
                id: platformId,
                name: data.name,
                logo: data.logo,
                url: data.url,
                // --- ✨ (محدّث) إرسال الأبعاد للدالة ---
                prompt: promptFunction(idea, style, lighting, composition, aspectRatio) 
            };
        }).filter(p => p !== null); 

        res.json({ 
            success: true,
            prompts: results 
        });

    } catch (error) {
        console.error('Error generating prompt:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate prompt: ' + error.message 
        });
    }
});

// (تصدير لـ Vercel)
module.exports = app;
