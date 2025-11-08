// ننتظر حتى يتم تحميل الصفحة بالكامل
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. تحديد العناصر ---
    const ideaInput = document.getElementById("idea-input");
    const styleSelect = document.getElementById("style-select");
    const lightingSelect = document.getElementById("lighting-select");
    const compositionSelect = document.getElementById("composition-select");
    const aspectRatioSelect = document.getElementById("aspect-ratio-select");
    
    const generateButton = document.getElementById("generate-button");
    const loader = document.getElementById("loader");

    const resultCard = document.getElementById("result-card");
    const resultPrompt = document.getElementById("result-prompt");
    const copyButton = document.getElementById("copy-button");

    // --- 2. تحديد رابط الـ API ---
    // (رابط نسبي، Vercel سيفهمه)
    const API_ENDPOINT = "/api/generate-prompt";

    // --- 3. الحدث الرئيسي: الضغط على زر "ولّد" ---
    generateButton.addEventListener("click", async () => {
        // قراءة القيم من الفورم
        const idea = ideaInput.value;
        const style = styleSelect.value;
        const lighting = lightingSelect.value;
        const composition = compositionSelect.value;
        
        // (ملاحظة: الأبعاد سنضيفها للبرومبت في الواجهة)
        const aspectRatio = aspectRatioSelect.value;

        // التحقق من أن الفكرة ليست فارغة
        if (!idea.trim()) {
            alert("الرجاء كتابة الفكرة الأساسية أولاً!");
            ideaInput.focus();
            return;
        }

        // إظهار التحميل وإخفاء الزر
        generateButton.disabled = true;
        loader.style.display = "block";
        generateButton.querySelector("i").style.display = "none";
        resultCard.style.display = "none"; // إخفاء النتيجة القديمة

        try {
            // 4. إرسال الطلب إلى "العقل المدبر" (API)
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idea: idea,
                    style: style,
                    lighting: lighting,
                    composition: composition
                }),
            });

            if (!response.ok) {
                throw new Error("فشل الاتصال بالـ API");
            }

            const data = await response.json();

            // 5. بناء البرومبت النهائي (إضافة الأبعاد)
            const finalPrompt = `${data.professionalPrompt} --ar ${aspectRatio}`;

            // 6. عرض النتيجة
            resultPrompt.value = finalPrompt;
            resultCard.style.display = "block";

        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء توليد البرومبت. الرجاء المحاولة مرة أخرى.");
        } finally {
            // 7. إرجاع الزر لحالته الطبيعية
            generateButton.disabled = false;
            loader.style.display = "none";
            generateButton.querySelector("i").style.display = "inline-block";
        }
    });

    // --- 4. حدث "نسخ" البرومبت ---
    copyButton.addEventListener("click", () => {
        resultPrompt.select();
        document.execCommand("copy"); // (الطريقة التقليدية للنسخ، تعمل جيداً)
        copyButton.innerText = "تم النسخ! 👍";
        
        setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> نسخ البرومبت';
        }, 2000);
    });

});
