const path = require('path');
const { generateImage } = require('./renderer.js');
const config = require('./config.js');

async function test10PctRender() {
    console.log("Generating full test renders for 10% Deposit posters (SignUp & Twitter, VIP & Non-VIP)...");

    const mockKOLData = {
        kol_name: "CRYPTO COACH LUIS",
        kol_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/300px-Portrait_Placeholder.png",          
        has_logo: true
    };

    const mockNoKOLData = {
        kol_name: "",
        kol_logo_url: "",
        has_logo: false
    };

    const campaigns = [
        "10% Deposit TradFi Bonus",
        "10% Deposit Futures Bonus",
        "250% Deposit Bonus"
    ];

    for (const campaign of campaigns) {
        const safeName = campaign.replace(/\s+/g, '');
        
        // 1. SignUp Non-VIP
        const signUpNonVipConf = config.backgrounds[campaign].SignUp;
        await generateImage(
            mockNoKOLData,
            path.join('test-renders', `SignUp_${safeName}_NonVIP.png`),
            signUpNonVipConf.bg,
            signUpNonVipConf.width,
            signUpNonVipConf.height,
            signUpNonVipConf.layout,
            signUpNonVipConf.template
        );
        console.log(`✅ Rendered SignUp_${safeName}_NonVIP.png (${signUpNonVipConf.width}x${signUpNonVipConf.height})`);

        // 2. SignUp VIP
        const signUpVipConf = config.backgrounds[`${campaign} (VIP)`].SignUp;
        const signUpVipData = {
            ...mockNoKOLData,
            use_vip_pill_box: true,
            vip_level: 4,
            vip_discount_percent: 50,
            vip_text: `INSTANT <span class="vip-gold">VIP 4</span> : 50% OFF FEES`,
            vip_top: signUpVipConf.layout.vipTop,
            vip_left: signUpVipConf.layout.vipLeft,
            vip_width: signUpVipConf.layout.vipWidth,
            vip_height: signUpVipConf.layout.vipHeight,
            vip_font_size: signUpVipConf.layout.vipFontSize,
            vip_diamond_width: signUpVipConf.layout.vipDiamondWidth
        };
        await generateImage(
            signUpVipData,
            path.join('test-renders', `SignUp_${safeName}_VIP.png`),
            signUpVipConf.bg,
            signUpVipConf.width,
            signUpVipConf.height,
            signUpVipConf.layout,
            signUpVipConf.template
        );
        console.log(`✅ Rendered SignUp_${safeName}_VIP.png (${signUpVipConf.width}x${signUpVipConf.height})`);

        // 3. Twitter Non-VIP with KOL
        const twitterNonVipConf = config.backgrounds[campaign].Twitter;
        const twitterNonVipData = {
            ...mockKOLData,
            use_yubit_x_kol: true,
            header_top: twitterNonVipConf.layout.headerTop,
            header_left: twitterNonVipConf.layout.headerLeft
        };
        await generateImage(
            twitterNonVipData,
            path.join('test-renders', `Twitter_${safeName}_NonVIP_WithKOL.png`),
            twitterNonVipConf.bg,
            twitterNonVipConf.width,
            twitterNonVipConf.height,
            twitterNonVipConf.layout,
            twitterNonVipConf.template
        );
        console.log(`✅ Rendered Twitter_${safeName}_NonVIP_WithKOL.png (${twitterNonVipConf.width}x${twitterNonVipConf.height})`);

        // 4. Twitter VIP with KOL
        const twitterVipConf = config.backgrounds[`${campaign} (VIP)`].Twitter;
        const twitterVipData = {
            ...mockKOLData,
            use_yubit_x_kol: true,
            use_vip_pill_box: true,
            vip_level: 4,
            vip_discount_percent: 50,
            vip_text: `INSTANT <span class="vip-gold">VIP 4</span> : 50% OFF FEES`,
            header_top: twitterVipConf.layout.headerTop,
            header_left: twitterVipConf.layout.headerLeft,
            vip_top: twitterVipConf.layout.vipTop,
            vip_left: twitterVipConf.layout.vipLeft,
            vip_width: twitterVipConf.layout.vipWidth,
            vip_height: twitterVipConf.layout.vipHeight,
            vip_font_size: twitterVipConf.layout.vipFontSize,
            vip_diamond_width: twitterVipConf.layout.vipDiamondWidth
        };
        await generateImage(
            twitterVipData,
            path.join('test-renders', `Twitter_${safeName}_VIP_WithKOL.png`),
            twitterVipConf.bg,
            twitterVipConf.width,
            twitterVipConf.height,
            twitterVipConf.layout,
            twitterVipConf.template
        );
        console.log(`✅ Rendered Twitter_${safeName}_VIP_WithKOL.png (${twitterVipConf.width}x${twitterVipConf.height})`);
    }

    console.log("\n🎉 All 10% Deposit test renders completed successfully!");
}

test10PctRender().catch(err => {
    console.error("❌ Test render failed:", err);
});
