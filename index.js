const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Hàm chuyển đổi ảnh thành grayscale
function toGrayscale(imageData) {
    let pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        let gray = 0.3 * pixels[i] + 0.59 * pixels[i + 1] + 0.11 * pixels[i + 2];
        pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
    }
}

// Hàm phát hiện cạnh bằng bộ lọc Sobel
function sobelEdgeDetection(imageData) {
    let width = imageData.width;
    let height = imageData.height;
    let pixels = imageData.data;
    let sobelData = new Uint8ClampedArray(pixels.length);

    const gx = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const gy = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    function getPixel(x, y, c) {
        let index = (y * width + x) * 4 + c;
        return pixels[index] || 0;
    }

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sumX = 0, sumY = 0;

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    let pixel = getPixel(x + j, y + i, 0); // Chỉ lấy kênh đỏ (đã grayscale)
                    sumX += pixel * gx[i + 1][j + 1];
                    sumY += pixel * gy[i + 1][j + 1];
                }
            }

            let magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
            let index = (y * width + x) * 4;
            sobelData[index] = sobelData[index + 1] = sobelData[index + 2] = magnitude > 128 ? 255 : 0;
            sobelData[index + 3] = 255; // Alpha
        }
    }

    return new ImageData(sobelData, width, height);
}

// Cập nhật canvas liên tục
function drawFrame() {
    if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        toGrayscale(frame);
        let edges = sobelEdgeDetection(frame);
        ctx.putImageData(edges, 0, 0);
        requestAnimationFrame(drawFrame);
    }
}

// Khi video chạy, vẽ lên canvas
video.addEventListener('play', () => {
    drawFrame();
});
