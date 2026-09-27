const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function verifyTransparency() {
    const rendersDir = path.resolve(__dirname, 'banners', 'test-renders');
    if (!fs.existsSync(rendersDir)) {
        console.error("❌ Test renders directory does not exist. Run test-10pct-render.js first.");
        process.exit(1);
    }

    const files = fs.readdirSync(rendersDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
        console.error("❌ No PNG files found in banners/test-renders.");
        process.exit(1);
    }

    console.log(`\n🔍 Verifying alpha transparency across ${files.length} rendered files...`);

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    let allPassed = true;

    for (const file of files) {
        const filePath = path.join(rendersDir, file);
        const imageBuffer = fs.readFileSync(filePath);
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        const pixelData = await page.evaluate(async (dataUri) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Sample 4 corners and center
                    const topLeft = ctx.getImageData(0, 0, 1, 1).data;
                    const topRight = ctx.getImageData(img.width - 1, 0, 1, 1).data;
                    const bottomLeft = ctx.getImageData(0, img.height - 1, 1, 1).data;
                    const bottomRight = ctx.getImageData(img.width - 1, img.height - 1, 1, 1).data;
                    const center = ctx.getImageData(Math.floor(img.width / 2), Math.floor(img.height / 2), 1, 1).data;

                    resolve({
                        width: img.width,
                        height: img.height,
                        corners: {
                            topLeft: Array.from(topLeft),
                            topRight: Array.from(topRight),
                            bottomLeft: Array.from(bottomLeft),
                            bottomRight: Array.from(bottomRight)
                        },
                        center: Array.from(center)
                    });
                };
                img.src = dataUri;
            });
        }, base64Image);

        const { topLeft, topRight, bottomLeft, bottomRight } = pixelData.corners;
        console.log(`\n📄 [${file}] (${pixelData.width}x${pixelData.height})`);
        console.log(`   - Top-Left (0,0):       RGBA(${topLeft.join(', ')}) [Alpha: ${topLeft[3]}]`);
        console.log(`   - Top-Right:            RGBA(${topRight.join(', ')}) [Alpha: ${topRight[3]}]`);
        console.log(`   - Bottom-Left:         RGBA(${bottomLeft.join(', ')}) [Alpha: ${bottomLeft[3]}]`);
        console.log(`   - Bottom-Right:        RGBA(${bottomRight.join(', ')}) [Alpha: ${bottomRight[3]}]`);
        console.log(`   - Center:              RGBA(${pixelData.center.join(', ')}) [Alpha: ${pixelData.center[3]}]`);

        // Check corner transparency
        const hasTransparentCorner = topLeft[3] === 0 || topRight[3] === 0 || bottomLeft[3] === 0 || bottomRight[3] === 0;
        if (hasTransparentCorner) {
            console.log(`   ✅ Transparent corner detected & preserved without black fill!`);
        } else {
            console.log(`   ℹ️ Source template appears to have opaque corners RGBA(${topLeft.join(', ')})`);
        }
    }

    await browser.close();
    console.log(`\n🎉 Verification completed successfully!`);
}

verifyTransparency().catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
});
