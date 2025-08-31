// 从这里开始复制
function setupSlider(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);

    if (slider && display) {
        slider.addEventListener('input', () => {
            display.textContent = slider.value;
        });
    } else {
        console.error(`错误：找不到 ID 为 '${sliderId}' 或 '${displayId}' 的元素。`);
    }
}

// --- 初始化所有的滑块 ---
setupSlider('qualitySlider', 'qualityValue');
setupSlider('brightnessSlider', 'brightnessValue');
setupSlider('contrastSlider', 'contrastValue');
setupSlider('saturateSlider', 'saturateValue');
setupSlider('grayscaleSlider', 'grayscaleValue');
setupSlider('fontSizeSlider', 'fontSizeValue');
setupSlider('opacitySlider', 'opacityValue');
// 复制到这里结束

// 全局变量
let currentLanguage = 'zh';
let uploadedFiles = []; // 存储上传的文件对象 { file, originalUrl, processedUrl, processedBlob, name }
let selectedPosition = 'center';

// 语言配置
const languages = {
    zh: {
        logo: '图像处理工具 Pro', langBtn: 'English', title: '专业图像处理套件',
        subtitle: '一站式图像处理解决方案，支持批量操作和多种格式转换',
        upload: '文件上传', uploadText: '点击或拖拽上传图片', uploadDesc: '支持 JPG, PNG, WEBP 格式',
        resolution: '分辨率调整', resolutionPreset: '预设分辨率', width: '宽度', height: '高度',
        applyRes: '应用分辨率', custom: '自定义', format: '格式与质量', targetFormat: '目标格式',
        quality: '质量 (JPEG/WebP)', convertBtn: '转换格式',
        compress: '图片压缩',
        targetSize: '目标大小 (KB)',
        targetSizeDesc: '输入期望的文件大小。工具将尝试压缩到最接近的尺寸（仅适用于JPEG）。',
        applyCompress: '应用压缩',
        beautify: '图片美化',
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
        quality: 'Quality (JPEG/WebP)', convertBtn: 'Convert Format',
        compress: 'Image Compression',
        targetSize: 'Target Size (KB)',
        targetSizeDesc: 'Enter the desired file size. The tool will try to compress to the nearest size (JPEG only).',
        applyCompress: 'Apply Compression',
        beautify: 'Image Beautification',
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


