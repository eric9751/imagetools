// script.js

// --- 全局变量和状态管理 ---
let uploadedFiles = [];
let processedImages = {}; // 结构: { "filename.jpg": { dataUrl: "...", processedUrl: "..." } }

// --- 多语言翻译数据 ---
const translations = {
    en: {
        logo: "ImageFX Pro", langBtn: "中文", title: "Professional Image Processing Suite",
        subtitle: "One-stop solution for batch image processing and format conversion",
        upload: "File Upload", uploadText: "Click or drag images to upload",
        uploadDesc: "Supports JPG, PNG, WEBP formats",
        resolution: "Resolution Adjustment", resolutionPreset: "Preset Resolution",
        custom: "Custom", width: "Width", height: "Height",
        applyRes: "Apply Resolution", format: "Format & Quality", targetFormat: "Target Format",
        quality: "Quality (JPEG/WebP): ", convertBtn: "Convert Format",
        compress: "Image Compression", targetSize: "Target Size (KB)",
        targetSizeDesc: "Enter the desired file size. The tool will try to compress to the closest size (JPEG only).",
        applyCompress: "Apply Compression", beautify: "Image Beautify", brightness: "Brightness: ",
        contrast: "Contrast: ", saturate: "Saturation: ", grayscale: "Grayscale: ",
        resetFilters: "Reset Filters", watermark: "Watermark Settings", watermarkText: "Watermark Text",
        watermarkSize: "Watermark Size: ", opacity: "Opacity: ", watermarkColor: "Color",
        watermarkPos: "Watermark Position", posTL: "Top-L", posTC: "Top-C", posTR: "Top-R",
        posCL: "Center-L", posC: "Center", posCR: "Center-R", posBL: "Bottom-L",
        posBC: "Bottom-C", posBR: "Bottom-R", addWatermark: "Add Watermark",
        preview: "Image Preview", previewDesc: "Previews will be shown here. Click an image to enlarge.",
        batch: "Batch Operations", batchDesc: "Batch processing applies all configured settings (resolution, filters, quality, watermark) to all images.",
        batchProcess: "Batch Process", downloadAll: "Download All", clearAll: "Clear All",
    },
    zh: {
        logo: "图像处理工具 Pro", langBtn: "English", title: "专业图像处理套件",
        subtitle: "一站式图像处理解决方案，支持批量操作和多种格式转换",
        upload: "文件上传", uploadText: "点击或拖拽上传图片",
        uploadDesc: "支持 JPG, PNG, WEBP 格式",
        resolution: "分辨率调整", resolutionPreset: "预设分辨率",
        custom: "自定义", width: "宽度", height: "高度",
        applyRes: "应用分辨率", format: "格式与质量", targetFormat: "目标格式",
        quality: "质量 (JPEG/WebP): ", convertBtn: "转换格式",
        compress: "图片压缩", targetSize: "目标大小 (KB)",
        targetSizeDesc: "输入期望的文件大小。工具将尝试压缩到最接近的尺寸（仅适用于JPEG）。",
        applyCompress: "应用压缩", beautify: "图片美化", brightness: "亮度: ",
        contrast: "对比度: ", saturate: "饱和度: ", grayscale: "灰度: ",
        resetFilters: "重置美化", watermark: "水印设置", watermarkText: "水印文字",
        watermarkSize: "水印大小: ", opacity: "透明度: ", watermarkColor: "颜色",
        watermarkPos: "水印位置", posTL: "左上", posTC: "上中", posTR: "右上",
        posCL: "左中", posC: "居中", posCR: "右中", posBL: "左下",
        posBC: "下中", posBR: "右下", addWatermark: "添加水印",
        preview: "图片预览", previewDesc: "上传图片后将在此显示预览，点击图片可放大",
        batch: "批量操作", batchDesc: "批量处理将应用所有已配置的设置（分辨率、美化、质量、水印）到全部图片上。",
        batchProcess: "批量处理", downloadAll: "下载全部", clearAll: "清空文件",
    }
};

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setLanguage('zh');
});

/**
 * 集中设置所有事件监听器
 */
function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // 文件上传
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // 语言切换
    document.querySelector('.lang-switch').addEventListener('click', () => {
        const currentLang = document.documentElement.lang === 'zh-CN' ? 'en' : 'zh';
        document.documentElement.lang = currentLang === 'en' ? 'en-US' : 'zh-CN';
        setLanguage(currentLang);
    });

    // 分辨率预设
    document.getElementById('resolutionPreset').addEventListener('change', (e) => {
        if (e.target.value !== 'custom') {
            const [width, height] = e.target.value.split('x');
            document.getElementById('customWidth').value = width;
            document.getElementById('customHeight').value = height;
        }
    });

    // 实时更新滑块数值
    const sliders = {
        'qualitySlider': 'qualityValue', 'fontSizeSlider': 'fontSizeValue',
        'opacitySlider': 'opacityValue', 'brightnessSlider': 'brightnessValue',
        'contrastSlider': 'contrastValue', 'saturateSlider': 'saturateValue',
        'grayscaleSlider': 'grayscaleValue'
    };
    for (const [sliderId, displayId] of Object.entries(sliders)) {
        const slider = document.getElementById(sliderId);
        if (slider) {
            slider.addEventListener('input', (e) => {
                document.getElementById(displayId).textContent = e.target.value;
                if (e.target.classList.contains('beautify-slider')) {
                    applyFiltersToPreview();
                }
            });
        }
    }
}

/**
 * 处理上传的文件
 * @param {FileList} files - 用户选择的文件列表
 */
function handleFiles(files) {
    const fileListDiv = document.getElementById('fileList');
    const previewContent = document.getElementById('previewContent');

    if (uploadedFiles.length === 0) {
        previewContent.innerHTML = '';
    }

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/') || uploadedFiles.some(f => f.name === file.name)) return;

        uploadedFiles.push(file);

        const fileItem = document.createElement('div');
        fileItem.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        fileListDiv.appendChild(fileItem);

        const reader = new FileReader();
        reader.onload = e => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.dataset.originalName = file.name;
            img.onclick = () => showModal(img.src);
            previewContent.appendChild(img);
            processedImages[file.name] = { dataUrl: e.target.result, processedUrl: null };
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 核心图像处理函数
 * @param {string} imageDataUrl - 图像的 Data URL
 * @param {object} settings - 包含所有处理设置的对象
 * @returns {Promise<string>} 处理后的图像 Data URL
 */
function processImage(imageDataUrl, settings) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = async () => {
            // 分辨率
            canvas.width = settings.width > 0 ? settings.width : img.width;
            canvas.height = settings.height > 0 ? settings.height : img.height;

            // 美化滤镜
            ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturate}%) grayscale(${settings.grayscale}%)`;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 水印
            if (settings.watermarkText) {
                // (此处省略详细的水印定位计算，逻辑与之前版本相同)
                const fontSize = (canvas.width * settings.fontSize) / 100;
                ctx.font = `bold ${fontSize}px 'Poppins', sans-serif`;
                ctx.fillStyle = settings.watermarkColor;
                ctx.globalAlpha = settings.watermarkOpacity;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                const [x, y] = getWatermarkPosition(canvas, ctx, settings.watermarkText, settings.watermarkPosition, fontSize);
                ctx.fillText(settings.watermarkText, x, y);
            }
            
            // 格式与质量/大小
            if (settings.format === 'jpeg' && settings.targetSize) {
                const finalDataUrl = await binarySearchCompress(canvas, settings.targetSize);
                resolve(finalDataUrl);
            } else {
                const finalDataUrl = canvas.toDataURL(`image/${settings.format}`, settings.quality);
                resolve(finalDataUrl);
            }
        };
        img.src = imageDataUrl;
    });
}


/**
 * 批量处理所有图片
 */
async function batchProcess() {
    if (uploadedFiles.length === 0) return alert("请先上传图片！");

    // 1. 收集所有设置
    const settings = {
        width: parseInt(document.getElementById('customWidth').value),
        height: parseInt(document.getElementById('customHeight').value),
        format: document.getElementById('targetFormat').value,
        quality: parseInt(document.getElementById('qualitySlider').value) / 100,
        targetSize: parseInt(document.getElementById('targetSizeInput').value) || null,
        brightness: document.getElementById('brightnessSlider').value,
        contrast: document.getElementById('contrastSlider').value,
        saturate: document.getElementById('saturateSlider').value,
        grayscale: document.getElementById('grayscaleSlider').value,
        watermarkText: document.getElementById('watermarkText').value.trim(),
        fontSize: document.getElementById('fontSizeSlider').value,
        watermarkOpacity: document.getElementById('opacitySlider').value / 100,
        watermarkColor: document.getElementById('watermarkColor').value,
        watermarkPosition: document.querySelector('.position-btn.active').dataset.position || 'center'
    };
    
    alert("开始批量处理...");

    // 2. 异步处理所有文件
    const promises = uploadedFiles.map(file => 
        processImage(processedImages[file.name].dataUrl, settings).then(processedUrl => {
            processedImages[file.name].processedUrl = processedUrl;
            const previewImg = document.querySelector(`img[data-original-name="${file.name}"]`);
            if (previewImg) previewImg.src = processedUrl;
        })
    );
    
    await Promise.all(promises);
    alert("批量处理完成！");
}

/**
 * 下载所有处理后的图片
 */
function downloadAll() {
    if (uploadedFiles.length === 0 || !processedImages[uploadedFiles[0].name].processedUrl) {
        return alert("没有可下载的图片。请先处理。");
    }

    const zip = new JSZip();
    const format = document.getElementById('targetFormat').value;

    uploadedFiles.forEach(file => {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
        const newName = `${baseName}.${format}`;
        const dataUrl = processedImages[file.name].processedUrl;
        zip.file(newName, dataUrl.split(',')[1], { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "ImageFX_Processed.zip";
        link.click();
    });
}

// --- 单个功能按钮的快捷方式 (它们都调用批量处理) ---
function applyResolution() { batchProcess(); }
function convertFormat() { batchProcess(); }
function applyWatermark() { batchProcess(); }
async function compressToTargetSize() {
    if (uploadedFiles.length === 0) return alert("请先上传图片！");
    const targetSizeKB = parseInt(document.getElementById('targetSizeInput').value);
    if (!targetSizeKB || targetSizeKB <= 0) return alert("请输入一个有效的正数作为目标大小 (KB)！");
    
    document.getElementById('targetFormat').value = 'jpeg'; // 强制JPEG格式
    await batchProcess();
}

// --- 界面辅助函数 ---

function clearAll() {
    uploadedFiles = [];
    processedImages = {};
    document.getElementById('fileList').innerHTML = '';
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `<h3 data-lang-key="preview">图片预览</h3><p data-lang-key="previewDesc">上传图片后将在此显示预览，点击图片可放大</p>`;
    document.getElementById('fileInput').value = '';
    const currentLang = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
    setLanguage(currentLang);
    alert("已清空。");
}

function applyFiltersToPreview() {
    const filters = Array.from(document.querySelectorAll('.beautify-slider'))
        .map(s => `${s.dataset.filter}(${s.value}${s.dataset.unit})`)
        .join(' ');
    document.querySelectorAll('#previewContent img').forEach(img => {
        img.style.filter = filters;
    });
}

function resetFilters() {
    document.getElementById('brightnessSlider').value = 100;
    document.getElementById('contrastSlider').value = 100;
    document.getElementById('saturateSlider').value = 100;
    document.getElementById('grayscaleSlider').value = 0;
    document.querySelectorAll('.beautify-slider').forEach(slider => slider.dispatchEvent(new Event('input')));
}

function selectPosition(element, position) {
    document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    element.dataset.position = position;
}

function showModal(src) {
    const modal = document.getElementById('imageModal');
    document.getElementById('modalImage').src = src;
    modal.style.display = 'block';
    modal.onclick = () => { modal.style.display = 'none'; };
}

function getWatermarkPosition(canvas, ctx, text, position, fontSize) {
    const margin = canvas.width * 0.02;
    const textMetrics = ctx.measureText(text);
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
    return posMap[position] || posMap['center'];
}

async function binarySearchCompress(canvas, targetSizeKB) {
    let quality = 0.9, min = 0, max = 1, iteration = 0, dataUrl = '';
    const targetBytes = targetSizeKB * 1024;
    while (iteration < 10) {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        const currentSize = atob(dataUrl.split(',')[1]).length;
        if (Math.abs(currentSize - targetBytes) < 1024 * 5) break; // 5KB 容差
        if (currentSize > targetBytes) max = quality; else min = quality;
        quality = (min + max) / 2;
        iteration++;
    }
    return dataUrl;
}

function setLanguage(lang) {
    const data = translations[lang];
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        if (data[key]) el.textContent = data[key];
    });
}
