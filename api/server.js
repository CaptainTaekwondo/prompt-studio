// server.js (الإصدار الاحترافي v4.1 - متوافق مع HTML الجديد)
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- ✨ (جديد v4.1) --- قواميس الترجمة للقيم الجديدة
const styleMap = {
    'default': 'realistic',
    'realistic': 'realistic',
    'cinematic': 'cinematic',
    'anime': 'anime',
    'digital': 'digital art',
    'fantasy': 'fantasy'
};
const lightingMap = {
    'natural': 'natural lighting',
    'dramatic': 'dramatic lighting',
    'soft': 'soft lighting',
    'neon': 'neon lighting'
};
const compositionMap = {
    'closeup': 'close-up shot',
    'wideshot': 'wide shot',
    'aerial': 'aerial view',
    'dynamic': 'dynamic angle'
};
// --- (نهاية التعديل) ---


// --- 1. مكتبة بيانات المنصات (معدلة v4.1) ---
const platformsData = {
    // 🖼️ منصات الصور
    'midjourney': {
        name: 'Midjourney', logo: '🎨', url: 'https://www.midjourney.com',
        // (ملاحظة: نمرر القيم المترجمة)
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `/imagine prompt: ${idea}, ${style} style, ${lighting}, ${composition}, 8K resolution, ultra-detailed, cinematic quality --ar ${aspectRatio || '1:1'} --v 6.2 --style raw`
    },
    'dalle3': {
        name: 'DALL-E 3', logo: '🤖', url: 'https://openai.com/dall-e-3',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `A professional ${style} image of "${idea}" with ${lighting} and ${composition}. (Aspect Ratio: ${aspectRatio || '1:1'}). Highly detailed, 8K resolution, cinematic quality.`
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
    // ... (باقي المنصات بنفس المنطق) ...
    // 🎬 منصات الفيديو
    'runway': {
        name: 'Runway ML', logo: '🎬', url: 'https://runwayml.com',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `Cinematic video scene of ${idea} with ${style} visual style, ${lighting} and ${composition} camera movement. Aspect Ratio ${aspectRatio || '16:9'}. Smooth motion, 4K resolution.`
    },
    'pika': {
        name: 'Pika Labs', logo: '⚡', url: 'https://pika.art',
        prompt: (idea, style, lighting, composition, aspectRatio) => 
            `A short video clip of ${idea} in ${style} style, featuring ${lighting} and ${composition} framing. Aspect Ratio ${aspectRatio || '16:9'}. Smooth animation, 4-second duration.`
    },
};

// --- 2. نقطة API الرئيسية (المحرك الثابت - معدلة v4.1) ---
app.post('/api/generate-prompt', (req, res) => {
    try {
        // (1) استقبال القيم الجديدة من الـ HTML
        const { idea, type, style, lighting, composition, aspectRatio, platform } = req.body;
        
        if (!idea) {
            return res.status(400).json({ error: 'Idea is required' });
        }

        // --- ✨ (جديد v4.1) ---
        // (2) ترجمة القيم قبل استخدامها
        const translatedStyle = styleMap[style] || 'realistic';
        const translatedLighting = lightingMap[lighting] || 'natural lighting';
        const translatedComposition = compositionMap[composition] || 'medium shot';
        // --- (نهاية التعديل) ---

        const imagePlatforms = ['midjourney', 'dalle3', 'stablediffusion', 'leonardo']; // (تم تقليلها بناءً على HTML الجديد)
        const videoPlatforms = ['runway', 'pika']; // (تم تقليلها بناءً على HTML الجديد)
        
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
            
            // (3) تمرير القيم المترجمة إلى دوال البرومبت
            return {
                id: platformId,
                name: data.name,
                logo: data.logo,
                url: data.url,
                prompt: promptFunction(idea, translatedStyle, translatedLighting, translatedComposition, aspectRatio) 
            };
        }).filter(p => p !== null); 

        res.json({ success: true, prompts: results });

    } catch (error) {
        console.error('Error generating prompt:', error);
        res.status(500).json({ success: false, error: 'Failed to generate prompt: ' + error.message });
    }
});


// --- 3. نقطة API تحسين الفكرة (Gemini - كما هي) ---
app.post('/api/enhance-idea', async (req, res) => {
    try {
        const { idea } = req.body;
        if (!idea) return res.status(400).json({ error: 'Idea is required' });
        if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'API key is not configured' });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
