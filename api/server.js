// server.js (الإصدار الاحترافي v4.3 - إصلاح موديل Gemini النهائي)
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

// --- قواميس الترجمة (كما هي) ---
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

// --- مكتبة بيانات المنصات (كما هي) ---
const platformsData = {
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
};

// --- نقطة API الرئيسية (كما هي) ---
app.post('/api/generate-prompt', (req, res) => {
    try {
        const { idea, type, style, lighting, composition, aspectRatio, platform } = req.body;
        if (!idea) return res.status(400).json({ error: 'Idea is required' });

        const translatedStyle = styleMap[style] || 'realistic';
        const translatedLighting = lightingMap[lighting] || 'natural lighting';
        const translatedComposition = compositionMap[composition] || 'medium shot';

        const imagePlatforms = ['midjourney', 'dalle3'];
        const videoPlatforms = ['runway', 'pika'];
        
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

        // --- ✨ (هذا هو السطر الذي تم تغييره v4.3) ---
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); // (كان "gemini-pro")
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
