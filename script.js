// script.js

// 全局变量
let uploadedFiles = [];
let processedImages = {}; // { originalName: { dataUrl: "...", targetSize: null } }

// 多语言翻译对象 (保持不变，此处省略以节省空间)
const translations = {
    en: {
        logo: "ImageFX Pro",
        langBtn: "中文",
        title: "Professional Image Processing Suite",
        subtitle: "One-stop solution for batch image processing and format conversion",
        upload: "File Upload",
        uploadText: "Click or drag images to upload",
        uploadDesc: "Supports JPG, PNG, WEBP formats",
        resolution: "Resolution Adjustment",
        resolutionPreset: "Preset Resolution",
        custom: "Custom",
        width: "Width",
        height: "Height",
        applyRes: "Apply Resolution",
        format: "Format & Quality",
        targetFormat: "Target Format",
        quality: "Quality (JPEG/WebP): ",
        convertBtn: "Convert Format",
        compress: "Image Compression",
        targetSize: "Target Size (KB)",
        targetSizeDesc: "Enter the desired file size. The tool will try to compress to the closest size (JPEG only).",
        applyCompress: "Apply Compression",
        beautify: "Image Beautify",
        brightness: "Brightness: ",
        contrast: "Contrast: ",
        saturate: "Saturation: ",
        grayscale: "Grayscale: ",
        resetFilters: "Reset Filters",
        watermark: "Watermark Settings",
        watermarkText: "Watermark Text",
        watermarkSize: "Watermark Size: ",
        opacity: "Opacity: ",
        watermarkColor: "Color",
        watermarkPos: "Watermark Position",
        posTL: "Top-L", posTC: "Top-C", posTR: "Top-R",
        posCL: "Center-L", posC: "Center", posCR: "Center-R",
        posBL: "Bottom-L", posBC: "Bottom-C", posBR: "Bottom-R",
        addWatermark: "Add Watermark",
        preview: "Image Preview",
        previewDesc: "Previews will be shown here. Click an image to enlarge.",
        batch: "Batch Operations",
        batchDesc: "Batch processing applies all configured settings (resolution, filters, quality, watermark) to all images.",
        batchProcess: "Batch Process",
        downloadAll: "Download All",
        clearAll: "Clear All",
    },
    zh: {
        logo: "图像处理工具 Pro",
        langBtn: "English",
        title: "专业图像处理套件",
        subtitle: "一站式图像处理解决方案，支持批量操作和多种格式转换",
        upload: "文件上传",
        uploadText: "点击或拖拽上传图片",
        uploadDesc: "支持 JPG, PNG, WEBP 格式",
        resolution: "分辨率调整",
        resolutionPreset: "预设分辨率",
        custom: "自定义",
        width: "宽度",
        height: "高度",
        applyRes: "应用分辨率",
        format: "格式与质量",
        targetFormat: "目标格式",
        quality: "质量 (JPEG/WebP): ",
        convertBtn: "转换格式",
        compress: "图片压缩",
        targetSize: "目标大小 (KB)",
        targetSizeDesc: "输入期望的文件大小。工具将尝试压缩到最接近的尺寸（仅适用于JPEG）。",
        applyCompress: "应用压缩",
        beautify: "图片美化",
        brightness: "亮度: ",
        contrast: "对比度: ",
        saturate: "饱和度: ",
        grayscale: "灰度: ",
        resetFilters: "重置美化",
        watermark: "水印设置",
        watermarkText: "水印文字",
        watermarkSize: "水印大小: ",
        opacity: "透明度: ",
        watermarkColor: "颜色",
        watermarkPos: "水印位置",
        posTL: "左上", posTC: "上中", posTR: "右上",
        posCL: "左中", posC: "居中", posCR: "右中",
        posBL: "左下", posBC: "下中", posBR: "右下",
        addWatermark: "添加水印",
        preview: "图片预览",
        previewDesc: "上传图片后将在此显示预览，点击图片可放大",
        batch: "批量操作",
        batchDesc: "批量处理将应用所有已配置的设置（分辨率、美化、质量、水印）到全部图片上。",
        batchProcess: "批量处理",
        downloadAll: "下载全部",
        clearAll: "清空文件",
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // === DOM Element Selection ===
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const resolutionPreset = document.getElementById('resolutionPreset');
    const langSwitchBtn = document.querySelector('.lang-switch');

    // === Event Listeners Setup ===

    // File Upload Handlers
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // Resolution Preset Handler
    resolutionPreset.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value !== 'custom') {
            const [width, height] = value.split('x');
            document.getElementById('customWidth').value = width;
            document.getElementById('customHeight').value = height;
        }
    });

    // Language Switcher
    langSwitchBtn.addEventListener('click', () => {
        const currentLang = document.documentElement.lang === 'zh-CN' ? 'en' : 'zh';
        document.documentElement.lang = currentLang === 'en' ? 'en-US' : 'zh-CN';
        setLanguage(currentLang);
    });

    // *** FIX: Real-time Slider Value Display ***
    const sliders = {
        'qualitySlider': 'qualityValue',
        'brightnessSlider': 'brightnessValue',
        'contrastSlider': 'contrastValue',
        'saturateSlider': 'saturateValue',
        'grayscaleSlider': 'grayscaleValue',
        'fontSizeSlider': 'fontSizeValue',
        'opacitySlider': 'opacityValue'
    };

    for (const sliderId in sliders) {
        const slider = document.getElementById(sliderId);
        const displayId = sliders[sliderId];
        if (slider) {
            slider.addEventListener('input', (e) => {
                document.getElementById(displayId).textContent = e.target.value;
                 // For beautify sliders, apply filters live
                if (e.target.classList.contains('beautify-slider')) {
                    applyFiltersToPreview();
                }
            });
        }
    }

    // Initialize with default language
    setLanguage('zh');
});

/**
 * Sets the web page's language.
 * @param {string} lang - 'en' or 'zh'.
 */
function setLanguage(lang) {
    const langData = translations[lang];
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (langData[key]) {
            element.textContent = langData[key];
        }
    });
}

/**
 * Handles uploaded files.
 * @param {FileList} files - The list of files selected by the user.
 */
function handleFiles(files) {
    const fileListDiv = document.getElementById('fileList');
    const previewContent = document.getElementById('previewContent');

    if (uploadedFiles.length === 0) {
        previewContent.innerHTML = '';
        fileListDiv.innerHTML = '';
    }

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/') || uploadedFiles.some(f => f.name === file.name)) {
            return; // Skip non-images or duplicates
        }

        uploadedFiles.push(file);

        const fileItem = document.createElement('div');
        fileItem.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileListDiv.appendChild(fileItem);

        const reader = new FileReader();
        reader.onload = (e) => {
            const container = document.createElement('div');
            container.className = 'preview-image-container';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.dataset.originalName = file.name;
            img.onclick = () => showModal(img.src);

            container.appendChild(img);
            previewContent.appendChild(container);

            processedImages[file.name] = { dataUrl: e.target.result, targetSize: null };
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Main image processing function.
 * @param {string} imageDataUrl - The source image data URL.
 * @param {number|null} targetSizeKB - The target file size in KB for compression, or null.
 * @returns {Promise<string>} - A promise that resolves to the processed image data URL.
 */
function processImage(imageDataUrl, targetSizeKB = null) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = async () => {
            // 1. Apply Resolution
            const customWidth = parseInt(document.getElementById('customWidth').value);
            const customHeight = parseInt(document.getElementById('customHeight').value);
            canvas.width = customWidth > 0 ? customWidth : img.width;
            canvas.height = customHeight > 0 ? customHeight : img.height;

            // 2. Apply Beautification Filters
            const filters = Array.from(document.querySelectorAll('.beautify-slider'))
                .map(s => `${s.dataset.filter}(${s.value}${s.dataset.unit})`)
                .join(' ');
            ctx.filter = filters;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 3. Apply Watermark
            const watermarkText = document.getElementById('watermarkText').value.trim();
            if (watermarkText) {
                // (Watermark logic remains the same as previous version)
                const fontSizePercent = document.getElementById('fontSizeSlider').value;
                const opacity = document.getElementById('opacitySlider').value / 100;
                const color = document.getElementById('watermarkColor').value;
                const activePosBtn = document.querySelector('.position-btn.active');
                const position = activePosBtn ? activePosBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'center';

                const fontSize = (canvas.width * fontSizePercent) / 100;
                ctx.font = `bold ${fontSize}px 'Poppins', sans-serif`;
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                let x, y;
                const margin = canvas.width * 0.02; // 2% margin
                const textMetrics = ctx.measureText(watermarkText);
                
                const posMap = {
                    'top-left': [textMetrics.width / 2 + margin, fontSize / 2 + margin],
                    'top-center': [canvas.width / 2, fontSize / 2 + margin],
                    'top-right': [canvas.width - textMetrics.width / 2 - margin, fontSize / 2 + margin],
                    'center-left': [textMetrics.width / 2 + margin, canvas.height / 2],
                    'center': [canvas.width / 2, canvas.height / 2],
                    'center-right': [canvas.width - textMetrics.width / 2 - margin, canvas.height / 2],
                    'bottom-left': [textMetrics.width / 2 + margin, canvas.height - fontSize / 2 - margin],
                    'bottom-center': [canvas.width / 2, canvas.height - fontSize / 2 - margin],
                    'bottom-right': [canvas.width - textMetrics.width / 2 - margin, canvas.height - fontSize / 2 - margin]
                };
                [x, y] = posMap[position];

                ctx.fillText(watermarkText, x, y);
            }

            // 4. Format Conversion & Quality
            const format = document.getElementById('targetFormat').value;
            if (format === 'jpeg' && targetSizeKB) {
                 const finalDataUrl = await binarySearchCompress(canvas, targetSizeKB);
                 resolve(finalDataUrl);
            } else {
                const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
                const finalDataUrl = canvas.toDataURL(`image/${format}`, quality);
                resolve(finalDataUrl);
            }
        };
        img.src = imageDataUrl;
    });
}

/**
 * Uses binary search to find the optimal JPEG quality for a target file size.
 * @param {HTMLCanvasElement} canvas - The canvas with the image data.
 * @param {number} targetSizeKB - The target size in kilobytes.
 * @returns {Promise<string>} - The resulting data URL.
 */
async function binarySearchCompress(canvas, targetSizeKB) {
    let quality = 0.9;
    let minQuality = 0;
    let maxQuality = 1;
    let iteration = 0;
    const targetSizeBytes = targetSizeKB * 1024;
    let currentDataUrl = '';

    while (iteration < 10) { // Max 10 iterations to prevent infinite loops
        currentDataUrl = canvas.toDataURL('image/jpeg', quality);
        const currentSize = atob(currentDataUrl.split(',')[1]).length;

        if (Math.abs(currentSize - targetSizeBytes) < 5 * 1024) { // Within 5KB tolerance
            break;
        }

        if (currentSize > targetSizeBytes) {
            maxQuality = quality;
        } else {
            minQuality = quality;
        }
        quality = (minQuality + maxQuality) / 2;
        iteration++;
    }
    return currentDataUrl;
}

/**
 * Batch processes all uploaded images.
 */
async function batchProcess() {
    if (uploadedFiles.length === 0) return alert("请先上传图片！");
    alert("开始批量处理，请稍候...");

    const promises = uploadedFiles.map(async (file) => {
        const originalDataUrl = processedImages[file.name].dataUrl;
        const targetSize = processedImages[file.name].targetSize;
        const processedDataUrl = await processImage(originalDataUrl, targetSize);
        
        processedImages[file.name].dataUrl = processedDataUrl;
        
        const previewImg = document.querySelector(`img[data-original-name="${file.name}"]`);
        if (previewImg) previewImg.src = processedDataUrl;
    });

    await Promise.all(promises);
    alert("批量处理完成！");
}

/**
 * Downloads all processed images as a ZIP file.
 */
function downloadAll() {
    if (uploadedFiles.length === 0) return alert("没有可下载的图片。");

    const zip = new JSZip();
    const format = document.getElementById('targetFormat').value;

    uploadedFiles.forEach(file => {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
        const newName = `${baseName}.${format}`;
        const dataUrl = processedImages[file.name].dataUrl;
        const rawImageData = dataUrl.split(',')[1];
        zip.file(newName, rawImageData, { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "ImageFX_Tools_Processed.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

/**
 * Clears all files and resets the interface.
 */
function clearAll() {
    uploadedFiles = [];
    processedImages = {};
    document.getElementById('fileList').innerHTML = '';
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `
        <h3 data-lang-key="preview">图片预览</h3>
        <p data-lang-key="previewDesc">上传图片后将在此显示预览，点击图片可放大</p>
    `;
    const currentLang = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
    setLanguage(currentLang);
    fileInput.value = '';
}

// --- Single-purpose action functions ---

function applyResolution() { batchProcess(); }
function convertFormat() { batchProcess(); }
function applyWatermark() { batchProcess(); }

/**
 * Applies compression to a target size for all uploaded JPEG images.
 */
async function compressToTargetSize() {
    if (uploadedFiles.length === 0) return alert("请先上传图片！");
    const targetSizeInput = document.getElementById('targetSizeInput');
    const targetSizeKB = parseInt(targetSizeInput.value);

    if (!targetSizeKB || targetSizeKB <= 0) {
        return alert("请输入一个有效的正数作为目标大小 (KB)！");
    }
    
    // Set target size for all images
    uploadedFiles.forEach(file => {
        processedImages[file.name].targetSize = targetSizeKB;
    });

    // Ensure target format is JPEG for this to work
    document.getElementById('targetFormat').value = 'jpeg';
    
    alert(`将尝试把所有图片压缩到 ${targetSizeKB}KB 左右...`);
    await batchProcess();
    
    // Reset target size after processing
    uploadedFiles.forEach(file => {
        processedImages[file.name].targetSize = null;
    });
}

// --- Helper Functions ---

/**
 * Applies CSS filters to preview images in real-time.
 */
function applyFiltersToPreview() {
    const filters = Array.from(document.querySelectorAll('.beautify-slider'))
        .map(s => `${s.dataset.filter}(${s.value}${s.dataset.unit})`)
        .join(' ');
    document.querySelectorAll('#previewContent img').forEach(img => {
        img.style.filter = filters;
    });
}

/**
 * Resets all beautification filters to their default values.
 */
function resetFilters() {
    document.getElementById('brightnessSlider').value = 100;
    document.getElementById('contrastSlider').value = 100;
    document.getElementById('saturateSlider').value = 100;
    document.getElementById('grayscaleSlider').value = 0;
    document.querySelectorAll('.beautify-slider').forEach(slider => {
        slider.dispatchEvent(new Event('input'));
    });
}

/**
 * Selects the watermark position.
 * @param {HTMLElement} element - The clicked position button.
 */
function selectPosition(element) {
    document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

/**
 * Shows the image enlargement modal.
 * @param {string} src - The image source URL.
 */
function showModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modalImage.src = src;
    modal.style.display = 'block';
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}
