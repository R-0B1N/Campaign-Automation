/*
 * Phase 4: The Main Script (Multi-language & No-Logo)
 * Connects Lark API to Image Renderer, selecting text based on language
 * and handling cases with or without a partner logo.
 */

const { getPendingRecords, updateRecordStatus } = require('./lark-api.js');
const { generateImage } = require('./renderer.js');

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
    'Polish': 'Oficjalny partner WEEX',
    'Russian': 'Официальный партнер WEEX',
    'Ukrainian': 'Офіційний партнер WEEX',
    'Arabic Language': 'شريك رسمي لـ WEEX', // Right-to-left
    'Portuguese': 'Parceiro Oficial da WEEX',
    'Vietnamese': 'Đối tác chính thức của WEEX',
    'Spanish (Latin Americe)': 'Socio oficial de WEEX'
     // Add others as needed
};
const defaultPartnerText = officialPartnerTexts['English'];


/**
 * Maps Lark column names to template keys, handles language and missing logos.
 * * ⚠️ ACTION REQUIRED: Verify ALL field names from your Lark sheet!
 */
function processRecord(record) {
    const fields = record.fields;

    // --- ⚠️ Verify field names! ---
    const kolName = fields['Name of KOL（Posters and materials used）'];
    const kolLogoUrlRaw = fields['Has Profile picture or not']; // Read the raw value
    const language = fields['Target language'];
    // --- End Verify ---

    // --- Basic validation ---
    if (!kolName) {
        console.warn(`Skipping record ${record.record_id}: Missing KOL Name.`);
        return null;
    }
     if (!language) {
        console.warn(`Skipping record ${record.record_id}: Missing Target language.`);
        return null; // Skip if no language is specified
    }

    // --- Determine Logo URL (Handle missing/invalid) ---
    let kolLogoUrl = null; // Default to null (triggers no-logo template)
    if (kolLogoUrlRaw && typeof kolLogoUrlRaw === 'string' && kolLogoUrlRaw.trim().startsWith('http')) {
        kolLogoUrl = kolLogoUrlRaw.trim(); // Use it only if it's a valid URL string
    } else {
        console.log(`Record ${record.record_id}: No valid logo URL found ('${kolLogoUrlRaw}'). Using no-logo template.`);
    }

    // --- Get Localized Texts ---
    const sloganInfo = slogans[language] || defaultSlogan;
    const partnerText = officialPartnerTexts[language] || defaultPartnerText;

    if (!slogans[language]) {
         console.warn(`Warning for record ${record.record_id}: Slogan language '${language}' not found. Using default.`);
    }
     if (!officialPartnerTexts[language]) {
         console.warn(`Warning for record ${record.record_id}: Partner text language '${language}' not found. Using default.`);
    }

    return {
        kol_name: kolName,
        kol_logo_url: kolLogoUrl, // Will be null if no valid URL was found
        language: language,
        slogan_text: sloganInfo.text,
        text_direction: sloganInfo.dir,
        official_partner_text: partnerText, // NEW
        record_id: record.record_id
    };
}


async function main() {
    console.log("Starting banner automation process...");
    
    const records = await getPendingRecords();
    
    if (records.length === 0) {
        console.log("No pending records found. All done!");
        return;
    }

    for (const record of records) {
        const data = processRecord(record);

        if (data) {
            const hasLogo = data.kol_logo_url ? 'logo' : 'no-logo'; // Add logo status to filename
            const filename = `${data.kol_name.replace(/[^a-zA-Z0-9]/g, '_')}_${data.language}_${hasLogo}_banner.png`;
            
            await generateImage(data, filename);
            
            await updateRecordStatus(data.record_id);
        }
    }
    
    console.log("Automation process complete.");
}

main();

