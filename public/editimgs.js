// Hàm kiểm tra đăng nhập và hiển thị thông tin người dùng
async function checkLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "signin.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            localStorage.removeItem("token");
            window.location.href = "signin.html";
            return;
        }

        const user = await response.json();
        document.getElementById("user-name").textContent = user.username;
        document.getElementById("user-email").textContent = user.email;
        document.getElementById("user-button").classList.remove("hidden");

        document.getElementById("logout-button").addEventListener("click", function() {
            localStorage.removeItem("token");
            window.location.href = "signin.html";
        });
    } catch (error) {
        localStorage.removeItem("token");
        window.location.href = "signin.html";
    }
}

// Hàm xử lý thay đổi chức năng AI
function handleAIFunctionChange() {
    const textInput = document.getElementById("textInput");
    const selfieTextInput = document.getElementById("selfieTextInput");
    const fileInput = document.getElementById("imageUpload");

    // Ẩn tất cả các trường input trước
    textInput.classList.add("hidden");
    selfieTextInput.classList.add("hidden");
    fileInput.classList.remove("hidden");

    // Hiển thị trường input phù hợp với chức năng được chọn
    if (this.value === "text-to-image") {
        textInput.classList.remove("hidden");
        fileInput.classList.add("hidden");
    } else if (this.value === "ai-selfie-generator") {
        selfieTextInput.classList.remove("hidden");
    }
}

// Hàm xử lý tải ảnh và gọi API
async function processImage() {
    const fileInput = document.getElementById("imageUpload");
    const textInput = document.getElementById("textInput");
    const selfieTextInput = document.getElementById("selfieTextInput");
    const aiFunction = document.getElementById("aiFunction").value;
    const outputImage = document.getElementById("outputImage");
    const uploadedImage = document.getElementById("uploadedImage");
    const downloadImage = document.getElementById("downloadImage");
    const loadingSpinner = document.getElementById("loadingSpinner");

    // Hiển thị biểu tượng chờ
    loadingSpinner.classList.remove("hidden");

    const formData = new FormData();
    
    if (aiFunction === "text-to-image") {
        if (!textInput.value.trim()) {
            alert("Please enter text to generate an image.");
            loadingSpinner.classList.add("hidden");
            return;
        }
        formData.append("text", textInput.value);
    } else if (aiFunction === "ai-selfie-generator") {
        if (!fileInput.files.length || !selfieTextInput.value.trim()) {
            alert("Please upload an image and enter text for the AI Selfie Generator.");
            loadingSpinner.classList.add("hidden");
            return;
        }
        formData.append("image", fileInput.files[0]);
        formData.append("text", selfieTextInput.value);
        uploadedImage.src = URL.createObjectURL(fileInput.files[0]);
        uploadedImage.classList.remove("hidden");
    } else {
        if (!fileInput.files.length) {  
            alert("Please upload an image.");
            loadingSpinner.classList.add("hidden");
            return;
        }
        formData.append("image", fileInput.files[0]);
        uploadedImage.src = URL.createObjectURL(fileInput.files[0]);
        uploadedImage.classList.remove("hidden");
    }
    
    const apiKeys = "617d4f0a-297c-4cf8-aa91-c1286cf8a60d";
    const endpoints = {
        "background-remover": "https://api.deepai.org/api/background-remover",
        "colorizer": "https://api.deepai.org/api/colorizer",
        "super-resolution": "https://api.deepai.org/api/torch-srgan",
        "image-expansion": "https://api.deepai.org/api/zoom-out",
        "text-to-image": "https://api.deepai.org/api/text2img",
        "ai-selfie-generator": "https://api.deepai.org/api/ai-selfie-generator"
    };
    
    try {
        const response = await fetch(endpoints[aiFunction], {
            method: "POST",
            body: formData,
            headers: {
                "api-key": apiKeys
            }
        });
        
        const result = await response.json();
        if (result.output_url) {
            outputImage.src = result.output_url;
            outputImage.classList.remove("hidden");
            downloadImage.classList.remove("hidden");

            // Xử lý sự kiện tải ảnh khi nhấn nút Download
            downloadImage.addEventListener("click", function() {
                fetch(result.output_url)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "edited_image.png";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(() => alert("Failed to download image."));
            });
        } else {
            alert("Error processing image");
        }
    } catch (error) {
        alert("Failed to process image.");
    } finally {
        // Ẩn biểu tượng chờ
        loadingSpinner.classList.add("hidden");
    }
}

// Hàm khởi tạo sự kiện
function initEventListeners() {
    document.getElementById("aiFunction").addEventListener("change", handleAIFunctionChange);
    document.getElementById("processImage").addEventListener("click", processImage);
    document.getElementById("newProject").addEventListener("click", () => window.location.reload());
}

// Khởi chạy khi trang được tải
document.addEventListener("DOMContentLoaded", function() {
    checkLogin();
    initEventListeners();
});