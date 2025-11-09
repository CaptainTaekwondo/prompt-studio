// script.js (الإصدار الاحترافي v3.0 - مع الترجمة والمشاركة)

// --- ✨ 1. قاموس الترجمة (تمت إضافة "المشاركة") ---
const translations = {
    "en": {
        "langBtn": "العربية",
        "headerTitle": "✨️ Prompt AI pro ✨️",
        "year": "2025",
        "headerSubtitle": "Turn your ideas into professional prompts for all AI platforms",
        "btnImage": "Image",
        "btnVideo": "Video",
        "btnShareSite": "Share Site", // <-- ✨ (الجديد)
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
        "langBtn": "English",
        "headerTitle": "✨️ Prompt AI pro ✨️",
        "year": "2025",
        "headerSubtitle": "حوّل أفكارك إلى برومبتات احترافية لجميع منصات الذكاء الاصطناعي",
        "btnImage": "إنشاء الصور",
        "btnVideo": "إنشاء الفيديوهات",
        "btnShareSite": "مشاركة الموقع", // <-- ✨ (الجديد)
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
    
    // --- 3. تحديد العناصر (تمت إضافة الزر الجديد) ---
    const ideaInput = document.getElementById("idea-input");
    const styleSelect = document.getElementById("style-select");
    const lightingSelect = document.getElementById("lighting-select");
    const compositionSelect = document.getElementById("composition-select");
    const platformSelect = document.getElementById("platform-select");
    const typeImageButton = document.getElementById("type-image");
    const typeVideoButton = document.getElementById("type-video");
    let currentType = "image"; 
    const generateButton = document.getElementById("generate-button");
    const loader = document.getElementById("loader");
    const resultContainer = document.getElementById("result-container"); 
    const langToggleButton = document.getElementById("lang-toggle");
    const shareSiteButton = document.getElementById("share-site-button"); // <-- ✨ (الجديد)

    const API_ENDPOINT = "/api/generate-prompt"; 

    // --- 4. أحداث الأزرار ---
    typeImageButton.addEventListener("click", () => {
        currentType = "image";
        typeImageButton.classList.add("active");
        typeVideoButton.classList.remove("active");
        updatePlatformOptions();
    });
    typeVideoButton.addEventListener("click", () => {
        currentType = "video";
        typeVideoButton.classList.add("active");
        typeImageButton.classList.remove("active");
        updatePlatformOptions();
    });
    langToggleButton.addEventListener("click", () => {
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
    });
    
    // --- ✨ 5. (الجديد) حدث زر مشاركة الموقع ---
    shareSiteButton.addEventListener("click", async () => {
        const shareData = {
            title: translations['en']['headerTitle'], // (دائماً إنجليزي للمشاركة)
            text: translations[currentLang]['headerSubtitle'], // (الوصف باللغة الحالية)
            url: window.location.href // (رابط الموقع)
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share error:", err);
            }
        } else {
            // (الحل البديل: نسخ الرابط)
            navigator.clipboard.writeText(window.location.href);
            alert(translations[currentLang]['alertShareError']);
        }
    });


    function updatePlatformOptions() {
        const imageOptions = platformSelect.querySelectorAll('optgroup[label="🖼️ Image Platforms"], optgroup[label="🖼️ Image Platforms"] > option, optgroup[label="🖼️ منصات الصور"], optgroup[label="🖼️ منصات الصور"] > option');
        const videoOptions = platformSelect.querySelectorAll('optgroup[label="🎬 Video Platforms"], optgroup[label="🎬 Video Platforms"] > option, optgroup[label="🎬 منصات الفيديو"], optgroup[label="🎬 منصات الفيديو"] > option');
        if (currentType === 'image') {
            imageOptions.forEach(opt => opt.style.display = 'block');
            videoOptions.forEach(opt => opt.style.display = 'none');
            if (platformSelect.value && (platformSelect.value.startsWith('runway') || platformSelect.value.startsWith('pika'))) {
                 platformSelect.value = 'all'; 
            }
        } else {
            imageOptions.forEach(opt => opt.style.display = 'none');
            videoOptions.forEach(opt => opt.style.display = 'block');
            if (platformSelect.value && (platformSelect.value.startsWith('midjourney') || platformSelect.value.startsWith('dalle3'))) {
                 platformSelect.value = 'all';
            }
        }
    }

    // --- 6. حدث التوليد الرئيسي ---
    generateButton.addEventListener("click", async () => {
        const idea = ideaInput.value.trim();
        const style = styleSelect.value;
        const lighting = lightingSelect.value;
        const composition = compositionSelect.value;
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
                body: JSON.stringify({ idea, type: currentType, style, lighting, composition, platform }),
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

    // --- 7. دالة بناء البطاقة التفاعلية (تمت إضافة زر المشاركة) ---
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

    // --- 8. دالة النسخ (العامة) ---
    window.copyPrompt = (platformId) => {
        const promptText = document.getElementById(`prompt-${platformId}`).textContent;
        navigator.clipboard.writeText(promptText).then(() => {
            alert(translations[currentLang]['alertCopied']);
        });
    }

    // --- 9. ✨ (الجديد) دالة المشاركة (العامة) ---
    window.sharePrompt = async (platformId) => {
        const promptText = document.getElementById(`prompt-${platformId}`).textContent;
        
        const shareData = {
            title: `Prompt from ${translations['en']['headerTitle']}`, 
            text: promptText,
            url: window.location.href 
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log("Prompt shared successfully");
            } catch (err) {
                console.error("Share error:", err);
            }
        } else {
            copyPrompt(platformId);
            alert(translations[currentLang]['alertShareError']);
        }
    }

    // --- 10. التهيئة الأولية ---
    updatePlatformOptions();
    setLanguage(currentLang); // (تطبيق اللغة الإنجليزية الافتراضية)
});
