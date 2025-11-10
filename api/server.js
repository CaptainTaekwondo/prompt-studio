// server.js (الإصدار الاحترافي v4.4 - إصلاح Gemini + إضافة كل المنصات)
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

// --- ✨ (v4.4) قواميس الترجمة (كما هي) ---
const styleMap = {
    'default': 'realistic', 'realistic': 'realistic', 'cinematic': 'cinematic',
    'anime': 'anime', 'digital': 'digital art', 'fantasy': 'fantasy'
};
const lightingMap = {
    'natural': 'natural lighting', 'dramatic': 'dramatic lighting',
    'soft': 'soft lighting', 'neon': 'neon lighting'
};
const compositionMap = {
    'closeup': 'close-up shot', 'wideshot': 'wide shot',
    'aerial': 'aerial view', 'dynamic': 'dynamic angle'
};

// --- ✨ (v4.4) مكتبة المنصات الكاملة ---
const platformsData = {
    // 🖼️ منصات الصور
    'midjourney': {
        name: 'Midjourney', logo: '🎨', url: 'https://www.midjourney.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `/imagine prompt: ${idea}, ${style} style, ${lighting}, ${composition}, 8K resolution, ultra-detailed --ar ${aspectRatio || '1:1'} --v 6.2 --style raw`
    },
    'dalle3': {
        name: 'DALL·E 3', logo: '🤖', url: 'https://openai.com/dall-e-3',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `A professional ${style} image of "${idea}" with ${lighting} and ${composition}. (Aspect Ratio: ${aspectRatio || '1:1'}). Highly detailed, 8K resolution.`
    },
    'stablediffusion': {
        name: 'Stable Diffusion', logo: '⚙️', url: 'https://stability.ai/stable-diffusion',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `(masterpiece, best quality, 8K UHD:1.3), ${idea}, (${style}:1.2), ${lighting}, ${composition}, detailed background, sharp focus, aspect ratio ${aspectRatio || '1:1'}\n📝 Negative prompt: (blurry:1.2), low quality, worst quality, cartoon, anime, deformed, ugly`
    },
    'leonardo': {
        name: 'Leonardo.ai', logo: '🦁', url: 'https://leonardo.ai',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `${idea} | ${style} style | ${lighting} | ${composition} | Aspect Ratio ${aspectRatio || '1:1'} | 8K | ultra-detailed | cinematic`
    },
    'gemini': {
        name: 'Google Gemini', logo: '💎', url: 'https://gemini.google.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Create a detailed, visually stunning image of ${idea} in ${style} style. Use ${lighting} and ${composition}. Aspect Ratio ${aspectRatio || '1:1'}. Focus on high quality, 8K resolution.`
    },
    'grok': {
        name: 'Grok AI (Image)', logo: '🦄', url: 'https://x.ai/grok',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Generate a vivid image of: ${idea}, ${style} style, ${lighting}, ${composition}. Aspect Ratio ${aspectRatio || '1:1'}.`
    },
    
    // 🎬 منصات الفيديو
    'runway': {
        name: 'Runway', logo: '🎬', url: 'https://runwayml.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Cinematic video scene of ${idea} with ${style} visual style, ${lighting} and ${composition} camera movement. Aspect Ratio ${aspectRatio || '16:9'}. 4K.`
    },
    'pika': {
        name: 'Pika', logo: '⚡', url: 'https://pika.art',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `A short video clip of ${idea} in ${style} style, featuring ${lighting} and ${composition} framing. Aspect Ratio ${aspectRatio || '16:9'}.`
    },
    'luma': {
        name: 'Luma Dream Machine', logo: '✨', url: 'https://lumalabs.ai',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Cinematic video of ${idea} with ${style} visual style, ${lighting}, and ${composition} camera work. Aspect Ratio ${aspectRatio || '16:9'}. High motion consistency, 4K.`
    },
    'grok-video': { // (استخدمنا اسم مختلف لتمييزه)
        name: 'Grok AI (Video)', logo: '🦄', url: 'https://x.ai/grok',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Generate a vivid video of: ${idea}, ${style} style, ${lighting}, ${composition} camera movement. Aspect Ratio ${aspectRatio || '16:9'}.`
    }
};

// --- نقطة API الرئيسية (المحرك الثابت) ---
app.post('/api/generate-prompt', (req, res) => {
    try {
        const { idea, type, style, lighting, composition, aspectRatio, platform } = req.body;
        if (!idea) return res.status(400).json({ error: 'Idea is required' });

        const translatedStyle = styleMap[style] || 'realistic';
        const translatedLighting = lightingMap[lighting] || 'natural lighting';
        const translatedComposition = compositionMap[composition] || 'medium shot';

        // --- ✨ (v4.4) القوائم الكاملة ---
        const imagePlatforms = ['midjourney', 'dalle3', 'stablediffusion', 'leonardo', 'gemini', 'grok'];
        const videoPlatforms = ['runway', 'pika', 'luma', 'grok-video'];
        
        let targetPlatforms = [];
        if (platform && platform !== 'all') {
            if (platformsData[platform]) { targetPlatforms = [platform]; }
        } else {
            targetPlatforms = type === 'video' ? videoPlatforms : imagePlatforms;
        }

        const results = targetPlatforms.map(platformId => {
            const data = platformsData[platformId];
            if (!data) return null; 
            const promptFunction = data.prompt;
            return {
                id: platformId, name: data.name, logo: data.logo, url: data.url,
                prompt: promptFunction(idea, translatedStyle, translatedLighting, translatedComposition, aspectRatio) 
            };
        }).filter(p => p !== null); 

        res.json({ success: true, prompts: results });
    } catch (error) {
        console.error('Error generating prompt:', error);
        res.status(500).json({ success: false, error: 'Failed to generate prompt: ' + error.message });
    }
});


// --- نقطة API تحسين الفكرة (Gemini) ---
app.post('/api/enhance-idea', async (req, res) => {
    if (!genAI) {
        return res.status(500).json({ error: 'API key is not configured on server' });
    }

    try {
        const { idea } = req.body;
        if (!idea) return res.status(400).json({ error: 'Idea is required' });

        // --- ✨ (v4.4) هذا هو الإصلاح النهائي لمشكلة 404 ---
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); 
        // --- (نهاية التغيير) ---

        const systemPrompt = `أنت خبير في كتابة البرومبتات للذكاء الاصطناعي التوليدي. مهمتك هي أخذ فكرة بسيطة من المستخدم وتحويلها إلى وصف غني بالتفاصيل، إبداعي، وسينمائي. لا تضف أي مقدمات أو خواتيم. فقط أعد الوصف المحسّن مباشرة. مثال: المستخدم: قطة ترتدي قبعة. أنت: قطة فارسية رمادية جميلة ترتدي قبعة مخملية حمراء صغيرة، تجلس بفخر على كرسي ملكي قديم.`;
        
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "نعم، أنا جاهز. أعطني الفكرة البسيطة." }] }
            ],
            generationConfig: { maxOutputTokens: 200 },
        });

        const result = await chat.sendMessage(idea);
        const response = result.response;
        const enhancedIdea = response.text();

        res.json({ success: true, enhancedIdea: enhancedIdea.trim() });
    } catch (error) {
        console.error('Error enhancing idea:', error);
        res.status(500).json({ success: false, error: 'Failed to enhance idea: ' + error.message });
    }
});

module.exports = app;
