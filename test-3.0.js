const path = require('path');
const { generateImage } = require('./renderer.js');
const config = require('./config.js');

async function testRender() {
    console.log("Starting test for Package A 3.0 posters...");

    const mockKOLData = {
        kol_name: "Tiko",
        kol_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/300px-Portrait_Placeholder.png",          
        has_logo: true
    };

    const mockNoKOLData = {
        kol_name: "",
        kol_logo_url: "",
        has_logo: false
    };

    const campaigns = [
        "Position Voucher Package A 3.0",
        "Futures Bonus A 3.0",
        "Position Voucher Package B 3.0",
        "10% Deposit Bonus"
    ];

    const tests = [];
    for (const campaign of campaigns) {
        const safeName = campaign.replace(/\s+/g, '');
        tests.push(
            {
                name: `SignUp_${safeName}_NonVIP`,
                conf: config.backgrounds[campaign].SignUp,
                data: mockNoKOLData
            },
            {
                name: `SignUp_${safeName}_VIP`,
                conf: config.backgrounds[`${campaign} (VIP)`].SignUp,
                data: mockNoKOLData
            },
            {
                name: `Twitter_${safeName}_NonVIP_WithKOL`,
                conf: config.backgrounds[campaign].Twitter,
                data: mockKOLData
            },
            {
                name: `Twitter_${safeName}_NonVIP_WithoutKOL`,
                conf: config.backgrounds[campaign].Twitter,
                data: mockNoKOLData
            },
            {
                name: `Twitter_${safeName}_VIP_WithKOL`,
                conf: config.backgrounds[`${campaign} (VIP)`].Twitter,
                data: mockKOLData
            },
            {
                name: `Twitter_${safeName}_VIP_WithoutKOL`,
                conf: config.backgrounds[`${campaign} (VIP)`].Twitter,
                data: mockNoKOLData
            }
        );
    }

    for (const test of tests) {
        // Output to a dedicated test folder inside 'banners'
        const outputFilename = `${test.name}.png`;
        const outputPath = path.join('test-renders', outputFilename); 

        const formatPosterData = { ...test.data };
        if (test.conf.layout && test.conf.layout.uppercase && formatPosterData.kol_name) {
            formatPosterData.kol_name = String(formatPosterData.kol_name).toUpperCase();
        }

        if (test.conf.layout?.useVipPillBox) {
            formatPosterData.use_vip_pill_box = true;
            formatPosterData.vip_level = 2;
            if (test.conf.layout?.plainVipText) {
                formatPosterData.vip_text = `INSTANT VIP 2 UPGRADE`;
            } else {
                formatPosterData.vip_text = `INSTANT <span class="vip-gold">VIP 2</span> UPGRADE`;
            }
        }

        if (test.conf.layout?.useVipCardText) {
            formatPosterData.use_vip_card_text = true;
            formatPosterData.vip_level = 4;
            formatPosterData.vip_discount_percent = 50;
            formatPosterData.vip_card_top = test.conf.layout?.vipCardTop || 616;
            formatPosterData.vip_card_left = test.conf.layout?.vipCardLeft || 783;
            formatPosterData.vip_card_width = test.conf.layout?.vipCardWidth || 268;
            formatPosterData.vip_card_height = test.conf.layout?.vipCardHeight || 98;
        }

        formatPosterData.use_yubit_x_kol = !!test.conf.layout?.useYubitXKol;
        formatPosterData.header_top = test.conf.layout?.headerTop || 42;
        formatPosterData.header_left = test.conf.layout?.headerLeft || 51;
        formatPosterData.vip_top = test.conf.layout?.vipTop || 403;
        formatPosterData.vip_left = test.conf.layout?.vipLeft || 46;

        try {
            console.log(`Generating ${outputFilename}...`);
            await generateImage(
                formatPosterData,
                outputPath,
                test.conf.bg,
                test.conf.width,
                test.conf.height,
                test.conf.layout,
                test.conf.template
            );
            console.log(`✅ Success!`);
        } catch (error) {
            console.error(`❌ Test failed for ${outputFilename}:`, error.message);
        }
    }
}

testRender();
