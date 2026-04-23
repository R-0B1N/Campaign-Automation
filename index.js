const { getPendingRecords, downloadAttachmentUrlAsBase64, batchUpdateRecord } = require('./lark-api.js');
const { processNamecard, processPosters, processLpProfile } = require('./generator.js');
const config = require('./config.js');

// --- NEW: Concurrency Control ---
// Adjust this number based on your computer's RAM. 
// 3 to 5 is usually the sweet spot for Puppeteer scripts.
const CONCURRENCY_LIMIT = 3; 

/**
 * Helper function to split an array into smaller batches
 */
function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}

async function parseRecordData(record) {
    const { fields } = record;
    if (!fields.kol_name || !fields.ticket_id || !fields.activity_record) return null;

    let downloadedLogoDataUri = null;
    if (fields.has_logo && fields.kol_logo_url) {
        try {
            downloadedLogoDataUri = await downloadAttachmentUrlAsBase64(fields.kol_logo_url);
        } catch (error) {
            console.error(`Failed to download image for ${fields.ticket_id}:`, error.message);
        }
    }

    const rawVip = String(fields.vip_level_copy || '');
    const parsedVipLevel = parseInt(rawVip.replace(/\D/g, ''), 10) || 0;
    const vipText = fields.vip_level 
        ? fields.vip_level_copy 
        : `<span class="vip-gold">✦</span> Instant <span class="vip-gold">VIP ${parsedVipLevel}</span> Upgrade`;

    return {
        ticket_id: fields.ticket_id,
        kol_name: fields.kol_name,
        activity_record: fields.activity_record,
        record_id: fields.record_id,
        vip_level: parsedVipLevel,
        should_generate_namecard: (fields.should_generate_namecard === 'Yes'),
        posterData: {
            kol_name: fields.kol_name,
            kol_logo_url: downloadedLogoDataUri,
            has_logo: !!downloadedLogoDataUri,
            vip_text: parsedVipLevel > 0 ? vipText : null
        }
    };
}

// --- NEW: Extracted the single-record processing logic into its own function ---
async function processSingleRecord(record) {
    const ticketId = record.fields.ticket_id || record.record_id;
    
    const data = await parseRecordData(record);
    if (!data) return;

    let eventType = data.activity_record.trim();
    if (data.vip_level > 0 && config.backgrounds[`${eventType} (VIP)`]) {
        eventType = `${eventType} (VIP)`;
    }

    if (!config.backgrounds[eventType]) {
        console.warn(`⚠️ Unknown Event Type '${eventType}' for ${ticketId}. Skipping.`);
        return;
    }

    const saneKolName = String(data.kol_name).replace(/[\\?%*:|"<> \/]/g, '_');
    const tokens = { signUpToken: null, twitterToken: null, namecardToken: null, lpProfileToken: null };

    // Process all image types sequentially for this specific record
    await processNamecard(data, saneKolName, tokens);
    await processPosters(data, eventType, saneKolName, tokens);
    await processLpProfile(data, saneKolName, tokens);

    if (config.toggles.UPLOAD_TO_LARK) {
        try {
            await batchUpdateRecord(data.record_id, tokens);
            console.log(`✅ Successfully finalized record ${data.record_id} (${data.kol_name}).`);
        } catch (err) {
            console.error(`❌ Failed to update record ${data.record_id} (${data.kol_name})`);
        }
    }
}

async function main() {
    console.log("Starting banner automation process...");
    const records = await getPendingRecords();
    if (!records.length) return console.log("No pending records found. All done!");

    // --- NEW: Batching Logic ---
    const batches = chunkArray(records, CONCURRENCY_LIMIT);
    console.log(`\nSplitting ${records.length} records into ${batches.length} batches of up to ${CONCURRENCY_LIMIT}...`);

    for (const [index, batch] of batches.entries()) {
        console.log(`\n=== 🚀 Starting Batch ${index + 1} of ${batches.length} ===`);
        
        // Promise.all runs everything inside the map() concurrently
        await Promise.all(batch.map(async (record) => {
            try {
                await processSingleRecord(record);
            } catch (error) {
                // Catch errors here so one failed record doesn't crash the whole batch
                console.error(`❌ Critical error processing record ${record.record_id}:`, error.message);
            }
        }));
        
        console.log(`=== 🏁 Finished Batch ${index + 1} ===`);
    }

    console.log("\n🎉 All batches complete. Automation finished.");
}

main().catch(error => {
    console.error("A critical error occurred in main:", error);
    process.exit(1);
});