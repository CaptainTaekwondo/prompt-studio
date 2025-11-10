// server.js (الإصدار النهائي v6.1 - الترجمة والتحسين بـ T5-Large)

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// === إعدادات واجهة Hugging Face ===
const HF_TOKEN = process.env.HF_TOKEN;

// نموذج التحسين والترجمة المباشرة (القوي بما يكفي ليفهم العربي ويرد إنجليزي)
const ENHANCEMENT_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"; 

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

// === توليد البرومبتات (مع الترجمة المباشرة) ===
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { idea, type, style, lighting, composition, aspectRatio, platform } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });

    // 1. ✨ الترجمة لغرض توليد البرومبتات (مباشرة هنا)
    const translatedIdea = await enhanceAndTranslate(idea, false); // false = لا تحسين، فقط ترجمة

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
        translatedIdea, 
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

// === تحسين الفكرة (الزر السحري) ===
app.post("/api/enhance-idea", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });
    if (!HF_TOKEN) {
        const enhancedIdea = localEnhancement(idea);
        return res.json({ success: true, enhancedIdea: enhancedIdea, note: "Used local fallback" });
    }

    // ✨ نستخدم الدالة الموحدة للترجمة والتحسين
    const enhancedIdea = await enhanceAndTranslate(idea, true); // true = مع التحسين

    if (enhancedIdea) { 
        return res.json({ success: true, enhancedIdea: enhancedIdea });
    }

    // إذا فشل كل شيء، نستخدم شبكة الأمان
    const fallbackIdea = localEnhancement(idea);
    return res.json({ success: true, enhancedIdea: fallbackIdea, note: "Used local enhancement after failure" });

  } catch (error) {
    console.error("Error enhancing idea:", error);
    const fallbackIdea = localEnhancement(req.body.idea);
    res.json({ success: true, enhancedIdea: fallbackIdea, note: "Used local enhancement after API error" });
  }
});

// === ✨ الدالة الموحدة للترجمة والتحسين (Core Logic) ===
async function enhanceAndTranslate(idea, includeEnhancement) {
    const instruction = includeEnhancement 
        ? `Translate the following Arabic idea to English and enhance it into a detailed, descriptive prompt:`
        : `Translate the following Arabic idea to English only:`;

    const response = await fetch(ENHANCEMENT_API_URL, { // T5-Large
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `${instruction}\n"${idea}"`,
        parameters: { max_new_tokens: 150, temperature: 0.8 },
      }),
    });

    const text = await response.text();
    
    if (response.status === 503) {
        throw new Error("Model is loading (503). Try again in 10 seconds.");
    }
    if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${text}`);
    }

    const data = JSON.parse(text); 
    const result = data[0]?.generated_text?.trim() || idea;
    
    // نرجع الإجابة فقط (سواء كانت ترجمة أو ترجمة + تحسين)
    return result; 
}


module.exports = app;
