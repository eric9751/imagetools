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
