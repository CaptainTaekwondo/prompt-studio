// server.js (الإصدار الاحترافي v3.0 - Static Engine)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. مكتبة بيانات المنصات (التي أعددتها أنت) ---
const platformsData = {
    // 🖼️ منصات الصور
    'midjourney': {
        name: 'Midjourney', logo: '🎨', url: 'https://www.midjourney.com',
        prompt: (idea, style, lighting, composition) => 
            `/imagine prompt: ${idea}, ${style || 'realistic'} style, ${lighting || 'natural'} lighting, ${composition || 'medium shot'} composition, 8K resolution, ultra-detailed, cinematic quality --ar 16:9 --v 6.2 --style raw --stylize 750`
    },
    'dalle3': {
        name: 'DALL-E 3', logo: '🤖', url: 'https://openai.com/dall-e-3',
        prompt: (idea, style, lighting, composition) => 
            `A professional ${style || 'realistic'} image of "${idea}" with ${lighting || 'natural'} lighting and ${composition || 'creative'} composition. Highly detailed, 8K resolution, cinematic quality, professional photography`
    },
    'stablediffusion': {
        name: 'Stable Diffusion', logo: '⚙️', url: 'https://stability.ai/stable-diffusion',
        prompt: (idea, style, lighting, composition) => 
            `(masterpiece, best quality, 8K UHD:1.3), ${idea}, (${style || 'photorealistic'}:1.2), ${lighting || 'studio light'}, ${composition || 'dynamic angle'}, detailed background, sharp focus\n📝 Negative prompt: (blurry:1.2), low quality, worst quality, cartoon, anime, deformed, ugly`
    },
    'leonardo': {
        name: 'Leonardo.ai', logo: '🦁', url: 'https://leonardo.ai',
        prompt: (idea, style, lighting, composition) => 
            `${idea} | ${style || 'realistic'} style | ${lighting || 'professional'} lighting | ${composition || 'well-composed'} | 8K | ultra-detailed | cinematic | professional photography`
    },
    'adobefirefly': {
        name: 'Adobe Firefly', logo: '🔥', url: 'https://firefly.adobe.com',
        prompt: (idea, style, lighting, composition) => 
            `Professional ${style || 'realistic'} photograph of ${idea} with ${lighting || 'natural'} lighting, ${composition || 'balanced'} composition. 8K resolution, high detail, commercial quality`
    },
    'gemini': {
        name: 'Google Gemini', logo: '💎', url: 'https://gemini.google.com',
        prompt: (idea, style, lighting, composition) => 
            `Create a detailed, visually stunning image of ${idea} in ${style || 'realistic'} style. Use ${lighting || 'natural'} lighting and ${composition || 'professional'} composition. Focus on high quality, 8K resolution, and artistic excellence`
    },
    'chatgpt': {
        name: 'ChatGPT DALL-E', logo: '💬', url: 'https://chatgpt.com',
        prompt: (idea, style, lighting, composition) => 
            `Generate a detailed image description of ${idea} with ${style || 'realistic'} aesthetic, ${lighting || 'natural'} lighting, and ${composition || 'creative'} framing. Make it visually compelling and highly detailed`
    },
    'grok': {
        name: 'Grok AI', logo: '🦄', url: 'https://x.ai/grok',
        prompt: (idea, style, lighting, composition) => 
            `Create a highly detailed and imaginative visual description of ${idea} with ${style || 'realistic'} style, ${lighting || 'dramatic'} lighting, and ${composition || 'creative'} composition. Be vivid and descriptive for AI image generation`
    },
    // 🎬 منصات الفيديو
    'runway': {
        name: 'Runway ML', logo: '🎬', url: 'https://runwayml.com',
        prompt: (idea, style, lighting, composition) => 
            `Cinematic video scene of ${idea} with ${style || 'realistic'} visual style, ${lighting || 'dramatic'} lighting and ${composition || 'dynamic'} camera movement. Smooth motion, 4K resolution, professional cinematography, 24fps`
    },
    'pika': {
        name: 'Pika Labs', logo: '⚡', url: 'https://pika.art',
        prompt: (idea, style, lighting, composition) => 
            `A short video clip of ${idea} in ${style || 'cinematic'} style, featuring ${lighting || 'moody'} lighting and ${composition || 'creative'} framing. Smooth animation, consistent characters, 4-second duration`
    },
    'luma': {
        name: 'Luma Dream Machine', logo: '✨', url: 'https://lumalabs.ai',
        prompt: (idea, style, lighting, composition) => 
            `Cinematic video of ${idea} with ${style || 'realistic'} visual style, ${lighting || 'cinematic'} lighting, and ${composition || 'professional'} camera work. High motion consistency, 4K quality, 5-second duration`
    },
    'stablevideo': {
        name: 'Stable Video', logo: '📹', url: 'https://stability.ai/stable-video',
        prompt: (idea, style, lighting, composition) => 
            `(masterpiece video:1.3), ${idea}, ${style || 'realistic'}, ${lighting || 'professional'}, ${composition || 'dynamic'}, smooth motion, consistent frames, 25fps, 4-second clip\nNegative prompt: jerky motion, flickering, inconsistent frames`
    },
    'kaiber': {
        name: 'Kaiber', logo: '🌊', url: 'https://kaiber.ai',
        prompt: (idea, style, lighting, composition) => 
            `An artistic video of ${idea} in ${style || 'cinematic'} style with ${lighting || 'emotional'} lighting and ${composition || 'creative'} perspective. Dreamlike motion, visual poetry, 4-second duration, aesthetic visuals`
    },
};

// --- 2. نقطة API الرئيسية (المعدلة لترسل JSON) ---
app.post('/api/generate-prompt', (req, res) => {
    try {
        const { idea, type, style, lighting, composition, platform } = req.body;
        
        if (!idea) {
            return res.status(400).json({ error: 'Idea is required' });
        }

        const imagePlatforms = ['midjourney', 'dalle3', 'stablediffusion', 'leonardo', 'adobefirefly', 'gemini', 'chatgpt', 'grok'];
        const videoPlatforms = ['runway', 'pika', 'luma', 'stablevideo', 'kaiber', 'grok'];
        
        let targetPlatforms = [];

        // إذا تم اختيار منصة محددة
        if (platform && platform !== 'all') {
            if (platformsData[platform]) {
                targetPlatforms = [platform];
            } else {
                return res.status(400).json({ error: 'Platform not found' });
            }
        } 
        // إذا طلب جميع المنصات
        else {
            targetPlatforms = type === 'video' ? videoPlatforms : imagePlatforms;
        }

        // --- 3. بناء الرد المنظم (JSON) ---
        const results = targetPlatforms.map(platformId => {
            const data = platformsData[platformId];
            const promptFunction = data.prompt;
            
            return {
                id: platformId,
                name: data.name,
                logo: data.logo,
                url: data.url,
                prompt: promptFunction(idea, style, lighting, composition) // توليد البرومبت
            };
        });

        res.json({ 
            success: true,
            prompts: results // (إرسال مصفوفة من البرومبتات)
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
