// script.js (الإصدار الاحترافي v4.1 - متوافق مع HTML/CSS الجديد)

// --- 1. قاموس الترجمة (محدّث v4.1) ---
const translations = {
    "en": {
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
        "labelAspectRatio": "Aspect Ratio",
        "optAr1x1": "1:1 (Square)",
        "optAr9x16": "9:16 (Portrait)",
        "optAr16x9": "16:9 (Landscape)",
        "optAr4x5": "4:5 (Tall)",
        "optAr4x3": "4:3 (Standard)",
        "labelPlatform": "Select Platform",
        "optAllPlatforms": "All Platforms",
        "btnGenerate": "Generate Professional Prompts",
        "btnEnhance": "Enhance Idea", // (جديد)
        "btnCopy": "Copy",
        "btnVisit": "Visit Site",
        "btnShare": "Share", 
        "alertIdea": "Please enter your idea first!",
        "alertEnhanceIdea": "Please enter an idea to enhance!",
        "alertError": "Error generating prompt: ",
        "alertEnhanceError": "Error enhancing idea: ",
        "alertCopied": "✅ Prompt copied successfully!",
        "alertShareError": "Share API not supported. Prompt copied instead!", 
        "cardResultTitle": "🖼️ Image Platforms",
        "cardResultTitleVideo": "🎬 Video Platforms"
    },
    "ar": {
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
        "optRealistic": "واقعي",
        "optCinematic": "سينمائي",
        "optAnime": "أنمي",
        "optDigitalArt": "فن رقمي",
        "optFantasy": "خيالي",
        "labelLighting": "الإضاءة",
        "optNatural": "طبيعية",
        "optDramatic": "درامية",
        "optSoft": "ناعمة",
        "optNeon": "نيون",
        "labelComposition": "التكوين",
        "optCloseup": "لقطة قريبة",
        "optWideShot": "لقطة واسعة",
        "optAerialView": "منظر جوي",
        "optDynamicAngle": "زاوية ديناميكية",
        "labelAspectRatio": "الأبعاد",
        "optAr1x1": "1:1 (مربع)",
        "optAr9x16": "9:16 (بورتريه)",
        "optAr16x9": "16:9 (عرضي)",
        "optAr4x5": "4:5 (طولي)",
        "optAr4x3": "4:3 (قياسي)",
        "labelPlatform": "اختر المنصة",
        "optAllPlatforms": "جميع المنصات",
        "btnGenerate": "توليد البرومبتات الاحترافية",
        "btnEnhance": "تحسين الفكرة", // (جديد)
        "btnCopy": "نسخ",
        "btnVisit": "زيارة الموقع",
        "btnShare": "مشاركة", 
        "alertIdea": "الرجاء كتابة الفكرة الأساسية أولاً!",
        "alertEnhanceIdea": "الرجاء كتابة فكرة لتحسينها أولاً!",
        "alertError": "حدث خطأ: ",
        "alertEnhanceError": "حدث خطأ أثناء تحسين الفكرة: ",
        "alertCopied": "✅ تم نسخ البرومبت بنجاح!",
        "alertShareError": "خاصية المشاركة غير مدعومة. تم نسخ البرومبت بدلاً من ذلك!", 
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
    
    // (محدّث v4.1: ليتعامل مع الـ span داخل الزر)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // إذا كان العنصر هو زر ويحتوي على span، غيّر الـ span
            const span = element.querySelector('span');
            if (span && (key === 'btnGenerate' || key === 'btnEnhance' || key === 'btnShareSite' || key === 'btnImage' || key === 'btnVideo')) {
                span.textContent = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) element.placeholder = translations[lang][key];
    });
    
    document.getElementById('lang-toggle-text').textContent = translations[lang]['langBtn'];
}

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 3. تحديد العناصر (محدّث v4.1) ---
    const ideaInput = document.getElementById("idea-input");
    const styleSelect = document.getElementById("style-select");
    const lightingSelect = document.getElementById("lighting-select");
    const compositionSelect = document.getElementById("composition-select");
    const aspectRatioSelect = document.getElementById("aspect-ratio-select"); 
    const platformSelect = document.getElementById("platform-select");
    const typeImageButton = document.getElementById("type-image");
    const typeVideoButton = document.getElementById("type-video");
    let currentType = "image"; 
    const resultContainer = document.getElementById("result-container"); 
    const langToggleButton = document.getElementById("lang-toggle");
    const shareSiteButton = document.getElementById("share-site-button"); 

    // (تحديد عناصر الأزرار الجديدة)
    const generateButton = document.getElementById("generate-button");
    const generateIcon = generateButton.querySelector("i");
    const generateText = generateButton.querySelector("span");
    const generateLoader = document.getElementById("generate-loader");

    const enhanceButton = document.getElementById("enhance-button");
    const enhanceIcon = enhanceButton.querySelector("i");
    const enhanceText = enhanceButton.querySelector("span");
    const enhanceLoader = document.getElementById("enhance-loader");

    const API_ENDPOINT = "/api/generate-prompt"; 
    const ENHANCE_API_ENDPOINT = "/api/enhance-idea";
    const STORAGE_KEY = 'promptStudioState_v1';

    // --- (دوال حفظ وتحميل الحالة - معدّلة v4.1) ---
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
    function loadState() {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) return; 
        try {
            const state = JSON.parse(savedState);
            ideaInput.value = state.idea || '';
            styleSelect.value = state.style || 'default'; // (قيمة افتراضية جديدة)
            lightingSelect.value = state.lighting || 'natural'; // (قيمة افتراضية جديدة)
            compositionSelect.value = state.composition || 'closeup'; // (قيمة افتراضية جديدة)
            aspectRatioSelect.value = state.aspectRatio || '1:1';
            platformSelect.value = state.platform || 'all';
            currentType = state.type || 'image'; 

            if (currentType === 'video') {
                typeVideoButton.classList.add("active");
                typeImageButton.classList.remove("active");
            } else {
                typeImageButton.classList.add("active");
                typeVideoButton.classList.remove("active");
            }
        } catch (error) {
            console.error("Failed to load state:", error);
            localStorage.removeItem(STORAGE_KEY); 
        }
    }

    // --- 4. أحداث الأزرار ---
    typeImageButton.addEventListener("click", () => {
        currentType = "image";
        typeImageButton.classList.add("active");
        typeVideoButton.classList.remove("active");
        updatePlatformOptions();
        saveState(); 
    });
    typeVideoButton.addEventListener("click", () => {
        currentType = "video";
        typeVideoButton.classList.add("active");
        typeImageButton.classList.remove("active");
        updatePlatformOptions();
        saveState(); 
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
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(translations[currentLang]['alertShareError']);
        }
    });

    // --- 5. حدث زر تحسين الفكرة (معدّل v4.1) ---
    enhanceButton.addEventListener("click", async () => {
        const idea = ideaInput.value.trim();
        if (!idea) {
            alert(translations[currentLang]['alertEnhanceIdea']);
            ideaInput.focus();
            return;
        }

        // (تفعيل الـ Loader الجديد)
        enhanceButton.disabled = true;
        enhanceIcon.style.display = 'none';
        if (enhanceText) enhanceText.style.display = 'none'; // (التأكد من وجود النص)
        enhanceLoader.style.display = 'block';

        try {
            const response = await fetch(ENHANCE_API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idea }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "API connection failed");

            if (data.success && data.enhancedIdea) {
                ideaInput.value = data.enhancedIdea;
                saveState(); // حفظ الفكرة الجديدة
            } else {
                throw new Error(data.error || "Invalid response");
            }
        } catch (error) {
            console.error("Enhancement error:", error);
            alert(translations[currentLang]['alertEnhanceError'] + error.message);
        } finally {
            // (إيقاف الـ Loader الجديد)
            enhanceButton.disabled = false;
            enhanceIcon.style.display = 'block';
            if (enhanceText) enhanceText.style.display = 'block';
            enhanceLoader.style.display = 'none';
        }
    });

    // --- 6. حدث زر التوليد الرئيسي (معدّل v4.1) ---
    generateButton.addEventListener("click", async () => {
        const idea = ideaInput.value.trim();
        if (!idea) {
            alert(translations[currentLang]['alertIdea']);
            ideaInput.focus();
            return;
        }
        
        // (تفعيل الـ Loader الجديد)
        generateButton.disabled = true;
        generateIcon.style.display = 'none';
        if (generateText) generateText.style.display = 'none';
        generateLoader.style.display = 'block';
        
        resultContainer.style.display = "none"; 
        resultContainer.innerHTML = ''; 

        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    idea, 
                    type: currentType, 
                    style: styleSelect.value, 
                    lighting: lightingSelect.value, 
                    composition: compositionSelect.value, 
                    aspectRatio: aspectRatioSelect.value,
                    platform: platformSelect.value 
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "API connection failed");

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
                throw new Error(data.error || "Invalid response");
            }
        } catch (error) {
            console.error("Generation error:", error);
            alert(translations[currentLang]['alertError'] + error.message);
        } finally {
            // (إيقاف الـ Loader الجديد)
            generateButton.disabled = false;
            generateIcon.style.display = 'block';
            if (generateText) generateText.style.display = 'block';
            generateLoader.style.display = 'none';
        }
    });

    // --- 7. دوال مساعدة (معدلة v4.1) ---
    function updatePlatformOptions() {
        // (تحديث القائمة لتطابق HTML الجديد)
        const imageOptions = platformSelect.querySelectorAll('optgroup[label="🖼️ Image Platforms"], optgroup[label="🖼️ Image Platforms"] > option');
        const videoOptions = platformSelect.querySelectorAll('optgroup[label="🎬 Video Platforms"], optgroup[label="🎬 Video Platforms"] > option');
        
        if (currentType === 'image') {
            imageOptions.forEach(opt => opt.style.display = 'block');
            videoOptions.forEach(opt => opt.style.display = 'none');
            // (تحديث التحقق من القيم الجديدة)
            if (platformSelect.value && (platformSelect.value === 'runway' || platformSelect.value === 'pika')) {
                 platformSelect.value = 'all'; 
                 saveState(); 
            }
        } else {
            imageOptions.forEach(opt => opt.style.display = 'none');
            videoOptions.forEach(opt => opt.style.display = 'block');
            if (platformSelect.value && (platformSelect.value !== 'runway' && platformSelect.value !== 'pika' && platformSelect.value !== 'all')) {
                 platformSelect.value = 'all';
                 saveState(); 
            }
        }
    }
    window.createPlatformCard = (platformId, name, logo, url, promptText) => {
        // (الكود كما هو - سليم)
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
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            copyPrompt(platformId);
            alert(translations[currentLang]['alertShareError']);
        }
    }

    // --- 8. ربط حفظ الذاكرة ---
    ideaInput.addEventListener('input', saveState);
    styleSelect.addEventListener('change', saveState);
    lightingSelect.addEventListener('change', saveState);
    compositionSelect.addEventListener('change', saveState);
    aspectRatioSelect.addEventListener('change', saveState);
    platformSelect.addEventListener('change', saveState);

    // --- 9. التهيئة الأولية ---
    loadState(); 
    updatePlatformOptions(); 
    setLanguage(currentLang); 
});
