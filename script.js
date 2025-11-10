// script.js (الإصدار الاحترافي v3.2 - مع "ذاكرة المتصفح" localStorage)

// --- ✨ 1. قاموس الترجمة (كما هو) ---
const translations = {
    // ... (كل قاموس الترجمة يبقى كما هو، لا تغيير هنا) ...
    "en": {
        "labelAspectRatio": "Aspect Ratio", 
        "optAr1x1": "1:1 (Square) - Instagram Post",
        "optAr9x16": "9:16 (Portrait) - TikTok/Story",
        "optAr16x9": "16:9 (Landscape) - YouTube",
        "optAr4x5": "4:5 (Tall) - Instagram Portrait",
        "optAr4x3": "4:3 (Standard) - Photo",
        "langBtn": "العربية",
        "headerTitle": "✨️ Prompt AI pro ✨️",
        "year": "2025",
        "headerSubtitle": "Turn your ideas into professional prompts for all AI platforms",
        "btnImage": "Image",
        "btnVideo": "Video",
        "btnShareSite": "Share Site", 
        "card1Title": "1. Describe Your Creative Idea",
        "placeholderIdea": "Example: A cat wearing a spacesuit, sitting on the moon...",
        "card2Title": "2. Content Settings",
        "labelStyle": "Artistic Style",
        "optDefault": "(Default: Realistic)",
        "optRealistic": "Realistic",
        "optCinematic": "Cinematic",
        "optAnime": "Anime",
        "optDigitalArt": "Digital Art",
        "optFantasy": "Fantasy",
        "labelLighting": "Lighting",
        "optNatural": "Natural",
        "optDramatic": "Dramatic",
        "optSoft": "Soft",
        "optNeon": "Neon",
        "labelComposition": "Composition",
        "optCloseup": "Close-up",
        "optWideShot": "Wide Shot",
        "optAerialView": "Aerial View",
        "optDynamicAngle": "Dynamic Angle",
        "labelPlatform": "Select Platform",
        "optAllPlatforms": "All Platforms",
        "btnGenerate": "Generate Professional Prompts",
        "btnCopy": "Copy",
        "btnVisit": "Visit Site",
        "btnShare": "Share", 
        "alertIdea": "Please enter your idea first!",
        "alertError": "Error generating prompt: ",
        "alertCopied": "✅ Prompt copied successfully!",
        "alertShareError": "Share API is not supported on this browser. Prompt copied instead!", 
        "cardResultTitle": "🖼️ Image Platforms",
        "cardResultTitleVideo": "🎬 Video Platforms"
    },
    "ar": {
        "labelAspectRatio": "الأبعاد", 
        "optAr1x1": "1:1 (مربع) - انستجرام",
        "optAr9x16": "9:16 (بورتريه) - تيك توك/ستوري",
        "optAr16x9": "16:9 (عرضي) - يوتيوب",
        "optAr4x5": "4:5 (طولي) - انستجرام بورتريه",
        "optAr4x3": "4:3 (قياسي) - صورة",
        "langBtn": "English",
        "headerTitle": "✨️ Prompt AI pro ✨️",
        "year": "2025",
        "headerSubtitle": "حوّل أفكارك إلى برومبتات احترافية لجميع منصات الذكاء الاصطناعي",
        "btnImage": "إنشاء الصور",
        "btnVideo": "إنشاء الفيديوهات",
        "btnShareSite": "مشاركة الموقع", 
        "card1Title": "1. اكتب فكرتك الإبداعية",
        "placeholderIdea": "مثال: قطة ترتدي بدلة فضاء وتسبح في المجرة...",
        "card2Title": "2. إعدادات المحتوى",
        "labelStyle": "النمط الفني",
        "optDefault": "(افتراضي: واقعي)",
        "optRealistic": "واقعي (Realistic)",
        "optCinematic": "سينمائي (Cinematic)",
        "optAnime": "أنمي (Anime)",
        "optDigitalArt": "فن رقمي (Digital Art)",
        "optFantasy": "خيالي (Fantasy)",
        "labelLighting": "الإضاءة",
        "optNatural": "طبيعية (Natural)",
        "optDramatic": "درامية (Dramatic)",
        "optSoft": "ناعمة (Soft)",
        "optNeon": "نيون (Neon)",
        "labelComposition": "التكوين",
        "optCloseup": "لقطة قريبة (Close-up)",
        "optWideShot": "لقطة واسعة (Wide Shot)",
        "optAerialView": "منظر جوي (Aerial View)",
        "optDynamicAngle": "زاوية ديناميكية (Dynamic Angle)",
        "labelPlatform": "اختر المنصة",
        "optAllPlatforms": "جميع المنصات",
        "btnGenerate": "توليد البرومبتات الاحترافية",
        "btnCopy": "نسخ",
        "btnVisit": "زيارة الموقع",
        "btnShare": "مشاركة", 
        "alertIdea": "الرجاء كتابة الفكرة الأساسية أولاً!",
        "alertError": "حدث خطأ: ",
        "alertCopied": "✅ تم نسخ البرومبت بنجاح!",
        "alertShareError": "خاصية المشاركة غير مدعومة على هذا المتصفح. تم نسخ البرومبت بدلاً من ذلك!", 
        "cardResultTitle": "🖼️ منصات الصور",
        "cardResultTitleVideo": "🎬 منصات الفيديو"
    }
};

let currentLang = "en"; 

function setLanguage(lang) {
    currentLang = lang;
    if (lang === 'ar') {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
    } else {
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
    }
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) element.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) element.placeholder = translations[lang][key];
    });
    document.getElementById('lang-toggle-text').textContent = translations[lang]['langBtn'];
}

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 3. تحديد العناصر (كما هي) ---
    const ideaInput = document.getElementById("idea-input");
    const styleSelect = document.getElementById("style-select");
    const lightingSelect = document.getElementById("lighting-select");
    const compositionSelect = document.getElementById("composition-select");
    const aspectRatioSelect = document.getElementById("aspect-ratio-select"); 
    const platformSelect = document.getElementById("platform-select");
    const typeImageButton = document.getElementById("type-image");
    const typeVideoButton = document.getElementById("type-video");
    let currentType = "image"; // (سيتم تحديث القيمة من الـ loadState)
    const generateButton = document.getElementById("generate-button");
    const loader = document.getElementById("loader");
    const resultContainer = document.getElementById("result-container"); 
    const langToggleButton = document.getElementById("lang-toggle");
    const shareSiteButton = document.getElementById("share-site-button"); 

    const API_ENDPOINT = "/api/generate-prompt"; 
    
    // --- ✨ (جديد) 2.1: تعريف مفتاح "ذاكرة المتصفح" ---
    const STORAGE_KEY = 'promptStudioState_v1';

    // --- ✨ (جديد) 2.1: دالة حفظ الحالة ---
    function saveState() {
        const state = {
            idea: ideaInput.value,
            style: styleSelect.value,
            lighting: lightingSelect.value,
            composition: compositionSelect.value,
            aspectRatio: aspectRatioSelect.value,
            platform: platformSelect.value,
            type: currentType
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // --- ✨ (جديد) 2.1: دالة تحميل الحالة ---
    function loadState() {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) return; // لا يوجد شيء محفوظ، استخدم الافتراضي

        try {
            const state = JSON.parse(savedState);
            
            ideaInput.value = state.idea || '';
            styleSelect.value = state.style || '';
            lightingSelect.value = state.lighting || '';
            compositionSelect.value = state.composition || '';
            aspectRatioSelect.value = state.aspectRatio || '1:1';
            platformSelect.value = state.platform || 'all';
            currentType = state.type || 'image'; // (مهم) تحميل النوع المحفوظ

            // تحديث الأزرار بناءً على النوع المحفوظ
            if (currentType === 'video') {
                typeVideoButton.classList.add("active");
                typeImageButton.classList.remove("active");
            } else {
                typeImageButton.classList.add("active");
                typeVideoButton.classList.remove("active");
            }

        } catch (error) {
            console.error("Failed to parse state from localStorage:", error);
            localStorage.removeItem(STORAGE_KEY); // تنظيف الذاكرة إذا كانت تالفة
        }
    }


    // --- 4. أحداث الأزرار (معدلة لحفظ الحالة) ---
    typeImageButton.addEventListener("click", () => {
        currentType = "image";
        typeImageButton.classList.add("active");
        typeVideoButton.classList.remove("active");
        updatePlatformOptions();
        saveState(); // <-- ✨ (جديد) حفظ الحالة عند التغيير
    });
    typeVideoButton.addEventListener("click", () => {
        currentType = "video";
        typeVideoButton.classList.add("active");
        typeImageButton.classList.remove("active");
        updatePlatformOptions();
        saveState(); // <-- ✨ (جديد) حفظ الحالة عند التغيير
    });
    langToggleButton.addEventListener("click", () => {
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    });
    shareSiteButton.addEventListener("click", async () => {
        const shareData = {
            title: translations['en']['headerTitle'], 
            text: translations[currentLang]['headerSubtitle'], 
            url: window.location.href 
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.error("Share error:", err); }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(translations[currentLang]['alertShareError']);
        }
    });

    function updatePlatformOptions() {
        const imageOptions = platformSelect.querySelectorAll('optgroup[label="🖼️ Image Platforms"], optgroup[label="🖼️ Image Platforms"] > option, optgroup[label="🖼️ منصات الصور"], optgroup[label="🖼️ منصات الصور"] > option');
        const videoOptions = platformSelect.querySelectorAll('optgroup[label="🎬 Video Platforms"], optgroup[label="🎬 Video Platforms"] > option, optgroup[label="🎬 منصات الفيديو"], optgroup[label="🎬 منصات الفيديو"] > option');
        
        // (ملاحظة: currentType تم تحديثه بالفعل من loadState)
        if (currentType === 'image') {
            imageOptions.forEach(opt => opt.style.display = 'block');
            videoOptions.forEach(opt => opt.style.display = 'none');
            // التأكد من أن الاختيار الحالي منطقي
            if (platformSelect.value && (platformSelect.value.startsWith('runway') || platformSelect.value.startsWith('pika'))) {
                 platformSelect.value = 'all'; 
                 saveState(); // <-- ✨ (جديد) حفظ التغيير التلقائي
            }
        } else {
            imageOptions.forEach(opt => opt.style.display = 'none');
            videoOptions.forEach(opt => opt.style.display = 'block');
            // التأكد من أن الاختيار الحالي منطقي
            if (platformSelect.value && (platformSelect.value.startsWith('midjourney') || platformSelect.value.startsWith('dalle3'))) {
                 platformSelect.value = 'all';
                 saveState(); // <-- ✨ (جديد) حفظ التغيير التلقائي
            }
        }
    }

    // --- 5. حدث التوليد الرئيسي (كما هو) ---
    generateButton.addEventListener("click", async () => {
        const idea = ideaInput.value.trim();
        const style = styleSelect.value;
        const lighting = lightingSelect.value;
        const composition = compositionSelect.value;
        const aspectRatio = aspectRatioSelect.value; 
        const platform = platformSelect.value;

        if (!idea) {
            alert(translations[currentLang]['alertIdea']);
            ideaInput.focus();
            return;
        }

        generateButton.disabled = true;
        loader.style.display = "block";
        generateButton.querySelector("i").style.display = "none";
        resultContainer.style.display = "none"; 
        resultContainer.innerHTML = ''; 

        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    idea, 
                    type: currentType, 
                    style, 
                    lighting, 
                    composition, 
                    aspectRatio,
                    platform 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "API connection failed");
            }
            const data = await response.json();

            if (data.success && data.prompts) {
                const titleKey = currentType === 'video' ? 'cardResultTitleVideo' : 'cardResultTitle';
                resultContainer.innerHTML = `<h2><i class="fas fa-check-circle"></i> ${translations[currentLang][titleKey]}</h2>`;
                data.prompts.forEach(p => {
                    const cardHTML = createPlatformCard(p.id, p.name, p.logo, p.url, p.prompt);
                    resultContainer.innerHTML += cardHTML;
                });
                resultContainer.style.display = "grid"; 
                resultContainer.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(data.error || "Invalid response from server");
            }
        } catch (error) {
            console.error("Generation error:", error);
            alert(translations[currentLang]['alertError'] + error.message);
        } finally {
            generateButton.disabled = false;
            loader.style.display = "none";
            generateButton.querySelector("i").style.display = "inline-block";
        }
    });

    // --- 6. دوال بناء البطاقات (كما هي) ---
    window.createPlatformCard = (platformId, name, logo, url, promptText) => {
        return `
            <div class="platform-card" data-platform="${platformId}">
                <div class="platform-header">
                    <div class="platform-info">
                        <div class="platform-logo">${logo}</div>
                        <div class="platform-name">${name}</div>
                    </div>
                    <div class="platform-actions">
                        <button class="action-btn share-btn" onclick="sharePrompt('${platformId}')">
                            <i class="fas fa-share-alt"></i> ${translations[currentLang]['btnShare']}
                        </button>
                        <button class="action-btn copy-btn" onclick="copyPrompt('${platformId}')">
                            <i class="fas fa-copy"></i> ${translations[currentLang]['btnCopy']}
                        </button>
                        <a href="${url}" target="_blank" class="action-btn visit-btn">
                            <i class="fas fa-external-link-alt"></i> ${translations[currentLang]['btnVisit']}
                        </a>
                    </div>
                </div>
                <div class="prompt-text" id="prompt-${platformId}">${promptText}</div>
            </div>
        `;
    }
    window.copyPrompt = (platformId) => {
        const promptText = document.getElementById(`prompt-${platformId}`).textContent;
        navigator.clipboard.writeText(promptText).then(() => {
            alert(translations[currentLang]['alertCopied']);
        });
    }
    window.sharePrompt = async (platformId) => {
        const promptText = document.getElementById(`prompt-${platformId}`).textContent;
        const shareData = {
            title: `Prompt from ${translations['en']['headerTitle']}`, 
            text: promptText,
            url: window.location.href 
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.error("Share error:", err); }
        } else {
            copyPrompt(platformId);
            alert(translations[currentLang]['alertShareError']);
        }
    }

    // --- ✨ (جديد) 2.1: ربط حفظ الحالة مع كل تغيير في المدخلات ---
    ideaInput.addEventListener('input', saveState);
    styleSelect.addEventListener('change', saveState);
    lightingSelect.addEventListener('change', saveState);
    compositionSelect.addEventListener('change', saveState);
    aspectRatioSelect.addEventListener('change', saveState);
    platformSelect.addEventListener('change', saveState);


    // --- 7. التهيئة الأولية (معدلة) ---
    
    // (مهم) أولاً: تحميل الحالة المحفوظة (لتحديد currentType)
    loadState(); 
    
    // ثانيًا: تحديث خيارات المنصات بناءً على النوع الذي تم تحميله
    updatePlatformOptions(); 
    
    // ثالثًا: تطبيق الترجمة
    setLanguage(currentLang); 
});
