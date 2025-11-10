// server.js (الإصدار النهائي v5.4 - دمج Auto Model مع Bug Fix)
const express = require("express");
const cors = require("cors");
// (لا نحتاج node-fetch لأن Vercel يدعمه)

const app = express();
app.use(cors());
app.use(express.json());

// === إعدادات Hugging Face Router ===
const HF_API_URL = "https://router.huggingface.co";
const HF_TOKEN = process.env.HF_TOKEN;

// قائمة النماذج الموثوقة (يرتبها حسب الأفضلية)
const MODEL_PRIORITY = [
  "meta-llama/Meta-Llama-3-8B-Instruct",
  "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "google/gemma-2b-it",
  "tiiuae/falcon-7b-instruct"
];

// === قواميس الأنماط (كما هي) ===
const styleMap = {
  default: "realistic", realistic: "realistic", cinematic: "cinematic",
  anime: "anime", digital: "digital art", fantasy: "fantasy"
};
const lightingMap = {
  natural: "natural lighting", dramatic: "dramatic lighting",
  soft: "soft lighting", neon: "neon lighting"
};
const compositionMap = {
  closeup: "close-up shot", wideshot: "wide shot",
  aerial: "aerial view", dynamic: "dynamic angle"
};

// === بيانات المنصات (كما هي) ===
const platformsData = {
  midjourney: {
    name: "Midjourney", logo: "🎨", url: "https://www.midjourney.com",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `/imagine prompt: ${idea}, ${style} style, ${lighting}, ${composition}, 8K resolution, ultra-detailed --ar ${aspectRatio || "1:1"} --v 6.2 --style raw`
  },
  dalle3: {
    name: "DALL·E 3", logo: "🤖", url: "https://openai.com/dall-e-3",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `A professional ${style} image of "${idea}" with ${lighting} and ${composition}. (Aspect Ratio: ${aspectRatio || "1:1"}). Highly detailed, 8K resolution.`
  },
  stablediffusion: {
    name: "Stable Diffusion", logo: "⚙️", url: "https://stability.ai/stable-diffusion",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `(masterpiece, best quality, 8K UHD:1.3), ${idea}, (${style}:1.2), ${lighting}, ${composition}, detailed background, sharp focus, aspect ratio ${aspectRatio || "1:1"}\n📝 Negative prompt: (blurry:1.2), low quality, worst quality, cartoon, anime, deformed, ugly`
  },
  leonardo: {
    name: "Leonardo.ai", logo: "🦁", url: "https://leonardo.ai",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `${idea} | ${style} style | ${lighting} | ${composition} | Aspect Ratio ${aspectRatio || "1:1"} | 8K | ultra-detailed | cinematic`
  },
  gemini: {
    name: "Google Gemini", logo: "💎", url: "https://gemini.google.com",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `Create a detailed, visually stunning image of ${idea} in ${style} style. Use ${lighting} and ${composition}. Aspect Ratio ${aspectRatio || "1:1"}. Focus on high quality, 8K resolution.`
  },
  grok: {
    name: "Grok AI (Image)", logo: "🦄", url: "https://x.ai/grok",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `Generate a vivid image of: ${idea}, ${style} style, ${lighting}, ${composition}. Aspect Ratio ${aspectRatio || "1:1"}.`
  },
  runway: {
    name: "Runway", logo: "🎬", url: "https://runwayml.com",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `Cinematic video scene of ${idea} with ${style} visual style, ${lighting} and ${composition} camera movement. Aspect Ratio ${aspectRatio || "16:9"}. 4K.`
  },
  pika: {
    name: "Pika", logo: "⚡", url: "https://pika.art",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `A short video clip of ${idea} in ${style} style, featuring ${lighting} and ${composition} framing. Aspect Ratio ${aspectRatio || "16:9"}.`
  },
  luma: {
    name: "Luma Dream Machine", logo: "✨", url: "https://lumalabs.ai",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `Cinematic video of ${idea} with ${style} visual style, ${lighting}, and ${composition} camera work. Aspect Ratio ${aspectRatio || "16:9"}. High motion consistency, 4K.`
  },
  "grok-video": {
    name: "Grok AI (Video)", logo: "🦄", url: "https://x.ai/grok",
    prompt: (idea, style, lighting, composition, aspectRatio) =>
      `Generate a vivid video of: ${idea}, ${style} style, ${lighting}, ${composition} camera movement. Aspect Ratio ${aspectRatio || "16:9"}.`
  }
};

// === توليد البرومبتات (كما هي) ===
app.post("/api/generate-prompt", (req, res) => {
  try {
    const { idea, type, style, lighting, composition, aspectRatio, platform } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });

    const translatedStyle = styleMap[style] || "realistic";
    const translatedLighting = lightingMap[lighting] || "natural lighting";
    const translatedComposition = compositionMap[composition] || "medium shot";

    const imagePlatforms = ["midjourney", "dalle3", "stablediffusion", "leonardo", "gemini", "grok"];
    const videoPlatforms = ["runway", "pika", "luma", "grok-video"];

    let targetPlatforms = [];
    if (platform && platform !== "all") {
      if (platformsData[platform]) targetPlatforms = [platform];
    } else {
      targetPlatforms = type === "video" ? videoPlatforms : imagePlatforms;
    }

    const results = targetPlatforms.map((p) => ({
      id: p,
      name: platformsData[p].name,
      logo: platformsData[p].logo,
      url: platformsData[p].url,
      prompt: platformsData[p].prompt(
        idea,
        translatedStyle,
        translatedLighting,
        translatedComposition,
        aspectRatio
      ),
    }));

    res.json({ success: true, prompts: results });
  } catch (error) {
    console.error("Error generating prompt:", error);
    res.status(500).json({ success: false, error: "Failed to generate prompt: " + error.message });
  }
});

// === تحسين الفكرة (Auto Model Detection + Bug Fix) ===
app.post("/api/enhance-idea", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });
    if (!HF_TOKEN) return res.status(500).json({ error: "HF_TOKEN missing" });

    // نحاول أول نموذج، وإذا فشل ننتقل للتالي
    for (const model of MODEL_PRIORITY) {
      try {
        const response = await fetch(`${HF_API_URL}/models/${model}`, { // (الرابط الصحيح)
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `You are a creative assistant. Enhance this idea in a cinematic and detailed way:\n"${idea}"`,
            parameters: { max_new_tokens: 120, temperature: 0.8 },
          }),
        });

        // ✨ (Bug Fix: قراءة النص أولاً لمنع خطأ JSON)
        const text = await response.text(); 
        
        // التحقق من حالة الرد
        if (response.status === 503) {
            throw new Error(`Model ${model} is loading. Please try again in 20 seconds.`);
        }
        if (!response.ok) {
            throw new Error(`Model ${model} failed: ${text}`);
        }

        // محاولة تحليل الرد كـ JSON
        const data = JSON.parse(text); 
        
        // استخراج الإجابة
        const enhancedIdea = data[0]?.generated_text;

        if (enhancedIdea) {
          console.log(`✅ Model used: ${model}`);
          // نرد بنجاح ونوقف الحلقة
          return res.json({ success: true, model, enhancedIdea: enhancedIdea.trim() });
        }

      } catch (err) {
        // إذا فشل أي موديل، نسجل الخطأ وننتقل للتالي
        console.warn(`⚠️ Model ${model} unavailable, trying next... Error: ${err.message}`);
        // إذا كان الخطأ هو نقص في الرمز نوقف المحاولة
        if (err.message.includes('API token is invalid')) {
            throw new Error('Hugging Face API Token is invalid or has incorrect permissions.');
        }
        continue;
      }
    }

    // إذا انتهت الحلقة ولم ينجح أي موديل
    throw new Error("All high-quality models failed or are currently unavailable.");

  } catch (error) {
    console.error("Error enhancing idea:", error);
    // إرجاع رسالة خطأ واضحة للمستخدم
    res.status(500).json({ success: false, error: "Failed to enhance idea: " + error.message });
  }
});

module.exports = app;
