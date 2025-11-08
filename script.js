// ننتظر حتى يتم تحميل الصفحة بالكامل
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. تحديد العناصر ---
    const ideaInput = document.getElementById("idea-input");
    const styleSelect = document.getElementById("style-select");
    const lightingSelect = document.getElementById("lighting-select");
    const compositionSelect = document.getElementById("composition-select");
    const aspectRatioSelect = document.getElementById("aspect-ratio-select");
    
    // (العناصر الجديدة)
    const typeImageButton = document.getElementById("type-image");
    const typeVideoButton = document.getElementById("type-video");
    let currentType = "image"; // (النوع الافتراضي هو صورة)

    const generateButton = document.getElementById("generate-button");
    const loader = document.getElementById("loader");

    const resultCard = document.getElementById("result-card");
    const resultPrompt = document.getElementById("result-prompt");
    const copyButton = document.getElementById("copy-button");

    // --- 2. تحديد رابط الـ API ---
    const API_ENDPOINT = "/api/generate-prompt";

    // --- 3. أحداث أزرار (صورة/فيديو) ---
    typeImageButton.addEventListener("click", () => {
        currentType = "image";
        typeImageButton.classList.add("active");
        typeVideoButton.classList.remove("active");
    });
    typeVideoButton.addEventListener("click", () => {
        currentType = "video";
        typeVideoButton.classList.add("active");
        typeImageButton.classList.remove("active");
    });


    // --- 4. الحدث الرئيسي: الضغط على زر "ولّد" ---
    generateButton.addEventListener("click", async () => {
        // قراءة القيم من الفورم
        const idea = ideaInput.value;
        const style = styleSelect.value;
        const lighting = lightingSelect.value;
        const composition = compositionSelect.value;
        const aspectRatio = aspectRatioSelect.value;

        if (!idea.trim()) {
            alert("الرجاء كتابة الفكرة الأساسية أولاً!");
            ideaInput.focus();
            return;
        }

        // إظهار التحميل
        generateButton.disabled = true;
        loader.style.display = "block";
        generateButton.querySelector("i").style.display = "none";
        resultCard.style.display = "none"; 

        try {
            // 5. إرسال الطلب إلى "العقل المدبر" (API)
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idea: idea,
                    type: currentType, // (إرسال النوع: صورة أم فيديو)
                    style: style,
                    lighting: lighting,
                    composition: composition
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "فشل الاتصال بالـ API");
            }

            const data = await response.json();

            // 6. بناء البرومبت النهائي (إضافة الأبعاد)
            // (الآن الرد من Gemini سيحتوي على كل البرومبتات)
            const finalPrompt = `${data.professionalPrompt}\n\n(تم توليده باستخدام الأبعاد: ${aspectRatio})`;

            // 7. عرض النتيجة
            resultPrompt.value = finalPrompt;
            resultCard.style.display = "block";

        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء توليد البرومبت: " + error.message);
        } finally {
            // 8. إرجاع الزر لحالته الطبيعية
            generateButton.disabled = false;
            loader.style.display = "none";
            generateButton.querySelector("i").style.display = "inline-block";
        }
    });

    // --- 5. حدث "نسخ" البرومبت ---
    copyButton.addEventListener("click", () => {
        resultPrompt.select();
        document.execCommand("copy"); 
        copyButton.innerText = "تم النسخ! 👍";
        
        setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> نسخ البرومبت';
        }, 2000);
    });

});
