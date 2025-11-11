// server.js (الإصدار النهائي v7.4 - الحل الكامل والمستقر)

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// 🔧 الإصلاح الأساسي: تكوين trust proxy لـ Vercel
app.set('trust proxy', 1);

// === إعدادات متقدمة ===
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// === نظام تخزين مؤقت مبسط (Map) ===
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 دقيقة

function getFromCache(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setToCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

// === منع الاستخدام المفرط ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// === إعدادات Hugging Face (النهائية) ===
const HF_TOKEN = process.env.HF_TOKEN;
const ENHANCEMENT_API_URL = "https://router.huggingface.co/hf-inference"; // ✨ الرابط الصحيح
const ENHANCEMENT_MODEL = "google/flan-t5-large"; // النموذج المعتمد

// === نظام التحسين الذكي والقواميس ===
class SmartEnhancement {
  constructor() {
    this.enhancements = {
      basic: [
        "highly detailed, professional quality, 8K resolution",
        "cinematic composition, stunning visuals, masterpiece",
        "professional photography, perfect lighting, ultra detailed",
        "award winning composition, visually stunning, detailed background"
      ],
    };
  }

  getEnhancement(idea, style) {
    const enhancements = this.enhancements.basic; 
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    return `${idea}, ${randomEnhancement}`;
  }
}
const smartEnhancer = new SmartEnhancement();

// === قواميس الأنماط (لتفسير الاختيارات) ===
const bilingualStyleMap = {
  default: { en: "realistic", ar: "واقعي" }, realistic: { en: "realistic", ar: "واقعي" }, cinematic: { en: "cinematic", ar: "سينمائي" },
  anime: { en: "anime", ar: "أنمي" }, digital: { en: "digital art", ar: "فن رقمي" }, fantasy: { en: "fantasy", ar: "فانتازيا" }
};
const bilingualLightingMap = {
  natural: { en: "natural lighting", ar: "إضاءة طبيعية" }, dramatic: { en: "dramatic lighting", ar: "إضاءة درامية" },
  soft: { en: "soft lighting", ar: "إضاءة ناعمة" }, neon: { en: "neon lighting", ar: "إضاءة نيون" }
};
const bilingualCompositionMap = {
  closeup: { en: "close-up shot", ar: "لقطة مقرّبة" }, wideshot: { en: "wide shot", ar: "لقطة واسعة" },
  aerial: { en: "aerial view", ar: "منظر جوي" }, dynamic: { en: "dynamic angle", ar: "زاوية ديناميكية" }
};


// === بيانات المنصات الكاملة ===
const platformsData = {
  midjourney: { name: "Midjourney", logo: "🎨", url: "https://www.midjourney.com", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `/imagine prompt: ${idea}, ${bilingualStyleMap[style]?.en} style, ${bilingualLightingMap[lighting]?.en}, ${bilingualCompositionMap[composition]?.en}, 8K resolution, ultra-detailed --ar ${aspectRatio || "1:1"} --v 6.2 --style raw` },
  dalle3: { name: "DALL·E 3", logo: "🤖", url: "https://openai.com/dall-e-3", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `A professional ${bilingualStyleMap[style]?.en} image of "${idea}" with ${bilingualLightingMap[lighting]?.en} and ${bilingualCompositionMap[composition]?.en}. (Aspect Ratio: ${aspectRatio || "1:1"}). Highly detailed, 8K resolution.` },
  stablediffusion: { name: "Stable Diffusion", logo: "⚙️", url: "https://stability.ai/stable-diffusion", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `(masterpiece, best quality, 8K UHD:1.3), ${idea}, (${bilingualStyleMap[style]?.en}:1.2), ${bilingualLightingMap[lighting]?.en}, ${bilingualCompositionMap[composition]?.en}, detailed background, sharp focus, aspect ratio ${aspectRatio || "1:1"}\n📝 Negative prompt: (blurry:1.2), low quality, worst quality` },
  leonardo: { name: "Leonardo.ai", logo: "🦁", url: "https://leonardo.ai", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `${idea} | ${bilingualStyleMap[style]?.en} style | ${bilingualLightingMap[lighting]?.en} | ${bilingualCompositionMap[composition]?.en} | Aspect Ratio ${aspectRatio || "1:1"} | 8K | ultra-detailed | cinematic` },
  gemini: { name: "Google Gemini", logo: "💎", url: "https://gemini.google.com", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `Create a detailed, visually stunning image of ${idea} in ${bilingualStyleMap[style]?.en} style. Use ${bilingualLightingMap[lighting]?.en} and ${bilingualCompositionMap[composition]?.en}. Aspect Ratio ${aspectRatio || "1:1"}. Focus on high quality, 8K resolution.` },
  grok: { name: "Grok AI (Image)", logo: "🦄", url: "https://x.ai/grok", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `Generate a vivid image of: ${idea}, ${bilingualStyleMap[style]?.en} style, ${bilingualLightingMap[lighting]?.en}, ${bilingualCompositionMap[composition]?.en}. Aspect Ratio ${aspectRatio || "1:1"}.` },
  runway: { name: "Runway ML", logo: "🎬", url: "https://runwayml.com", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `Cinematic video scene of ${idea} with ${bilingualStyleMap[style]?.en} visual style, ${bilingualLightingMap[lighting]?.en} and ${bilingualCompositionMap[composition]?.en} camera movement. Aspect Ratio ${aspectRatio || "16:9"}. 4K.` },
  pika: { name: "Pika Labs", logo: "⚡", url: 'https://pika.art', prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `A short video clip of ${idea} in ${bilingualStyleMap[style]?.en} style, featuring ${bilingualLightingMap[lighting]?.en} and ${bilingualCompositionMap[composition]?.en} framing. Aspect Ratio ${aspectRatio || "16:9"}.` },
  luma: { name: "Luma Dream Machine", logo: "✨", url: "https://lumalabs.ai", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `Cinematic video of ${idea} with ${bilingualStyleMap[style]?.en} visual style, ${bilingualLightingMap[lighting]?.en}, and ${bilingualCompositionMap[composition]?.en} camera work. Aspect Ratio ${aspectRatio || "16:9"}. High motion consistency, 4K.` },
  "grok-video": { name: "Grok AI (Video)", logo: "🦄", url: "https://x.ai/grok", prompt: (idea, style, lighting, composition, aspectRatio, language = 'en') => `Generate a vivid video of: ${idea}, ${bilingualStyleMap[style]?.en} style, ${bilingualLightingMap[lighting]?.en}, ${bilingualCompositionMap[composition]?.en} camera movement. Aspect Ratio ${aspectRatio || "16:9"}.` }
};


// === نظام الاستدعاء الذكي مع التخزين المؤقت ===
async function smartEnhanceAndTranslate(idea, includeEnhancement = true, targetLanguage = 'en') {
  const cacheKey = `${idea}-${includeEnhancement}-${targetLanguage}`;
  const cachedResult = getFromCache(cacheKey);
  if (cachedResult) return cachedResult;

  // إذا لم يكن هناك توكن، استخدم التحسين المحلي الذكي
  if (!HF_TOKEN) {
    const localResult = smartEnhancer.getEnhancement(idea, 'default');
    setToCache(cacheKey, localResult);
    return localResult;
  }

  // ✨ (هنا يتم الاتصال الفعلي بالنموذج)
  try {
    const instruction = includeEnhancement 
      ? `Translate the following Arabic idea to English and enhance it into a detailed, descriptive prompt: "${idea}"`
      : `Translate the following Arabic idea to English only: "${idea}"`;

    const response = await fetch(ENHANCEMENT_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ENHANCEMENT_MODEL, // نرسل اسم الموديل عبر الجسم
        inputs: instruction,
        parameters: { max_new_tokens: 150, temperature: 0.8 },
        options: { wait_for_model: true } // نضمن عدم فشل الـ Timeout
      }),
    });

    const text = await response.text();
    if (!response.ok) throw new Error(`API Error (${response.status}): ${text}`);
    
    const data = JSON.parse(text); 
    const result = data[0]?.generated_text?.trim();

    if (result) {
        setToCache(cacheKey, result);
        return result;
    }
    throw new Error("AI returned null result.");

  } catch (error) {
    console.warn(`🤖 AI enhancement failed:`, error.message);
    const localResult = smartEnhancer.getEnhancement(idea, 'default');
    setToCache(cacheKey, localResult);
    return localResult;
  }
}

// === نقطة نهاية محسنة مع التحقق من الصحة (Generate) ===
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { idea, type = "image", style = "realistic", lighting = "natural", composition = "closeup", aspectRatio = "1:1", platform = "all", language = 'en' } = req.body;
    
    if (!idea || idea.trim().length < 2) {
      return res.status(400).json({ success: false, error: "الفكرة مطلوبة ويجب أن تحتوي على الأقل على حرفين" });
    }

    // 1. الترجمة للبرومبت الأساسي (فقط ترجمة)
    const translatedIdea = await smartEnhanceAndTranslate(idea.trim(), false, language); 

    // 2. توليد النتائج (المنصات)
    const imagePlatforms = ["midjourney", "dalle3", "stablediffusion", "leonardo", "gemini", "grok"];
    const videoPlatforms = ["runway", "pika", "luma", "grok-video"];
    
    let targetPlatforms = [];
    if (platform && platform !== "all" && platformsData[platform]) {
      targetPlatforms = [platform];
    } else {
      targetPlatforms = type === "video" ? videoPlatforms : imagePlatforms;
    }

    const results = targetPlatforms.map((platformId) => {
      const platform = platformsData[platformId];
      return {
        id: platformId,
        name: platform.name,
        logo: platform.logo,
        url: platform.url,
        prompt: platform.prompt(
          translatedIdea, // نمرر النص المُترجم
          style, 
          lighting, 
          composition, 
          aspectRatio,
          language
        ),
      };
    });

    res.json({ success: true, prompts: results });

  } catch (error) {
    console.error("🚨 Error generating prompt:", error);
    res.status(500).json({ success: false, error: "فشل في توليد البرومبتات" });
  }
});


// === تحسين الفكرة المحسّن (Enhance) ===
app.post("/api/enhance-idea", async (req, res) => {
  try {
    const { idea, language = 'en' } = req.body;
    
    if (!idea || idea.trim().length < 2) {
      return res.status(400).json({ success: false, error: "الفكرة مطلوبة ويجب أن تحتوي على الأقل على حرفين" });
    }

    // ✨ الحل: نستخدم الدالة الموحدة للترجمة والتحسين (مع التحسين)
    const enhancedIdea = await smartEnhanceAndTranslate(idea.trim(), true, language); 
    
    res.json({ 
      success: true, 
      enhancedIdea,
      originalIdea: idea,
      improvement: Math.round((enhancedIdea.length - idea.length) / idea.length * 100),
      metadata: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("🚨 Error enhancing idea:", error);
    const fallbackIdea = smartEnhancer.getEnhancement(req.body.idea, 'default');
    res.json({ success: true, enhancedIdea: fallbackIdea, note: "Used local enhancement after API error" });
  }
});


// === نقاط نهاية جديدة للمراقبة ===
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    cacheStats: {
      size: cache.size,
      keys: Array.from(cache.keys()).slice(0, 5)
    },
    version: "7.4"
  });
});

app.get("/api/cache/clear", (req, res) => {
  const before = cache.size;
  cache.clear();
  res.json({
    success: true,
    message: `Cleared ${before} items from cache`,
    cleared: before
  });
});


// نقطة البداية (لتجنب رسالة 404)
app.get("/", (req, res) => {
  res.json({
    message: "🚀 AI Prompt Generator API is running!",
    version: "7.4",
    endpoints: [
      "POST /api/generate-prompt",
      "POST /api/enhance-idea",
      "GET /api/health",
      "GET /api/cache/clear"
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
