/*
* index.js
* Main automation script to process Lark records and generate banners.
* Uses lark-api.js to interact with Lark and renderer.js to generate images.
*/

const { 
    getPendingRecords, 
    // updateRecordStatus, 
    downloadAttachmentUrlAsBase64 // <-- Import the new function
} = require('./lark-api.js');
const { generateImage } = require('./renderer.js');
const path = require('path'); // <-- NEW: Import path module

// --- Language Slogan Mapping ---
const slogans = {
    'English': { text: 'WHERE NEW WEALTH IS MADE', dir: 'ltr' },
    'Chinese': { text: '财富自由之路', dir: 'ltr' }, // Simplified Chinese
    'Chinese—TW': { text: '財富自由之路', dir: 'ltr' }, // Or whatever the Lark value is
    'Korean': { text: '부의 미래가 시작되는 곳', dir: 'ltr' },
    'Japanese': { text: '新たな豊かさが生み出される場所', dir: 'ltr' },
    'Persian': { text: 'راهی برای دستیابی به آزادی مالی', dir: 'rtl' }, // FA_IR
    'Turkish': { text: 'SERMAYENİN SERVETE DÖNÜŞTÜĞÜ YER', dir: 'ltr' }, // TR
    'Deutsch': { text: 'WO NEUES VERMÖGEN ENTSTEHT', dir: 'ltr' }, // DE
    'French': { text: 'OÙ LA NOUVELLE RICHESSE SE CRÉE', dir: 'ltr' }, // FR
    'Italian': { text: 'DOVE SI CREA NUOVA RICCHEZZA', dir: 'ltr' }, // IT
    'Spanish (Spain)': { text: 'DÓNDE SE CREA LA NUEVA RIQUEZA', dir: 'ltr' }, // ES_ES
    'Polish': { text: 'Nowy wymiar budowania majątku', dir: 'ltr' }, // PL
    'Russian': { text: 'Здесь создается новый капитал', dir: 'ltr' }, // RU
    'Ukrainian': { text: 'ДЕ СТВОРЮЄТЬСЯ НОВЕ БАГАТСТВО', dir: 'ltr' }, // UK
    'Arabic Language': { text: 'بوابتك إلى ثروة جديدة', dir: 'rtl' }, // AR
    'Portuguese': { text: 'ONDE A NOVA RIQUEZA É CRIADA', dir: 'ltr' }, // PT_BR
    'Vietnamese': { text: 'NƠI BẮT ĐẦU HÀNH TRÌNH THỊNH VƯỢNG', dir: 'ltr' }, // VI
    'Spanish (Latin America)': { text: 'DONDE SE GENERA LA NUEVA RIQUEZA', dir: 'ltr' } // ES_419
    // Add other languages as needed
};
const defaultSlogan = slogans['English'];

// --- NEW: Official Partner Text Mapping ---
const officialPartnerTexts = {
    'English': 'Official WEEX Partner',
    'Chinese': 'WEEX官方合作伙伴', // Simplified
    'Chinese—TW': 'WEEX官方合作夥伴',
    'Korean': '공식 WEEX 파트너',
    'Japanese': 'WEEX公式パートナー',
    'Persian': 'شریک رسمی WEEX', // Right-to-left
    'Turkish': 'Resmî WEEX Ortağı',
    'Deutsch': 'Offizieller WEEX-Partner',
    'French': 'Partenaire officiel de WEEX',
    'Italian': 'Partner ufficiale WEEX',
    'Spanish (Spain)': 'Socio oficial de WEEX',
    'Polish': 'Ofiy partner WEEX',
    'Russian': 'Официальный партнер WEEX',
    'Portuguese': "Parceiro Oficial da WEEX",
    'Vietnamese': "Đối tác chính thức của WEEX",
    'Spanish (Latin Americe)': 'Socio oficial de WEEX'
     // Add others as needed
};
const defaultPartnerText = officialPartnerTexts['English'];


/**
 * Maps Lark column names to template keys, handles language and missing logos.
 * * ⚠️ ACTION REQUIRED: Verify ALL field names from your Lark sheet!
 *
 * *** UPDATED: This function is now async ***
 */
async function processRecord(record) {
    const fields = record.fields;

    // --- ⚠️ Verify field names! ---
    const kolName = fields['Name of KOL（Posters and materials used）'];
    const kolLogoAttachmentArray = fields['Has Profile picture or not']; // This is an ARRAY
    const language = fields['Target language'];
    const ticketId = fields['自动编号']; // <-- NEW: For folder path
    const kolUid = fields['UID of KOL']; // <-- NEW: For folder path
    const activityRecord = fields['活动记录']; // <-- NEW: For folder path
    // --- End Verify ---

    // --- Basic validation ---
    if (!kolName || !ticketId || !kolUid || !activityRecord) {
        console.warn(`Skipping record ${ticketId}: Missing required fields (KOL Name, Ticket ID, UID, or Activity Record).`);
        return null;
    }
     if (!language) {
        console.warn(`Skipping record ${ticketId}: Missing Target language.`);
        return null; // Skip if no language is specified
    }

    // --- *** UPDATED: Determine Logo URL (Handle missing/invalid) *** ---
    let kolLogoUrl = null; // Default to null (triggers no-logo template)
    
    if (Array.isArray(kolLogoAttachmentArray) && kolLogoAttachmentArray.length > 0) {
        const firstAttachment = kolLogoAttachmentArray[0];
        
        // We need the FULL URL, which contains the 'extra' param for bitable attachments
        if (firstAttachment && firstAttachment.url) {
            try {
                console.log(`Downloading image for record ${ticketId} (url: ${firstAttachment.url})...`);
                // Call our new function with the full URL
                kolLogoUrl = await downloadAttachmentUrlAsBase64(firstAttachment.url); // <--- USE NEW FUNCTION
                console.log(`Successfully downloaded image for record ${ticketId}.`);
            } catch (error) {
                // Log the error but continue, will just use the no-logo template
                console.error(`Failed to download image for record ${ticketId}: ${error.message}`);
                kolLogoUrl = null; // Ensure it's null on failure
            }
        } else {
            console.log(`Record ${ticketId}: Attachment found, but it has no 'url' property.`, firstAttachment);
        }
    } else {
        // This will catch records where the attachment cell is empty
        console.log(`Record ${ticketId}: No attachment found in 'Has Profile picture or not'. Using no-logo template.`);
    }
    // --- *** END NEW LOGIC ---


    // --- Get Localized Texts ---
    const sloganInfo = slogans[language] || defaultSlogan;
    const partnerText = officialPartnerTexts[language] || defaultPartnerText;

    if (!slogans[language]) {
         console.warn(`Warning for record ${ticketId}: Slogan language '${language}' not found. Using default.`);
    }
     if (!officialPartnerTexts[language]) {
         console.warn(`Warning for record ${ticketId}: Partner text language '${language}' not found. Using default.`);
    }

    return {
        kol_name: kolName,
        kol_logo_url: kolLogoUrl, // Will be the Base64 Data URI or null
        language: language,
        slogan_text: sloganInfo.text,
        text_direction: sloganInfo.dir,
        official_partner_text: partnerText, // NEW
        record_id: ticketId,
        ticket_id: ticketId, // <-- NEW: Pass to main
        kol_uid: kolUid, // <-- NEW: Pass to main
        activity_record: activityRecord // <-- NEW: Pass to main
    };
}


async function main() {
    console.log("Starting banner automation process...");
    
    const records = await getPendingRecords();
    
    if (records.length === 0) {
        console.log("No pending records found. All done!");
        return;
    }

    // Process records one by one (sequentially)
    // This is safer for API rate limits and easier to log
    for (const record of records) {
        console.log(`--- Processing record ${ticketId} ---`);
        
        // *** ADDED await here ***
        const data = await processRecord(record);

        if (data) {
            // --- UPDATED File Path Logic ---
            const hasLogo = data.kol_logo_url ? 'logo' : 'no-logo';

            // Simple function to sanitize strings for file/folder names
            const sanitize = (str) => {
                if (typeof str !== 'string' && typeof str !== 'number') {
                    return '_unknown_';
                }
                // Replace problematic characters with an underscore
                return String(str).replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_+/g, '_');
            }
            
            // Sanitize all parts
            const ticketId = sanitize(data.ticket_id);
            const kolUid = sanitize(data.kol_uid);
            const kolName = sanitize(data.kol_name);
            const activityRecord = sanitize(data.activity_record);
            const language = sanitize(data.language);

            // Create the folder path structure: [TicketID]-[UID]-[KOLName]-[ActivityRecord]
            const folderPath = `${ticketId}-${kolUid}-${kolName}-${activityRecord}`;
            
            // Create the final file name
            const fileName = `${kolName}_${language}_${hasLogo}_namecard.png`;
            
            // Combine them for the renderer. 
            // renderer.js automatically joins this with the 'banners' directory.
            const relativeOutputPath = path.join(folderPath, fileName);
            
            console.log(`Generating banner at: /banners/${relativeOutputPath}`);
            
            await generateImage(data, relativeOutputPath); //
            
            // await updateRecordStatus(data.record_id);
        }
        console.log(`--- Finished record ${ticketId} ---`);
    }
    
    console.log("Automation process complete.");
}

main().catch(error => {
    console.error("A critical error occurred in main:", error);
    process.exit(1);
});