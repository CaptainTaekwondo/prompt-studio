const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS مبسط
app.use(cors());
app.use(express.json());

// خدمة الملفات الثابتة من المجلد الجذر
app.use(express.static(path.join(__dirname, '..')));

// نقطة API مبسطة وموثوقة
app.post('/api/generate-prompt', (req, res) => {
    try {
        console.log('Received request:', req.body);
        
        const { idea, type, style, lighting, composition } = req.body;
        
        if (!idea || idea.trim().length < 3) {
            return res.status(400).json({ 
                error: 'يرجى إدخال فكرة واضحة (3 أحرف على الأقل)' 
            });
        }

        const mediaType = (type === 'video') ? 'video scene' : 'image';
        
        // إنشاء برومبتات احترافية بدون الحاجة لـ API خارجي
        const prompts = `
🎨 **Midjourney Prompt:**
${idea}, ${style || 'realistic'} style, ${lighting || 'natural'} lighting, ${composition || 'medium shot'} composition, 8K resolution, ultra-detailed, cinematic quality --ar 16:9 --v 6 --style raw

🖼️ **DALL-E 3 Prompt:**
A professional ${style || 'realistic'} ${mediaType} of "${idea}" with ${lighting || 'natural'} lighting and ${composition || 'creative'} composition, highly detailed, 8K

🎭 **Stable Diffusion Prompt:**
masterpiece, best quality, 8K UHD, ${idea}, ${style || 'photorealistic'}, ${lighting || 'studio light'}, ${composition || 'dynamic angle'}
Negative prompt: blurry, low quality, cartoon, anime, worst quality

🤖 **Grok Prompt:**
Generate a detailed AI prompt for: "${idea}" with ${style || 'cinematic'} style, ${lighting || 'dramatic'} lighting, and ${composition || 'professional'} framing

⚡ **Leonardo.ai Prompt:**
${idea} | ${style || 'realistic'} style | ${lighting || 'professional'} lighting | ${composition || 'well-composed'} | 8K | ultra-detailed | cinematic
        `.trim();

        console.log('Generated prompts successfully');
        res.json({ professionalPrompt: prompts });

    } catch (error) {
        console.error('Error in API:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم: ' + error.message });
    }
});

// نقطة للصحة
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'الخادم يعمل', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// التعامل مع جميع المسارات الأخرى - خدمة الواجهة
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// التعامل مع الأخطاء
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'خطأ غير متوقع في الخادم' });
});

// التصدير لـ Vercel Serverless
module.exports = app;
