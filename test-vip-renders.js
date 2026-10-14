const path = require('path');
const assert = require('assert');
const config = require('./config.js');
const { generateImage } = require('./renderer.js');

async function runVipTests() {
    console.log("=== Testing VIP Fee Schedule & Rendering ===\n");

    const expectedTexts = {
        1: 'INSTANT <span class="vip-gold">VIP 1</span> : 0.035% Maker / 0.07% Taker',
        2: 'INSTANT <span class="vip-gold">VIP 2</span> : 25% OFF FEES',
        3: 'INSTANT <span class="vip-gold">VIP 3</span> : 0.025% Maker / 0.05% Taker',
        4: 'INSTANT <span class="vip-gold">VIP 4</span> : 50% OFF FEES',
        5: 'INSTANT <span class="vip-gold">VIP 5</span> : 0.015% Maker / 0.035% Taker',
        6: 'INSTANT <span class="vip-gold">VIP 6</span> : 75% OFF FEES',
        7: 'INSTANT <span class="vip-gold">VIP 7</span> : 0.008% Maker / 0.025% Taker',
        8: 'INSTANT <span class="vip-gold">VIP 8</span> : 0% Maker / 0.02% Taker',
    };

    // 1. Verify text generation for all levels
    for (let lvl = 1; lvl <= 8; lvl++) {
        const generated = config.getVipFeeText(lvl);
        assert.strictEqual(generated, expectedTexts[lvl], `Mismatch for VIP ${lvl}: got "${generated}"`);
        console.log(`✅ Text verified for VIP ${lvl}: ${generated.replace(/<[^>]+>/g, '')}`);
    }

    console.log("\n=== Testing Poster Image Generation for All 8 VIP Levels ===");

    const campaign = "Position Voucher Package A 4.0 (VIP)";
    const twitterConf = config.backgrounds[campaign].Twitter;
    const signUpConf = config.backgrounds[campaign].SignUp;

    for (let lvl = 1; lvl <= 8; lvl++) {
        const isCustomFee = config.vipFeeSchedule[lvl]?.isCustomFee;
        const testData = {
            kol_name: "CHENTO",
            has_logo: false,
            use_yubit_x_kol: true,
            use_vip_pill_box: true,
            vip_level: lvl,
            vip_text: config.getVipFeeText(lvl),
            vip_font_size: isCustomFee ? 23.5 : 30,
            header_top: twitterConf.layout.headerTop,
            header_left: twitterConf.layout.headerLeft,
            vip_top: twitterConf.layout.vipTop,
            vip_left: twitterConf.layout.vipLeft,
            vip_width: twitterConf.layout.vipWidth,
            vip_height: twitterConf.layout.vipHeight,
        };

        const outPath = path.join('test-renders', `Test_Twitter_VIP_${lvl}.png`);
        await generateImage(
            testData,
            outPath,
            twitterConf.bg,
            twitterConf.width,
            twitterConf.height,
            twitterConf.layout,
            twitterConf.template
        );
        console.log(`✅ Rendered VIP ${lvl} poster: ${outPath}`);
    }

    // Also test SignUp for VIP 1 and VIP 7 (the longest texts)
    for (const lvl of [1, 7]) {
        const isCustomFee = config.vipFeeSchedule[lvl]?.isCustomFee;
        const testData = {
            kol_name: "",
            has_logo: false,
            use_vip_pill_box: true,
            vip_level: lvl,
            vip_text: config.getVipFeeText(lvl),
            vip_font_size: isCustomFee ? 23.5 : 30,
            vip_top: signUpConf.layout.vipTop,
            vip_left: signUpConf.layout.vipLeft,
            vip_width: signUpConf.layout.vipWidth,
            vip_height: signUpConf.layout.vipHeight,
        };

        const outPath = path.join('test-renders', `Test_SignUp_VIP_${lvl}.png`);
        await generateImage(
            testData,
            outPath,
            signUpConf.bg,
            signUpConf.width,
            signUpConf.height,
            signUpConf.layout,
            signUpConf.template
        );
        console.log(`✅ Rendered SignUp VIP ${lvl} poster: ${outPath}`);
    }

    console.log("\n🎉 All VIP text formatting and image rendering tests completed successfully!");
}

runVipTests().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
