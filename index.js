/*
 * index.js
 * Main automation script to process Lark records and generate banners.
 * Updated for the new 2-format (Sign Up & Twitter) dynamic layout structure.
 */

const {
    getPendingRecords,
    downloadAttachmentUrlAsBase64,
    uploadAttachment,
    batchUpdateRecord
} = require('./lark-api.js');

const { generateImage } = require('./renderer.js');
const path = require('path');
const fs = require('fs');
const DEFAULT_LP_PROFILE_KV = path.join(__dirname, 'image-template', 'backgrounds', '福利中心KV.png');


// --- MASTER TOGGLES ---
const UPLOAD_TO_LARK = true;
const GENERATE_SIGNUP = false;   // Set to false to skip Sign Up pages
const GENERATE_TWITTER = true;   // Set to false to skip Twitter posts
const GENERATE_NAMECARD = true;  // Set to false to override Lark and skip all Namecards
const GENERATE_LP_PROFILE = true;

// --- 1. FORMAT CONFIGURATION ---
// Define dimensions and top padding for the centered Flexbox header
// --- 1. FORMAT CONFIGURATION ---
const formats = {
    'SignUp': { 
        width: 3900, 
        height: 5364, 
        layout: { top: 100, left: 0, align: 'center', maxW: 100 } // Center aligned
    }, 
    'Twitter': { 
        width: 3366, 
        height: 4362, 
        layout: { top: 80, left: 0, align: 'center', maxW: 100 } // FIXED: Back to center aligned
    }   
};

// --- 2. CAMPAIGN BACKGROUND MAPPING ---
// Make sure these exact filenames exist in your "image-template/backgrounds" folder!
const backgrounds = {
  "20% Deposit Bonus": {
    SignUp: "Sign Up Page-20% Deposit.png",
    // 'Twitter': 'Twitter-20% Deposit.png',
    Twitter: {
      bg: "new 20% deposit.png",
      width: 2272,
      height: 2908,
      layout: { top: 50, left: 0, align: "center", scale: 1.05 },
    },
  },
  "Deposit and Trade": {
    SignUp: "Sign Up Page-Deposit and Trade.png",
    Twitter: "Twitter-Deposit and Trade.png",
  },
  "20,000 Welcome Bonus": {
    SignUp: {
      bg: "Sign Up Page-20,000 Welcome Bonus.png",
      width: 3540,
      height: 4104,
      layout: { top: 200, left: 0, align: "center", maxW: 100 },
    },
    Twitter: {
      bg: "Twitter-20,000 Welcome Bonus.png",
      width: 4800,
      height: 2700,
      layout: {
        top: 220,
        left: 180,
        align: "flex-start",
        maxW: 300,
        scale: 0.9,
        uppercase: true,
        baseFontSize: 200,
        minFontSize: 180,
      },
    },
  },
  "100% Deposit Bonus (Package A)": {
    Twitter: {
      bg: "Twitter-100% Deposit Bonus (Package A) Template.png",
      width: 4800,
      height: 2700,
      layout: {
        top: 230,
        left: 1450,
        align: "flex-start",
        maxW: 65,
        scale: 0.9,
        uppercase: true,
        baseFontSize: 150,
        minFontSize: 90,
      },
      template: "poster-template-nologo.html",
    },
  },
  "50% Deposit Bonus (Package C)": {
    Twitter: {
      bg: "Twitter-50% Deposit Bonus (Package C) Template.png",
      width: 4800,
      height: 2700,
      layout: {
        top: 230,
        left: 1450,
        align: "flex-start",
        maxW: 65,
        scale: 0.9,
        uppercase: true,
        baseFontSize: 150,
        minFontSize: 90,
      },
      template: "poster-template-nologo.html",
    },
  },
};

/**
 * Processes a single record from Lark to extract and prepare data.
 */
async function processRecord(record) {
    const fields = record.fields;

    const kolName = fields.kol_name;
    const kolLogoUrl = fields.kol_logo_url;
    const hasLogo = fields.has_logo;
    const ticketId = fields.ticket_id;
    const kolUid = fields.kol_uid;
    const activityRecord = fields.activity_record; 
    const recordId = fields.record_id;

    if (!kolName || !ticketId || !activityRecord) {
        console.warn(`Skipping record ${recordId}: Missing KOL Name, Ticket ID, or Event Type.`);
        return null;
    }

    let downloadedLogoDataUri = null;
    if (hasLogo && kolLogoUrl) {
        try {
            console.log(`Downloading image for record ${ticketId}...`);
            downloadedLogoDataUri = await downloadAttachmentUrlAsBase64(kolLogoUrl);
        } catch (error) {
            console.error(`Failed to download image for record ${ticketId}: ${error.message}`);
        }
    }

    return {
        ticket_id: ticketId,
        kol_uid: kolUid,
        kol_name: kolName,
        activity_record: activityRecord,
        record_id: recordId,
        posterData: {
            kol_name: kolName,
            kol_logo_url: downloadedLogoDataUri,
            has_logo: !!downloadedLogoDataUri
        },
        should_generate_namecard: (fields.should_generate_namecard === 'Yes'), 
    };
}

async function main() {
    console.log("Starting banner automation process...");

    let records;
    try {
        records = await getPendingRecords();
    } catch (error) {
        console.error("❌ CRITICAL: Failed to get records from Lark.", error.message);
        return;
    }

    if (!records || records.length === 0) {
        console.log("No pending records found. All done!");
        return;
    }

    for (const record of records) {
        const ticketId = record.fields.ticket_id || record.record_id;
        console.log(`\n--- Processing record ${ticketId} ---`);

        let data;
        try {
            data = await processRecord(record);
        } catch (error) {
            console.error(`❌ Failed to process record ${ticketId}:`, error.message);
            continue;
        }

        if (data) {
            const eventType = data.activity_record.trim();
            const saneKolName = String(data.kol_name).replace(/[\\?%*:|"<> \/]/g, '_');
            const folderPath = path.join(__dirname, 'banners', `${data.ticket_id}-${saneKolName}`);
            
            if (!backgrounds[eventType]) {
                console.warn(`⚠️ Warning: Unknown Event Type '${eventType}' for ${data.kol_name}. Skipping image generation.`);
                continue;
            }

            let tokens = {
                signUpToken: null,
                twitterToken: null,
                namecardToken: null,
                lpProfileToken: null // Initialize new token
            };

            let allUploadsSucceeded = true;

            // --- 3. GENERATE AND UPLOAD NAMECARD ---
            if (GENERATE_NAMECARD && data.should_generate_namecard) {
                console.log(`[Namecard] Requirement detected. Generating namecard for ${data.kol_name}...`);
                
                const namecardBgFile = 'YUBIT Namecard.png'; 
                const namecardFilename = `${saneKolName}_Namecard.png`;

                try {
                    const namecardFilePath = await generateImage(
                        data.posterData,
                        path.join(`${data.ticket_id}-${saneKolName}`, namecardFilename),
                        namecardBgFile,
                        4800,  
                        2700,  
                        { top: 0, left: 0, align: 'center', maxW: 100 }, 
                        'namecard-template.html' 
                    );

                    if (UPLOAD_TO_LARK) {
                        console.log(`Uploading Namecard...`);
                        tokens.namecardToken = await uploadAttachment(namecardFilePath);
                    }
                } catch (error) {
                    console.error(`❌ Failed on Namecard for ${data.kol_name}:`, error.message);
                    allUploadsSucceeded = false;
                }
            }

            // --- 3B. GENERATE AND UPLOAD BOTH POSTER FORMATS ---
            for (const formatName in formats) {
                if (formatName === 'SignUp' && !GENERATE_SIGNUP) continue;
                if (formatName === 'Twitter' && !GENERATE_TWITTER) continue;

                const globalConfig = formats[formatName];
                const eventConfig = backgrounds[eventType][formatName];

                // Safety check for missing formats
                if (!eventConfig) {
                    console.log(`[Skip] No ${formatName} layout configured for event: ${eventType}.`);
                    continue;
                }

                const outputFilename = `${saneKolName}_${eventType.replace(/\s+/g, '')}_${formatName}.png`;
                
                let bgFileName, width, height, layout, templateFile;

                // Dynamically route old format vs new format
                if (typeof eventConfig === 'string') {
                    bgFileName = eventConfig;
                    width = globalConfig.width;
                    height = globalConfig.height;
                    layout = globalConfig.layout; 
                    templateFile = 'poster-template.html';
                } else {
                    bgFileName = eventConfig.bg;
                    width = eventConfig.width;
                    height = eventConfig.height;
                    layout = eventConfig.layout;
                    templateFile = eventConfig.template || 'poster-template.html'; 
                }

                // Intercept and uppercase the KOL name if the layout flag is set
                const formatPosterData = { ...data.posterData };
                if (layout && layout.uppercase) {
                    formatPosterData.kol_name = String(formatPosterData.kol_name).toUpperCase();
                }

                try {
                    const generatedFilePath = await generateImage(
                        formatPosterData,
                        path.join(`${data.ticket_id}-${saneKolName}`, outputFilename),
                        bgFileName,
                        width,
                        height,
                        layout,
                        templateFile
                    );
                    
                    if (UPLOAD_TO_LARK) {
                        console.log(`Uploading ${formatName} poster...`);
                        const token = await uploadAttachment(generatedFilePath);
                        
                        if (formatName === 'SignUp') tokens.signUpToken = token;
                        if (formatName === 'Twitter') tokens.twitterToken = token;
                    }
                } catch (error) {
                    console.error(`❌ Failed on ${formatName} poster for ${data.kol_name}:`, error.message);
                    allUploadsSucceeded = false;
                }
            }

            // --- 3C. GENERATE AND UPLOAD LANDING PAGE PROFILE ---
            if (GENERATE_LP_PROFILE) {
                console.log(`[LP Profile] Handling for ${data.kol_name}...`);

                if (data.posterData.has_logo) {
                    console.log(`[LP Profile] Using provided KOL portrait. Generating custom image...`);
                    const lpProfileBgFile = 'Landing Page KOL Profile Template.png'; 
                    const lpProfileFilename = `${saneKolName}_LP_Profile.png`;

                    try {
                        const lpProfileFilePath = await generateImage(
                            data.posterData, 
                            path.join(`${data.ticket_id}-${saneKolName}`, lpProfileFilename),
                            lpProfileBgFile,
                            1040, 
                            680,  
                            { top: 0, left: 0, align: 'center', maxW: 100 }, 
                            'lp-profile-template.html' 
                        );

                        if (UPLOAD_TO_LARK) {
                            console.log(`Uploading Generated LP Profile...`);
                            tokens.lpProfileToken = await uploadAttachment(lpProfileFilePath);
                        }
                    } catch (error) {
                        console.error(`❌ Failed on LP Profile for ${data.kol_name}:`, error.message);
                        allUploadsSucceeded = false;
                    }
                } else {
                    console.log(`[LP Profile] No portrait found. Uploading raw default 福利中心KV...`);
                    
                    if (UPLOAD_TO_LARK) {
                        try {
                            // Uploads the raw file directly to Lark without passing it through puppeteer
                            tokens.lpProfileToken = await uploadAttachment(DEFAULT_LP_PROFILE_KV);
                        } catch (error) {
                            console.error(`❌ Failed to upload default KV for ${data.kol_name}:`, error.message);
                            allUploadsSucceeded = false;
                        }
                    }
                }
            }
        
            // --- 4. UPDATE LARK RECORD ---
            if (allUploadsSucceeded && UPLOAD_TO_LARK) {
                try {
                    console.log(`Batch updating Lark record ${data.record_id}...`);
                    // Call the updated lark-api function with 4 token arguments
                    await batchUpdateRecord(data.record_id, {
                        signUpToken: tokens.signUpToken,
                        twitterToken: tokens.twitterToken,
                        namecardToken: tokens.namecardToken,
                        lpProfileToken: tokens.lpProfileToken // Added new token
                    });
                    console.log(`✅ Successfully finalized record ${data.record_id}.`);
                } catch (updateError) {
                    console.error(`❌ Failed to update record ${data.record_id}:`, updateError.message);
                }
            } else if (!UPLOAD_TO_LARK) {
                console.log(`[UPLOAD DISABLED] Generation complete for ${data.kol_name}.`);
            } else {
                console.warn(`⚠️ Skipping Lark update for ${data.kol_name} due to upload failures.`);
            }
        }
    }

    console.log("\n🎉 Automation process complete.");
}

main().catch(error => {
    console.error("A critical error occurred in main:", error);
    process.exit(1);
});