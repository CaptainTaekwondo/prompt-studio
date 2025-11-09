// script.js (الإصدار الاحترافي v3.0 - Static Engine)

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. تحديد العناصر (من الكود القديم) ---
    const ideaInput = document.getElementById("idea-input");
    const styleSelect = document.getElementById("style-select");
    const lightingSelect = document.getElementById("lighting-select");
    const compositionSelect = document.getElementById("composition-select");
    const platformSelect = document.getElementById("platform-select");
    
    // أزرار النوع
    const typeImageButton = document.getElementById("type-image");
    const typeVideoButton = document.getElementById("type-video");
    let currentType = "image";

    // عناصر التحكم
    const generateButton = document.getElementById("generate-button");
    const loader = document.getElementById("loader");
    const resultContainer = document.getElementById("result-container"); // (تحديث: الحاوية الجديدة)

    const API_ENDPOINT = "/api/generate-prompt";

    // --- 2. أحداث أزرار النوع (من الكود القديم) ---
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

    // --- 3. تحديث خيارات المنصة (من الكود القديم) ---
    function updatePlatformOptions() {
        const imageOptions = platformSelect.querySelectorAll('.image-options'); // (استخدام .image-options)
        const videoOptions = platformSelect.querySelectorAll('.video-options'); // (استخدام .video-options)
        
        if (currentType === 'image') {
            imageOptions.forEach(opt => opt.style.display = 'block');
            videoOptions.forEach(opt => opt.style.display = 'none');
            if (platformSelect.value.startsWith('runway')) {
                 platformSelect.value = 'all'; 
            }
        } else {
            imageOptions.forEach(opt => opt.style.display = 'none');
            videoOptions.forEach(opt => opt.style.display = 'block');
            if (platformSelect.value.startsWith('midjourney')) {
                 platformSelect.value = 'all';
            }
        }
    }

    // --- 4. حدث التوليد الرئيسي (دمج) ---
    generateButton.addEventListener("click", async () => {
        const idea = ideaInput.value.trim();
        const style = styleSelect.value;
        const lighting = lightingSelect.value;
        const composition = compositionSelect.value;
        const platform = platformSelect.value;

        if (!idea) {
            alert("Please enter your idea first!");
            ideaInput.focus();
            return;
        }

        // إظهار التحميل
        generateButton.disabled = true;
        loader.style.display = "block";
        generateButton.querySelector("i").style.display = "none";
        resultContainer.style.display = "none"; // (إخفاء النتائج القديمة)
        resultContainer.innerHTML = ''; // (مسح النتائج القديمة)

        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idea: idea,
                    type: currentType,
                    style: style,
                    lighting: lighting,
                    composition: composition,
                    platform: platform
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "API connection failed");
            }

            const data = await response.json();

            if (data.success && data.prompts) {
                // --- 5. ✨ (الدمج) بناء البطاقات التفاعلية ---
                data.prompts.forEach(p => {
                    const cardHTML = createPlatformCard(p.id, p.name, p.logo, p.url, p.prompt);
                    resultContainer.innerHTML += cardHTML;
                });
                
                resultContainer.style.display = "grid"; // (إظهار الحاوية)
                resultContainer.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(data.error || "Invalid response from server");
            }

        } catch (error) {
            console.error("Generation error:", error);
            alert("Error generating prompt: " + error.message);
        } finally {
            generateButton.disabled = false;
            loader.style.display = "none";
            generateButton.querySelector("i").style.display = "inline-block";
        }
    });

    // --- 6. ✨ (الجديد) دالة بناء البطاقة التفاعلية ---
    // (يجب جعلها عامة ليتمكن HTML من استدعائها)
    window.createPlatformCard = (platformId, name, logo, url, promptText) => {
        return `
            <div class="platform-card" data-platform="${platformId}">
                <div class="platform-header">
                    <div class="platform-info">
                        <div class="platform-logo">${logo}</div>
                        <div class="platform-name">${name}</div>
                    </div>
                    <div class="platform-actions">
                        <button class="action-btn copy-btn" onclick="copyPrompt('${platformId}')">
                            <i class="fas fa-copy"></i> نسخ
                        </button>
                        <a href="${url}" target="_blank" class="action-btn visit-btn">
                            <i class="fas fa-external-link-alt"></i> زيارة الموقع
                        </a>
                    </div>
                </div>
                <div class="prompt-text" id="prompt-${platformId}">${promptText}</div>
            </div>
        `;
    }

    // --- 7. ✨ (الجديد) دوال النسخ (العامة) ---
    window.copyPrompt = (platformId) => {
        const promptText = document.getElementById(`prompt-${platformId}`).textContent;
        navigator.clipboard.writeText(promptText).then(() => {
            alert('✅ تم نسخ البرومبت بنجاح!');
        });
    }

    // التهيئة الأولية
    updatePlatformOptions();
});
