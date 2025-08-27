// 全局变量
let currentLanguage = 'zh';
let uploadedFiles = [];
let selectedPosition = 'center';

// 语言配置
const languages = {
    zh: {
        logo: '图像处理工具 Pro', langBtn: 'English', title: '专业图像处理套件',
        subtitle: '一站式图像处理解决方案，支持批量操作和多种格式转换',
        upload: '文件上传', uploadText: '点击或拖拽上传图片', uploadDesc: '支持 JPG, PNG, WEBP 格式',
        resolution: '分辨率调整', resolutionPreset: '预设分辨率', width: '宽度', height: '高度',
        applyRes: '应用分辨率', custom: '自定义', format: '格式与质量', targetFormat: '目标格式',
        quality: '质量 (JPEG/WebP)', convertBtn: '转换格式', compress: '图片压缩',
        compressDesc: '通过调整图像质量来减小文件大小。此设置与“格式与质量”面板中的质量同步。',
        compressLevel: '压缩级别', applyCompress: '应用压缩', beautify: '图片美化',
        brightness: '亮度', contrast: '对比度', saturate: '饱和度', grayscale: '灰度', resetFilters: '重置美化',
        watermark: '水印设置', watermarkText: '水印文字', watermarkSize: '水印大小',
        opacity: '透明度', watermarkColor: '颜色', watermarkPos: '水印位置', addWatermark: '添加水印',
        preview: '图片预览', previewDesc: '上传图片后将在此显示预览，点击图片可放大',
        batch: '批量操作', batchDesc: '批量处理将应用所有已配置的设置（分辨率、美化、质量、水印）到全部图片上。',
        batchProcess: '批量处理', downloadAll: '下载全部', clearAll: '清空文件',
        posTL: '左上', posTC: '上中', posTR: '右上', posCL: '左中', posC: '居中',
        posCR: '右中', posBL: '左下', posBC: '下中', posBR: '右下'
    },
    en: {
        logo: 'Image Processor Pro', langBtn: '中文', title: 'Professional Image Processing Suite',
        subtitle: 'One-stop image processing solution with batch operations and format conversion',
        upload: 'File Upload', uploadText: 'Click or drag to upload images', uploadDesc: 'Supports JPG, PNG, WEBP formats',
        resolution: 'Resolution', resolutionPreset: 'Preset Resolution', width: 'Width', height: 'Height',
        applyRes: 'Apply Resolution', custom: 'Custom', format: 'Format & Quality', targetFormat: 'Target Format',
        quality: 'Quality (JPEG/WebP)', convertBtn: 'Convert Format', compress: 'Image Compression',
        compressDesc: 'Reduce file size by adjusting image quality. This is synced with the quality in the "Format & Quality" panel.',
        compressLevel: 'Compression Level', applyCompress: 'Apply Compression', beautify: 'Image Beautification',
        brightness: 'Brightness', contrast: 'Contrast', saturate: 'Saturation', grayscale: 'Grayscale', resetFilters: 'Reset Filters',
        watermark: 'Watermark', watermarkText: 'Watermark Text', watermarkSize: 'Watermark Size',
        opacity: 'Opacity', watermarkColor: 'Color', watermarkPos: 'Watermark Position', addWatermark: 'Add Watermark',
        preview: 'Image Preview', previewDesc: 'Preview appears here. Click on the image to enlarge.',
        batch: 'Batch Operations', batchDesc: 'Batch process applies all configured settings (resolution, filters, quality, watermark) to all images.',
        batchProcess: 'Batch Process', downloadAll: 'Download All', clearAll: 'Clear All',
        posTL: 'Top-L', posTC: 'Top-C', posTR: 'Top-R', posCL: 'Center-L', posC: 'Center',
        posCR: 'Center-R', posBL: 'Bottom-L', posBC: 'Bottom-C', posBR: 'Bottom-R'
    }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    updateUI();
});

function initializeApp() {
    setupFileUpload();
    setupEventListeners();
    setupSliders();
    setupModal();
}

function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, e => {
            e.preventDefault(); e.stopPropagation();
        }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = '#00d4ff';
            uploadArea.style.backgroundColor = 'rgba(0, 212, 255, 0.05)';
        }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            uploadArea.style.backgroundColor = '';
        }, false);
    });
    uploadArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
}

function setupEventListeners() {
    document.querySelector('.lang-switch').addEventListener('click', toggleLanguage);
    document.getElementById('resolutionPreset').addEventListener('change', function() {
        if (this.value !== 'custom') {
            const [width, height] = this.value.split('x');
            document.getElementById('customWidth').value = width;
            document.getElementById('customHeight').value = height;
        }
    });
    // 质量与压缩滑块同步
    const qualitySlider = document.getElementById('qualitySlider');
    const compressionSlider = document.getElementById('compressionSlider');
    qualitySlider.addEventListener('input', () => syncSliders(qualitySlider, compressionSlider));
    compressionSlider.addEventListener('input', () => syncSliders(compressionSlider, qualitySlider));
}

function syncSliders(source, target) {
    target.value = source.value;
    document.getElementById('qualityValue').textContent = source.value;
    document.getElementById('compressionValue').textContent = source.value;
}

function setupSliders() {
    ['quality', 'compression', 'opacity', 'fontSize', 'brightness', 'contrast', 'saturate', 'grayscale'].forEach(id => {
        const slider = document.getElementById(`${id}Slider`);
        const valueSpan = document.getElementById(`${id}Value`);
        if (slider && valueSpan) {
            slider.addEventListener('input', () => { valueSpan.textContent = slider.value; });
        }
    });
    document.querySelectorAll('.beautify-slider').forEach(slider => {
        slider.addEventListener('input', updatePreviewFilters);
    });
}

function setupModal() {
    const modal = document.getElementById('imageModal');
    document.getElementById('previewArea').addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            document.getElementById('modalImage').src = e.target.src;
            modal.style.display = "block";
        }
    });
    modal.addEventListener('click', () => {
        modal.style.display = "none";
    });
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedFiles.push({
                    file: file, originalUrl: e.target.result,
                    processedUrl: e.target.result, processedBlob: null, name: file.name
                });
                if (uploadedFiles.length === 1) { // Only reset filters for the first image
                     resetFilters();
                }
                renderFileList();
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
}

function renderFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    uploadedFiles.forEach((fileObj, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; overflow: hidden;">
                <img src="${fileObj.processedUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <div style="font-weight: 600; overflow: hidden; text-overflow: ellipsis;">${fileObj.name}</div>
                    <div style="font-size: 0.9rem; opacity: 0.7;">${(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
            </div>
            <button onclick="removeFile(${index})" style="background: rgba(255, 0, 0, 0.2); border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 50%; width: 24px; height: 24px; color: #ff6b6b; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 0;">×</button>
        `;
        fileList.appendChild(fileItem);
    });
}

function removeFile(index) {
    URL.revokeObjectURL(uploadedFiles[index].processedUrl);
    uploadedFiles.splice(index, 1);
    renderFileList();
    updatePreview();
}

function updatePreview() {
    const previewArea = document.getElementById('previewContent');
    const lang = languages[currentLanguage];
    if (uploadedFiles.length > 0) {
        previewArea.innerHTML = `
            <h3>${lang.preview} (1 / ${uploadedFiles.length})</h3>
            <img id="previewImage" src="${uploadedFiles[0].processedUrl}">
            <div class="progress-bar" id="progressBar" style="display: none;"><div class="progress-fill" id="progressFill"></div></div>
        `;
        updatePreviewFilters(); // Apply current filter values to new preview
    } else {
        previewArea.innerHTML = `
            <h3 data-lang-key="preview">${lang.preview}</h3>
            <p data-lang-key="previewDesc">${lang.previewDesc}</p>
        `;
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    updateUI();
}

function updateUI() {
    const lang = languages[currentLanguage];
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (lang[key]) {
            if (el.tagName === 'OPTION') {
                el.textContent = lang[key];
            } else if (el.placeholder !== undefined) {
                el.placeholder = lang[key];
            } else {
                 el.innerHTML = lang[key];
            }
        }
    });
    // Manually update spans inside labels for sliders
     document.querySelector('label[data-lang-key="quality"]').innerHTML = `${lang.quality}: <span id="qualityValue">${document.getElementById('qualitySlider').value}</span>%`;
     document.querySelector('label[data-lang-key="compressLevel"]').innerHTML = `${lang.compressLevel}: <span id="compressionValue">${document.getElementById('compressionSlider').value}</span>%`;
     document.querySelector('label[data-lang-key="brightness"]').innerHTML = `${lang.brightness}: <span id="brightnessValue">${document.getElementById('brightnessSlider').value}</span>%`;
     document.querySelector('label[data-lang-key="contrast"]').innerHTML = `${lang.contrast}: <span id="contrastValue">${document.getElementById('contrastSlider').value}</span>%`;
     document.querySelector('label[data-lang-key="saturate"]').innerHTML = `${lang.saturate}: <span id="saturateValue">${document.getElementById('saturateSlider').value}</span>%`;
     document.querySelector('label[data-lang-key="grayscale"]').innerHTML = `${lang.grayscale}: <span id="grayscaleValue">${document.getElementById('grayscaleSlider').value}</span>%`;
     document.querySelector('label[data-lang-key="watermarkSize"]').innerHTML = `${lang.watermarkSize}: <span id="fontSizeValue">${document.getElementById('fontSizeSlider').value}</span>%`;
     document.querySelector('label[data-lang-key="opacity"]').innerHTML = `${lang.opacity}: <span id="opacityValue">${document.getElementById('opacitySlider').value}</span>%`;

    document.getElementById('watermarkText').placeholder = currentLanguage === 'zh' ? '© 您的名字 2025' : '© Your Name 2025';
}

function selectPosition(element, position) {
    document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    selectedPosition = position;
}

function showProgress() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.display = 'block';
        document.getElementById('progressFill').style.width = '0%';
    }
}

function hideProgress() {
    setTimeout(() => {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) progressBar.style.display = 'none';
    }, 500);
}

function updateProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = percent + '%';
}

function getFilterSettings() {
     const filters = {};
     document.querySelectorAll('.beautify-slider').forEach(slider => {
         filters[slider.dataset.filter] = `${slider.value}${slider.dataset.unit}`;
     });
     return filters;
}

function updatePreviewFilters() {
    const previewImg = document.getElementById('previewImage');
    if (!previewImg) return;
    const filters = getFilterSettings();
    previewImg.style.filter = Object.entries(filters).map(([key, value]) => `${key}(${value})`).join(' ');
}

function resetFilters() {
    document.getElementById('brightnessSlider').value = 100;
    document.getElementById('contrastSlider').value = 100;
    document.getElementById('saturateSlider').value = 100;
    document.getElementById('grayscaleSlider').value = 0;
    document.querySelectorAll('.beautify-slider').forEach(slider => {
        document.getElementById(`${slider.id.replace('Slider', 'Value')}`).textContent = slider.value;
    });
    updatePreviewFilters();
}

async function processImage(fileObj, options) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = options.width || img.width;
            canvas.height = options.height || img.height;

            if(options.filters) {
               ctx.filter = Object.entries(options.filters).map(([key, value]) => `${key}(${value})`).join(' ');
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';

            if (options.watermark && options.watermark.text) {
                const wm = options.watermark;
                const fontSize = (canvas.width * (wm.size / 100));
                ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
                ctx.fillStyle = wm.color;
                ctx.globalAlpha = wm.opacity;
                ctx.textBaseline = 'middle';

                const marginX = canvas.width * 0.05, marginY = canvas.height * 0.05;
                const positions = {
                    'top-left': { x: marginX, y: marginY, textAlign: 'left' },
                    'top-center': { x: canvas.width / 2, y: marginY, textAlign: 'center' },
                    'top-right': { x: canvas.width - marginX, y: marginY, textAlign: 'right' },
                    'center-left': { x: marginX, y: canvas.height / 2, textAlign: 'left' },
                    'center': { x: canvas.width / 2, y: canvas.height / 2, textAlign: 'center' },
                    'center-right': { x: canvas.width - marginX, y: canvas.height / 2, textAlign: 'right' },
                    'bottom-left': { x: marginX, y: canvas.height - marginY, textAlign: 'left' },
                    'bottom-center': { x: canvas.width / 2, y: canvas.height - marginY, textAlign: 'center' },
                    'bottom-right': { x: canvas.width - marginX, y: canvas.height - marginY, textAlign: 'right' }
                };
                const pos = positions[wm.position];
                ctx.textAlign = pos.textAlign;
                ctx.fillText(wm.text, pos.x, pos.y);
            }

            const format = `image/${options.format || fileObj.file.type.split('/')[1] || 'jpeg'}`;
            const quality = (options.quality || 90) / 100;
            canvas.toBlob(blob => {
                const oldName = fileObj.name;
                const nameWithoutExt = oldName.substring(0, oldName.lastIndexOf('.'));
                const newExt = (options.format || (format.split('/')[1])).replace('jpeg', 'jpg');
                resolve({ blob, name: `${nameWithoutExt}.${newExt}` });
            }, format, quality);
        };
        img.onerror = reject;
        img.src = fileObj.originalUrl;
    });
}

async function applyChanges(settings) {
    if (uploadedFiles.length === 0) {
        alert(languages[currentLanguage].uploadFirst || 'Please upload images first'); return;
    }
    showProgress();
    for (let i = 0; i < uploadedFiles.length; i++) {
        try {
            const { blob, name } = await processImage(uploadedFiles[i], settings);
            URL.revokeObjectURL(uploadedFiles[i].processedUrl);
            uploadedFiles[i].processedUrl = URL.createObjectURL(blob);
            uploadedFiles[i].processedBlob = blob;
            uploadedFiles[i].name = name;
            updateProgress(((i + 1) / uploadedFiles.length) * 100);
        } catch (error) {
            console.error('Error processing image:', error);
            alert(`Error processing ${uploadedFiles[i].name}.`); break;
        }
    }
    renderFileList();
    updatePreview();
    hideProgress();
}

function applyResolution() { applyChanges({ width: parseInt(document.getElementById('customWidth').value) || null, height: parseInt(document.getElementById('customHeight').value) || null }); }
function convertFormat() { applyChanges({ format: document.getElementById('targetFormat').value, quality: parseInt(document.getElementById('qualitySlider').value) }); }
function compressImages() { applyChanges({ quality: parseInt(document.getElementById('compressionSlider').value) }); }
function applyWatermark() {
    const text = document.getElementById('watermarkText').value;
    if (!text.trim()) { alert(currentLanguage === 'zh' ? '请输入水印文字' : 'Please enter watermark text'); return; }
    applyChanges({
        watermark: {
            text: text, size: parseFloat(document.getElementById('fontSizeSlider').value),
            color: document.getElementById('watermarkColor').value,
            opacity: parseInt(document.getElementById('opacitySlider').value) / 100,
            position: selectedPosition
        }
    });
}

function batchProcess() {
    const watermarkText = document.getElementById('watermarkText').value;
    applyChanges({
        width: parseInt(document.getElementById('customWidth').value) || null,
        height: parseInt(document.getElementById('customHeight').value) || null,
        format: document.getElementById('targetFormat').value,
        quality: parseInt(document.getElementById('qualitySlider').value),
        filters: getFilterSettings(),
        watermark: watermarkText.trim() ? {
            text: watermarkText, size: parseFloat(document.getElementById('fontSizeSlider').value),
            color: document.getElementById('watermarkColor').value,
            opacity: parseInt(document.getElementById('opacitySlider').value) / 100,
            position: selectedPosition
        } : null
    });
}

async function downloadAll() {
    const filesToDownload = uploadedFiles.filter(f => f.processedBlob);
    if (filesToDownload.length === 0) {
        alert(currentLanguage === 'zh' ? '没有可下载的处理后文件' : 'No processed files to download'); return;
    }
    showProgress();
    if (filesToDownload.length === 1) {
        const fileObj = filesToDownload[0];
        const a = document.createElement('a');
        a.href = fileObj.processedUrl; a.download = fileObj.name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        updateProgress(100); hideProgress(); return;
    }
    const zip = new JSZip();
    for (let i = 0; i < filesToDownload.length; i++) {
        zip.file(filesToDownload[i].name, filesToDownload[i].processedBlob);
        updateProgress(((i + 1) / filesToDownload.length) * 100);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content); a.download = "processed_images.zip";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    hideProgress();
}

function clearAll() {
    uploadedFiles.forEach(fileObj => URL.revokeObjectURL(fileObj.processedUrl));
    uploadedFiles = [];
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('fileInput').value = '';
    resetFilters();
    updatePreview();
    alert(currentLanguage === 'zh' ? '所有文件已清空' : 'All files cleared');
}
