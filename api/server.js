// server.js (الإصدار النهائي v5.7 - Auto Model Detection + Retry + Fallback)

const express = require("express");
const cors = require("cors");
// Vercel Node.js 18+ يدعم fetch مدمجاً، لا حاجة لـ node-fetch

const app = express();
app.use(cors());
app.use(express.json());

// === إعدادات Hugging Face Router ===
const HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small"; 
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
  return `${idea}, ${randomEnhancement}`; // ندمج الفكرة مع الوصف
}

// === دالة الاتصال بـ Hugging Face مع ميزة Retry و Fallback ===
async function queryHuggingFace(idea, retries = 2) {
  const systemPrompt = `Expand and improve this idea: ${idea}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: systemPrompt,
          parameters: { 
            max_new_tokens: 70, // تقليل القيمة
            temperature: 0.7
          },
          options: {
            wait_for_model: true // حل مجرب للموديل البطيء
          }
        }),
      });
      
      const text = await response.text();
      
      if (response.status === 503) {
        // النموذج يحمّل - انتظر ثم أعد المحاولة
        if (attempt < retries) {
          console.warn(`Model loading (503). Retrying in ${2000 * (attempt + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        throw new Error("Model timeout (503). Try again later.");
      }
      
      if (!response.ok) {
        throw new Error(`HF API Error (${response.status}): ${text}`);
      }

      const data = JSON.parse(text);
      const result = data[0]?.generated_text?.trim();
      
      if (result && result.length > idea.length + 5) { // تأكيد التحسين
        return result;
      }
      
      throw new Error("Result too short or failed to enhance.");

    } catch (error) {
      if (attempt === retries) {
        console.error("Final attempt failed:", error.message);
        throw new Error("Hugging Face API failed after multiple retries.");
      }
      // انتظر وأعد المحاولة
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
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

// === تحسين الفكرة (النسخة السريعة مع Fallback) ===
app.post("/api/enhance-idea", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });
    if (!HF_TOKEN) {
        const enhancedIdea = localEnhancement(idea);
        return res.json({ success: true, enhancedIdea, note: "Used local fallback" });
    }

    // محاولة الاتصال بـ Hugging Face مع شبكة الأمان
    try {
      const enhancedIdea = await queryHuggingFace(idea, 2); 
      return res.json({ success: true, enhancedIdea });
    } catch (hfError) {
      console.warn("Hugging Face API failed, falling back to local:", hfError.message);
      const enhancedIdea = localEnhancement(idea);
      return res.json({ success: true, enhancedIdea, note: "Used local enhancement after API failure" });
    }

  } catch (error) {
    console.error("Enhancement error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error during enhancement." });
  }
});

module.exports = app;
