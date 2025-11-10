// server.js (الإصدار v5.7 - زيادة الجودة إلى Flan T5-Large)
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// === إعدادات واجهة Hugging Face (الموديل الكبير) ===
const MODEL_NAME = "google/flan-t5-large"; // ✨ (تمت الترقية من small إلى large)
const HF_API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`; 
const HF_TOKEN = process.env.HF_TOKEN; 
// === دالة التحسين المحلي (شبكة الأمان) ===
function localEnhancement(idea) {
  const enhancements = [
    "highly detailed, professional quality, 8K resolution",
    "cinematic composition, stunning visuals, masterpiece", 
    "professional photography, perfect lighting, ultra detailed",
    "award winning composition, visually stunning, detailed background"
  ];
  const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
  return `${idea}, ${randomEnhancement}`; 
}

// === قواميس الأنماط (كما هي) ===
const styleMap = { default: "realistic", realistic: "realistic", cinematic: "cinematic", anime: "anime", digital: "digital art", fantasy: "fantasy" };
const lightingMap = { natural: "natural lighting", dramatic: "dramatic lighting", soft: "soft lighting", neon: "neon lighting" };
const compositionMap = { closeup: "close-up shot", wideshot: "wide shot", aerial: "aerial view", dynamic: "dynamic angle" };
// === بيانات المنصات (كما هي) ===
const platformsData = {
  midjourney: {
    name: "Midjourney", logo: "🎨", url: "https://www.midjourney.com",
    prompt: (idea, style, lighting, composition, aspectRatio) => `/imagine prompt: ${idea}, ${style} style, ${lighting}, ${composition}, 8K resolution, ultra-detailed --ar ${aspectRatio || "1:1"} --v 6.2 --style raw`
  },
  dalle3: {
    name: "DALL·E 3", logo: "🤖", url: "https://openai.com/dall-e-3",
    prompt: (idea, style, lighting, composition, aspectRatio) => `A professional ${style} image of "${idea}" with ${lighting} and ${composition}. (Aspect Ratio: ${aspectRatio || "1:1"}). Highly detailed, 8K resolution.`
  },
  stablediffusion: {
    name: "Stable Diffusion", logo: "⚙️", url: "https://stability.ai/stable-diffusion",
    prompt: (idea, style, lighting, composition, aspectRatio) => `(masterpiece, best quality, 8K UHD:1.3), ${idea}, (${style}:1.2), ${lighting}, ${composition}, detailed background, sharp focus, aspect ratio ${aspectRatio || "1:1"}\n📝 Negative prompt: (blurry:1.2), low quality, worst quality, cartoon, anime, deformed, ugly`
  },
  leonardo: {
    name: "Leonardo.ai", logo: "🦁", url: "https://leonardo.ai",
    prompt: (idea, style, lighting, composition, aspectRatio) => `${idea} | ${style} style | ${lighting} | ${composition} | Aspect Ratio ${aspectRatio || "1:1"} | 8K | ultra-detailed | cinematic`
  },
  gemini: {
    name: "Google Gemini", logo: "💎", url: "https://gemini.google.com",
    prompt: (idea, style, lighting, composition, aspectRatio) => `Create a detailed, visually stunning image of ${idea} in ${style} style. Use ${lighting} and ${composition}. Aspect Ratio ${aspectRatio || "1:1"}. Focus on high quality, 8K resolution.`
  },
  grok: {
    name: "Grok AI (Image)", logo: "🦄", url: "https://x.ai/grok",
    prompt: (idea, style, lighting, composition, aspectRatio) => `Generate a vivid image of: ${idea}, ${style} style, ${lighting}, ${composition}. Aspect Ratio ${aspectRatio || "1:1"}.`
  },
  runway: {
    name: "Runway", logo: "🎬", url: "https://runwayml.com",
    prompt: (idea, style, lighting, composition, aspectRatio) => `Cinematic video scene of ${idea} with ${style} visual style, ${lighting} and ${composition} camera movement. Aspect Ratio ${aspectRatio || "16:9"}. 4K.`
  },
  pika: {
    name: "Pika", logo: "⚡", url: 'https://pika.art',
    prompt: (idea, style, lighting, composition, aspectRatio) => `A short video clip of ${idea} in ${style} style, featuring ${lighting} and ${composition} framing. Aspect Ratio ${aspectRatio || "16:9"}.`
  },
  luma: {
    name: "Luma Dream Machine", logo: "✨", url: "https://lumalabs.ai",
    prompt: (idea, style, lighting, composition, aspectRatio) => `Cinematic video of ${idea} with ${style} visual style, ${lighting}, and ${composition} camera work. Aspect Ratio ${aspectRatio || "16:9"}. High motion consistency, 4K.`
  },
  "grok-video": {
    name: "Grok AI (Video)", logo: "🦄", url: "https://x.ai/grok",
    prompt: (idea, style, lighting, composition, aspectRatio) => `Generate a vivid video of: ${idea}, ${style} style, ${lighting}, ${composition} camera movement. Aspect Ratio ${aspectRatio || "16:9"}.`
  }
};

// === توليد البرومبتات (كما هي) ===
app.post("/api/generate-prompt", (req, res) => {
  // (منطق توليد البرومبتات - كما هو)
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

// === تحسين الفكرة (النسخة السريعة) ===
app.post("/api/enhance-idea", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });
    if (!HF_TOKEN) {
        const enhancedIdea = localEnhancement(idea);
        return res.json({ success: true, enhancedIdea, note: "Used local fallback" });
    }

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // استخدام Flan T5-Large
        inputs: `Enhance this idea into a detailed description:\n"${idea}"\nEnhanced version:`,
        parameters: { max_new_tokens: 100, temperature: 0.7 },
      }),
    });

    const text = await response.text(); 
    
    if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${text}`);
    }

    const data = JSON.parse(text); 
    
    const enhancedIdea = data[0]?.generated_text?.trim() || idea;

    if (enhancedIdea && enhancedIdea.length > idea.length + 10) { // تأكيد أن التحسين أكبر بـ 10 حروف على الأقل
        return res.json({ success: true, enhancedIdea });
    }

    // إذا فشل النموذج في التحسين (أعاد نفس النص)، نستخدم شبكة الأمان
    const fallbackIdea = localEnhancement(idea);
    return res.json({ success: true, enhancedIdea: fallbackIdea, note: "Used local enhancement after weak AI response" });

  } catch (error) {
    console.error("Error enhancing idea:", error);
    // نضمن عدم فشل الـ API بعرض شبكة الأمان دائمًا
    const fallbackIdea = localEnhancement(req.body.idea);
    res.json({ success: true, enhancedIdea: fallbackIdea, note: "Used local enhancement after API error" });
  }
});

module.exports = app;
