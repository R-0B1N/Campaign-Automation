/*
 * Phase 2: The Image Renderer
 * This script takes your template and data, and renders a final image.
 * Uses Base64 embedding for the background image for reliability.
 */

const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generates an image from an HTML template and data.
 * @param {object} templateData - The data to inject into the template.
 * @param {string} outputFilename - The name of the file to save (e.g., 'Foxian_banner.png').
 */
async function generateImage(templateData, outputFilename) {
    console.log(`Starting generation for: ${outputFilename}`);

    // --- MODIFIED: Define all paths ---
    const templateFilePath = path.resolve(__dirname, 'test.html');
    const backgroundFileName = 'background-empty.png'; // Correct extension
    const absoluteBgPath = path.resolve(__dirname, backgroundFileName);
    const fullOutputPath = path.join(__dirname, 'banners', outputFilename);
    // --- End Modification ---

    console.log(`Resolved template path: ${templateFilePath}`);
    console.log(`Resolved background image path: ${absoluteBgPath}`);
    console.log(`Resolved output path: ${fullOutputPath}`); // Added this log

    let browser; // Define browser outside try block for closing in catch
    let bgImageDataUri = '';

    try {
        // --- NEW: Ensure output directory exists ---
        await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
        // --- End New ---

        // --- FIX: Read image file and convert to Base64 Data URI ---
        console.log(`Reading background image file: ${absoluteBgPath}`);
        const imageBuffer = await fs.readFile(absoluteBgPath);
        const base64Image = imageBuffer.toString('base64');
        bgImageDataUri = `data:image/png;base64,${base64Image}`;
        console.log(`Generated background image data URI (length: ${bgImageDataUri.length})`);
        // --- End Fix ---

        // 1. Read the HTML template
        const htmlTemplate = await fs.readFile(templateFilePath, 'utf-8');

        // 2. Compile the template
        const template = handlebars.compile(htmlTemplate);

        // 3. Inject all data into the template, using the data URI
        const finalHtml = template({
            ...templateData,
            background_image_url: bgImageDataUri // Use the data URI
        });

        // 4. Launch a headless browser
        console.log("Launching Puppeteer...");
        browser = await puppeteer.launch({ // Assign to outer variable
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
                // Removed '--allow-file-access-from-files' as it's not needed with Base64
            ]
        });
        console.log("Browser launched.");
        const page = await browser.newPage();

        // Log browser console messages
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => {
            console.error('PAGE ERROR:', error.message);
        });
        page.on('requestfailed', request => {
            // Refined check for failure reason
            const failure = request.failure();
            const errorText = failure ? failure.errorText : '(No error text)';
            console.error(`REQUEST FAILED: ${request.url()} ${errorText}`);
        });

        // 5. Set the viewport
        await page.setViewport({ width: 1920, height: 1080 });
        console.log("Viewport set.");

        // 6. Set the page content
        console.log("Setting page content...");
        // waitUntil: 'load' might be sufficient now since image is embedded
        await page.setContent(finalHtml, { waitUntil: 'load', timeout: 30000 });
        console.log("Page content set.");

        // Add a small delay just in case rendering takes time
        await new Promise(resolve => setTimeout(resolve, 150)); // Slightly longer delay

        // 7. Take the screenshot
        console.log("Taking screenshot...");
        await page.screenshot({
            path: fullOutputPath, // --- MODIFIED ---
            type: 'png'
        });
        console.log("Screenshot taken.");

        // 8. Close the browser
        await browser.close();
        console.log("Browser closed.");

        console.log(`✅ Successfully created ${fullOutputPath}`); // --- MODIFIED ---

    } catch (error) {
        if (error.code === 'ENOENT' && error.path === absoluteBgPath) {
            console.error(`❌ CRITICAL ERROR: Background image not found at expected path: ${absoluteBgPath}`);
            console.error(`   Please ensure '${backgroundFileName}' exists in the same directory as renderer.js`);
        } else {
            console.error(`❌ Error generating image for ${outputFilename}:`, error);
        }
        if (typeof browser !== 'undefined' && browser.isConnected()) {
            await browser.close();
            console.log("Browser closed after error.");
        }
    }
}

// --- Test code ---
// Ensure 'test.html' and 'background-empty.png' are in the same directory as this script.

const sampleDataWithLogo = {
    kol_name: "Test Partner With Logo",
    kol_logo_url: "https://u.cubeupload.com/r0b1n/pfpkol1.jpg",
    language: "English",
    slogan_text: "WHERE NEW WEALTH IS MADE",
    text_direction: "ltr",
    official_partner_text: "Official WEEX Partner",
    has_logo: true
};
generateImage(sampleDataWithLogo, 'test_banner_with_logo.png');

const sampleDataWithoutLogo = {
    kol_name: "Test Partner NO LOGO",
    kol_logo_url: null,
    language: "Chinese",
    slogan_text: "财富自由之路",
    text_direction: "ltr",
    official_partner_text: "WEEX官方合作伙伴",
    has_logo: false
};
generateImage(sampleDataWithoutLogo, 'test_banner_no_logo.png');


module.exports = { generateImage };