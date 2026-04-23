const path = require('path');

module.exports = {
    // --- MASTER TOGGLES ---
    toggles: {
        UPLOAD_TO_LARK: true,
        GENERATE_SIGNUP: true,
        GENERATE_TWITTER: true,
        GENERATE_NAMECARD: true,
        GENERATE_LP_PROFILE: true,
    },

    // --- APP CREDENTIALS ---
    lark: {
        APP_ID: 'cli_a98b74a4eef81ed4',
        APP_SECRET: 'XiOKji6kAbDeDwAoD6oairC3gmILuapf',
        BASE_ID: 'XMv5bZSb3aTiZLs6QgFlu2mZg0e',
        TABLE_ID: 'tblB1ddhiwnxUXys',
    },

    // --- LARK SCHEMA HEADERS ---
    schema: {
        MATERIAL_COMPLETE: "Status",
        AUTO_NUMBER: "Event ID",
        ACTIVITY_RECORD: "Event Type",
        KOL_NAME: "KOL Profile",
        LANGUAGE: "Language",
        LOGO: "Profile Picture",
        KOL_UID: "KOL UID",
        VIP_CODE: "VIP Code",
        VIP_LEVEL: "VIP Level",
        VIP_LEVEL_COPY: "VIP Level Copy",
        FIRST_TIME_KOL: "Namecard",
        SIGN_UP_MATERIAL: "Sign Up Page 物料",
        TWITTER_MATERIAL: "Twitter 物料",
        NAMECARD_MATERIAL: "Name Card",
        LP_PROFILE_MATERIAL: "Landing Page Profile Picture",
    },

    // --- FILE PATHS ---
    paths: {
        defaultLpProfileKv: path.join(__dirname, 'image-template', 'backgrounds', '福利中心KV.png'),
    },

    // --- FORMAT CONFIGURATION ---
    formats: {
        'SignUp': {
            width: 3900, height: 5364,
            layout: { top: 100, left: 0, align: 'center', maxW: 100 }
        },
        'Twitter': {
            width: 3366, height: 4362,
            layout: { top: 80, left: 0, align: 'center', maxW: 100 }
        }
    },

    // --- CAMPAIGN BACKGROUND MAPPING ---
    backgrounds: {
        "20% Deposit Bonus": {
            SignUp: "Sign Up Page-20% Deposit.png",
            Twitter: { bg: "new 20% deposit.png", width: 2272, height: 2908, layout: { top: 50, left: 0, align: "center", maxW: 100, scale: 0.6, baseFontSize: 180, minFontSize: 150 } },
        },
        "Deposit and Trade": {
            SignUp: { bg: "Sign Up Page-Deposit and Trade.png", width: 2272, height: 2908, layout: { top: 50, left: 0, align: "center", maxW: 100, scale: 0.6, baseFontSize: 180, minFontSize: 150 } },
            Twitter: { bg: "Twitter-Deposit and Trade.png", width: 2272, height: 2908, layout: { top: 50, left: 0, align: "center", maxW: 100, scale: 0.6, baseFontSize: 180, minFontSize: 150 } },
        },
        "20,000 Welcome Bonus": {
            SignUp: { bg: "Sign Up Page-20,000 Welcome Bonus.png", width: 3540, height: 4104, layout: { top: 200, left: 0, align: "center", maxW: 100 } },
            Twitter: { bg: "Twitter-20,000 Welcome Bonus.png", width: 4800, height: 2700, layout: { top: 220, left: 180, align: "flex-start", maxW: 300, scale: 0.9, uppercase: true, baseFontSize: 200, minFontSize: 180 } },
        },
        "100% Deposit Bonus (Package A)": {
            Twitter: { bg: "Twitter-100% Deposit Bonus (Package A) Template.png", width: 4800, height: 2700, layout: { top: 230, left: 1450, align: "flex-start", maxW: 65, scale: 0.9, uppercase: true, baseFontSize: 150, minFontSize: 90 }, template: "poster-template-nologo.html" },
        },
        "50% Deposit Bonus (Package C)": {
            Twitter: { bg: "Twitter-50% Deposit Bonus (Package C) Template.png", width: 4800, height: 2700, layout: { top: 220, left: 1450, align: "flex-start", maxW: 65, scale: 0.9, uppercase: true, baseFontSize: 150, minFontSize: 90 }, template: "poster-template-nologo.html" },
        },
        "Package A 2.0": {
            Twitter: { bg: "Twitter-100% Deposit Bonus (Package A 2.0) Template.png", width: 4800, height: 2700, layout: { top: 171, left: 1437, align: "flex-start", maxW: 65, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60 }, template: "poster-template-nologo.html" },
        },
        "Package A 2.0 (VIP)": {
            SignUp: { bg: "Sign Up Page-100% Deposit Bonus (Package A 2.0) VIP Template.png", width: 3408, height: 4080, layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1035, vipLeft: 117, vipFontSize: 135 }, template: "poster-template-vip.html" },
            Twitter: { bg: "Twitter-100% Deposit Bonus (Package A 2.0) VIP Template.png", width: 4800, height: 2700, layout: { top: 192, left: 1437, align: "flex-start", maxW: 65, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2235, vipLeft: 186, vipFontSize: 141 }, template: "poster-template-vip.html" },
        },
        "Package B 2.0": {
            Twitter: { bg: "Twitter-20% Deposit Bonus (Package B) Template.png", width: 4800, height: 2700, layout: { top: 171, left: 1437, align: "flex-start", maxW: 65, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60 }, template: "poster-template-nologo.html" },
        },
        "Package B 2.0 (VIP)": {
            SignUp: { bg: "Sign Up Page- Package B 2.0 VIP Template.png", width: 3408, height: 4080, layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1035, vipLeft: 117, vipFontSize: 135 }, template: "poster-template-vip.html" },
            Twitter: { bg: "Twitter-20% Deposit Bonus (Package B) VIP Template.png", width: 4800, height: 2700, layout: { top: 192, left: 1437, align: "flex-start", maxW: 65, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2235, vipLeft: 186, vipFontSize: 141 }, template: "poster-template-vip.html" },
        },
    }
};