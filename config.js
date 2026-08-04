const path = require('path');

module.exports = {
    // --- MASTER TOGGLES ---
    toggles: {
        UPLOAD_TO_LARK: true,
        GENERATE_SIGNUP: true,
        GENERATE_TWITTER: true,
        GENERATE_NAMECARD: true,
        GENERATE_LP_PROFILE: true,
        PROCESS_TEST_RECORDS: false,
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
        // VIP_LEVEL: "VIP Level",
        // VIP_LEVEL_COPY: "VIP Level (Old)",
        VIP_LEVEL: "VIP Level (Old)",
        VIP_LEVEL_COPY: "VIP Level",
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
            Twitter: { bg: "Twitter-100% Deposit Bonus (Package A 2.0) Template.png", width: 4800, height: 2700, layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 50 }, template: "poster-template-nologo.html" },
        },
        "Package A 2.0 (VIP)": {
            SignUp: { bg: "Sign Up Page-100% Deposit Bonus (Package A 2.0) VIP Template.png", width: 3408, height: 4080, layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1035, vipLeft: 117, vipFontSize: 135 }, template: "poster-template-vip.html" },
            Twitter: { bg: "Twitter-100% Deposit Bonus (Package A 2.0) VIP Template.png", width: 4800, height: 2700, layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2235, vipLeft: 186, vipFontSize: 141, vipNoBox: true }, template: "poster-template-vip.html" },
        },
        "Package B 2.0": {
            Twitter: { bg: "Twitter-20% Deposit Bonus (Package B) Template.png", width: 4800, height: 2700, layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 50 }, template: "poster-template-nologo.html" },
        },
        "Package B 2.0 (VIP)": {
            SignUp: { bg: "Sign Up Page- Package B 2.0 VIP Template.png", width: 3408, height: 4080, layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1035, vipLeft: 117, vipFontSize: 135 }, template: "poster-template-vip.html" },
            Twitter: { bg: "Twitter-20% Deposit Bonus (Package B) VIP Template.png", width: 4800, height: 2700, layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2235, vipLeft: 186, vipFontSize: 141, vipNoBox: true }, template: "poster-template-vip.html" },
        },
        "Package C 2.0": {
            Twitter: { bg: "Twitter-50,000 Welcome Bonus.png", width: 4800, height: 2700, layout: { top: 240, left: 200, align: "flex-start", maxW: 300, scale: 0.9, uppercase: true, baseFontSize: 180, minFontSize: 150 } },
        },
        "Download App Bonus Package A": {
            SignUp: { 
                bg: "Sign Up Page-Download App Bonus Package A.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100 },
                template: "poster-template-nologo.html"
            },
            Twitter: { 
                bg: "Twitter-Download App Bonus Package A.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 50 },
                template: "poster-template-nologo.html" 
            },
        },
        "Download App Bonus Package A (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Download App Bonus Package A VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1065, vipLeft: 117, vipFontSize: 135 }, 
                template: "poster-template-vip.html" 
            },
            Twitter: { 
                bg: "Twitter-Download App Bonus Package A VIP.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2127, vipLeft: 186, vipFontSize: 141 },
                template: "poster-template-vip.html"
            },
        },
        "Download App Bonus Package B": {
            SignUp: { 
                bg: "Sign Up Page-Download App Bonus Package B.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100 },
                template: "poster-template-nologo.html"
            },
            Twitter: { 
                bg: "Twitter-Download App Bonus Package B.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 50 },
                template: "poster-template-nologo.html" 
            },
        },
        "Download App Bonus Package B (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Download App Bonus Package B VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1065, vipLeft: 117, vipFontSize: 135 }, 
                template: "poster-template-vip.html" 
            },
            Twitter: { 
                bg: "Twitter-Download App Bonus Package B VIP.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2127, vipLeft: 186, vipFontSize: 141 },
                template: "poster-template-vip.html" 
            },
        },
        "Download App Bonus Package C": {
            SignUp: { 
                bg: "Sign Up Page-Download App Bonus Package C.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100 },
                template: "poster-template-nologo.html"
            },
            Twitter: { 
                bg: "Twitter-Download App Bonus Package C.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 50 },
                template: "poster-template-nologo.html" 
            },
        },
        "Download App Bonus Package C (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Download App Bonus Package C VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1065, vipLeft: 117, vipFontSize: 135 }, 
                template: "poster-template-vip.html" 
            },
            Twitter: { 
                bg: "Twitter-Download App Bonus Package C VIP.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2127, vipLeft: 186, vipFontSize: 141 },
                template: "poster-template-vip.html" 
            },
        },
        // "Position Voucher Package A": {
        //     SignUp: { 
        //         bg: "Sign Up Page-Position Voucher Package A.png", 
        //         width: 3408, height: 4080, 
        //         layout: { top: -9999, left: 0, align: "center", maxW: 100 },
        //         template: "poster-template-nologo.html"
        //     },
        //     Twitter: { 
        //         bg: "Twitter-Position Voucher Package A.png", 
        //         width: 4800, height: 2700, 
        //         layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 50 },
        //         template: "poster-template-nologo.html" 
        //     },
        // },
        // "Position Voucher Package A (VIP)": {
        //     SignUp: { 
        //         bg: "Sign Up Page-Position Voucher Package A VIP.png", 
        //         width: 3408, height: 4080, 
        //         layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1065, vipLeft: 117, vipFontSize: 135 }, 
        //         template: "poster-template-vip.html" 
        //     },
        //     Twitter: { 
        //         bg: "Twitter-Position Voucher Package A VIP.png", 
        //         width: 4800, height: 2700, 
        //         layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2127, vipLeft: 186, vipFontSize: 141 },
        //         template: "poster-template-vip.html" 
        //     },
        // },
        "Position Voucher Package C": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher Package C.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100 },
                template: "poster-template-nologo.html"
            },
            Twitter: { 
                bg: "Twitter-Position Voucher Package C.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 50 },
                template: "poster-template-nologo.html" 
            },
        },
        "Position Voucher Package C (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher Package C VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1065, vipLeft: 117, vipFontSize: 135 }, 
                template: "poster-template-vip.html" 
            },
            Twitter: { 
                bg: "Twitter-Position Voucher Package C VIP.png", 
                width: 4800, height: 2700, 
                layout: { top: 192, left: 1437, align: "flex-start", maxW: 40, scale: 1.125, uppercase: true, baseFontSize: 115, minFontSize: 60, vipTop: 2127, vipLeft: 186, vipFontSize: 141 },
                template: "poster-template-vip.html" 
            },
        },
        "Position Voucher Package A": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher Package A.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100 },
                template: "poster-template-nologo.html"
            },
            Twitter: { 
                bg: "Twitter-Position Voucher Package A Template.png", 
                width: 1136, height: 1360, 
                layout: { top: 42, left: 394, align: "flex-start", maxW: 48, scale: 0.2986, uppercase: true, baseFontSize: 144, minFontSize: 40 },
                template: "poster-template-nologo.html" 
            },
        },
        "Position Voucher Package A (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher Package A VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1065, vipLeft: 117, vipFontSize: 135 }, 
                template: "poster-template-vip.html" 
            },
            Twitter: { 
                bg: "Twitter-Position Voucher Package A VIP Template.png", 
                width: 1136, height: 1360, 
                layout: { top: 42, left: 394, align: "flex-start", maxW: 48, scale: 0.2986, uppercase: true, baseFontSize: 144, minFontSize: 40, vipTop: 364, vipLeft: 42, vipFontSize: 40, vipNoBox: true, useSignUpVipText: true },
                template: "poster-template-vip.html" 
            },
        },
        "July Giveaway": {
            SignUp: { 
                bg: "Sign Up Page-July Giveaway.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100 },
                template: "poster-template-nologo.html"
            }
        },
        "July Giveaway (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-July Giveaway VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, vipTop: 1065, vipLeft: 117, vipFontSize: 135 }, 
                template: "poster-template-vip.html"
            }
        },
        "Position Voucher Package A 3.0": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher A 3.0.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, scale: 3 },
                template: "poster-template-v3.html"
            },
            Twitter: { 
                bg: "Twitter-Position Voucher A 3.0.png", 
                width: 3408, height: 4080, 
                layout: { useYubitXKol: true, scale: 3, headerTop: 48, headerLeft: 51 },
                template: "poster-template-v3.html" 
            }
        },
        "Position Voucher Package A 3.0 (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher A 3.0 VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, scale: 3, useVipPillBox: true, vipTop: 403, vipLeft: 46 }, 
                template: "poster-template-v3.html" 
            },
            Twitter: { 
                bg: "Twitter-Position Voucher A 3.0 VIP.png", 
                width: 3408, height: 4080, 
                layout: { useYubitXKol: true, scale: 3, headerTop: 48, headerLeft: 51, useVipPillBox: true, vipTop: 421, vipLeft: 51 },
                template: "poster-template-v3.html" 
            }
        },
        "Futures Bonus A 3.0": {
            SignUp: { 
                bg: "Sign Up Page-Futures Bonus A 3.0.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, scale: 3 },
                template: "poster-template-v3.html"
            },
            Twitter: { 
                bg: "Twitter-Futures Bonus A 3.0.png", 
                width: 3408, height: 4080, 
                layout: { useYubitXKol: true, scale: 3, headerTop: 48, headerLeft: 51 },
                template: "poster-template-v3.html" 
            }
        },
        "Futures Bonus A 3.0 (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Futures Bonus A 3.0 VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, scale: 3, useVipPillBox: true, vipTop: 403, vipLeft: 46 }, 
                template: "poster-template-v3.html" 
            },
            Twitter: { 
                bg: "Twitter-Futures Bonus A 3.0 VIP.png", 
                width: 3408, height: 4080, 
                layout: { useYubitXKol: true, scale: 3, headerTop: 48, headerLeft: 51, useVipPillBox: true, vipTop: 421, vipLeft: 51 },
                template: "poster-template-v3.html" 
            }
        },
        "Position Voucher Package B 3.0": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher B 3.0.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, scale: 3 },
                template: "poster-template-v3.html"
            },
            Twitter: { 
                bg: "Twitter-Position Voucher B 3.0.png", 
                width: 3408, height: 4080, 
                layout: { useYubitXKol: true, scale: 3, headerTop: 48 , headerLeft: 51 },
                template: "poster-template-v3.html" 
            }
        },
        "Position Voucher Package B 3.0 (VIP)": {
            SignUp: { 
                bg: "Sign Up Page-Position Voucher B 3.0 VIP.png", 
                width: 3408, height: 4080, 
                layout: { top: -9999, left: 0, align: "center", maxW: 100, scale: 3, useVipPillBox: true, vipTop: 403, vipLeft: 46 }, 
                template: "poster-template-v3.html" 
            },
            Twitter: { 
                bg: "Twitter-Position Voucher B 3.0 VIP.png", 
                width: 3408, height: 4080, 
                layout: { useYubitXKol: true, scale: 3, headerTop: 48, headerLeft: 51, useVipPillBox: true, vipTop: 421, vipLeft: 51 },
                template: "poster-template-v3.html" 
            }
        }
    }
};