const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

async function generateImage(templateData, outputFilename, bgFileName, width = 1920, height = 1080, layout = { top: 80, left: 0, align: 'center', maxW: 100 }, templateFileName = 'poster-template.html') {
    const templateFilePath = path.resolve(__dirname, 'html-template', templateFileName);
    const absoluteBgPath = path.resolve(__dirname, 'image-template', 'backgrounds', bgFileName);
    const yubitLogoPath = path.resolve(__dirname, 'image-template', 'yubit-logo.png');
    const crossLogoPath = path.resolve(__dirname, 'image-template', 'cross.png'); 
    const fullOutputPath = path.join(__dirname, 'banners', outputFilename);

    let browser;
    try {
        await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });

        // Load all file assets in parallel
        const [bgBuffer, yubitBuffer, crossBuffer, htmlTemplate] = await Promise.all([
            fs.readFile(absoluteBgPath),
            fs.readFile(yubitLogoPath),
            fs.readFile(crossLogoPath),
            fs.readFile(templateFilePath, 'utf-8')
        ]);

        const bgMime = bgFileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        const bgImageDataUri = `data:${bgMime};base64,${bgBuffer.toString('base64')}`;
        const yubitDataUri = `data:image/png;base64,${yubitBuffer.toString('base64')}`;
        const crossDataUri = `data:image/png;base64,${crossBuffer.toString('base64')}`;

        const template = handlebars.compile(htmlTemplate);
        const finalHtml = template({
            ...templateData,
            bg_image_data_uri: bgImageDataUri,
            yubit_logo_data_uri: yubitDataUri,   
            cross_logo_data_uri: crossDataUri,   
            header_top_margin: layout.top || 80,
            header_left_margin: layout.left || 0,
            header_align: layout.align || 'center',
            header_max_width: layout.maxW || 100,
            header_scale: layout.scale || 1.0,
            header_uppercase: layout.uppercase || false,
            header_base_font_size: layout.baseFontSize || 336, 
            header_min_font_size: layout.minFontSize || 192,
            vip_top: layout.vipTop || 0,
            vip_left: layout.vipLeft || 0,
            vip_font_size: layout.vipFontSize || 135
        });

        browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        await page.setViewport({ width, height });
        await page.setContent(finalHtml, { waitUntil: 'load' });
        await new Promise(resolve => setTimeout(resolve, 250)); // Render buffer

        await page.screenshot({ path: fullOutputPath, type: 'png' });
        await browser.close();

        return fullOutputPath;
    } catch (error) {
        if (browser) await browser.close();
        throw new Error(`Failed to generate ${outputFilename}: ${error.message}`);
    }
}

module.exports = { generateImage };