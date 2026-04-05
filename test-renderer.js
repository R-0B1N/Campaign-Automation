const path = require('path');
const { generateImage } = require('./renderer.js'); // 👈 FIXED: Added ./

async function testRender() {
    console.log("Starting local render test...");

    // 1. Mock Data
    const mockPosterData = {
        kol_name: "Tiko", 
        // 👈 FIXED: Using a public placeholder image so the test browser can actually load it
        kol_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/300px-Portrait_Placeholder.png",          
        has_logo: true
    };

    // 2. Configuration for Package A
    // 👈 FIXED: Removed folder paths because renderer.js handles them automatically
    const bgFileName = 'Twitter-100% Deposit Bonus (Package A) Template.png'; 
    const templateFile = 'poster-template-nologo.html';
    const width = 4800;
    const height = 2700;
    
    // 👈 FIXED: Added the font size controls we just made
    const layout = { 
        top: 210, 
        left: 1450, 
        align: 'flex-start', 
        maxW: 65, 
        scale: 0.9,
        uppercase: true,
        baseFontSize: 4.5, 
        minFontSize: 3.0   
    };

    // 3. Apply the uppercase interceptor
    const formatPosterData = { ...mockPosterData };
    if (layout && layout.uppercase) {
        formatPosterData.kol_name = String(formatPosterData.kol_name).toUpperCase();
    }

    // Output to a dedicated test folder inside 'banners'
    const outputFilename = `TEST_PackageA_Alignment.png`;
    const outputPath = path.join('test-renders', outputFilename); 

    try {
        console.log(`Generating test image...`);
        const generatedFilePath = await generateImage(
            formatPosterData,
            outputPath,
            bgFileName,
            width,
            height,
            layout,
            templateFile
        );
        console.log(`✅ Success! Check your 'banners/test-renders' folder for the output.`);
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

testRender();