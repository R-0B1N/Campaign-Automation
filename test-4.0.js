const path = require('path');
const { generateImage } = require('./renderer.js');
const config = require('./config.js');

async function testRender() {
    console.log("Starting test for Position Voucher Package A 4.0 posters...");

    const mockKOLData = {
        kol_name: "CHENTO",
        kol_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/300px-Portrait_Placeholder.png",          
        has_logo: true
    };

    const mockNoKOLData = {
        kol_name: "",
        kol_logo_url: "",
        has_logo: false
    };

    const campaigns = [
        "Position Voucher Package A 4.0"
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
        const outputFilename = `${test.name}.png`;
        const outputPath = path.join('test-renders', outputFilename); 

        const formatPosterData = { ...test.data };
        if (test.conf.layout && test.conf.layout.uppercase && formatPosterData.kol_name) {
            formatPosterData.kol_name = String(formatPosterData.kol_name).toUpperCase();
        }

        if (test.conf.layout?.useVipFeeBox) {
            formatPosterData.use_vip_pill_box = true;
            formatPosterData.vip_level = 4;
            formatPosterData.vip_discount_percent = 50;
            formatPosterData.vip_text = `INSTANT <span class="vip-gold">VIP ${formatPosterData.vip_level}</span> : ${formatPosterData.vip_discount_percent}% OFF FEES`;
        } else if (test.conf.layout?.useVipPillBox) {
            formatPosterData.use_vip_pill_box = true;
            formatPosterData.vip_level = 2;
            if (test.conf.layout?.plainVipText) {
                formatPosterData.vip_text = `INSTANT VIP 2 UPGRADE`;
            } else {
                formatPosterData.vip_text = `INSTANT <span class="vip-gold">VIP 2</span> UPGRADE`;
            }
        }

        formatPosterData.use_yubit_x_kol = !!test.conf.layout?.useYubitXKol;
        formatPosterData.hide_yubit_logo = !!test.conf.layout?.hideYubitLogo;
        formatPosterData.header_top = test.conf.layout?.headerTop || 28;
        formatPosterData.header_left = test.conf.layout?.headerLeft || 330;
        formatPosterData.vip_top = test.conf.layout?.vipTop || 346;
        formatPosterData.vip_left = test.conf.layout?.vipLeft || 29;
        formatPosterData.vip_width = test.conf.layout?.vipWidth || 543;

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
            console.log(`✅ Success for ${outputFilename}`);
        } catch (error) {
            console.error(`❌ Test failed for ${outputFilename}:`, error.message);
        }
    }
}

testRender();
