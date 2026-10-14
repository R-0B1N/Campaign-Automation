const { getPendingRecords, downloadAttachmentUrlAsBase64, batchUpdateRecord, getVipOptionMapping } = require('./lark-api.js');
const { processNamecard, processPosters, processLpProfile } = require('./generator.js');
const config = require('./config.js');

// --- NEW: Concurrency Control ---
// Adjust this number based on your computer's RAM. 
// 3 to 5 is usually the sweet spot for Puppeteer scripts.
const CONCURRENCY_LIMIT = 5;

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

function resolveVipLevel(fields, vipMap) {
    const parseField = (val) => {
        if (!val) return 0;
        let str = String(val).trim();
        if (vipMap && vipMap[str]) {
            str = `VIP ${vipMap[str].replace(/\D/g, '')}`;
        }
        return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };

    const newTier = parseField(fields.vip_level);
    const oldTier = parseField(fields.vip_level_old || fields.vip_level_copy);
    const identifier = fields.ticket_id || fields.kol_name || fields.record_id || 'Unknown';

    if (newTier > 0) {
        if (oldTier > 0 && oldTier !== newTier) {
            console.warn(`⚠️ [${identifier}] VIP conflict: New VIP (${newTier}) vs Old VIP (${oldTier}). Prioritizing New VIP.`);
        }
        return newTier;
    }

    if (oldTier > 0) {
        console.log(`ℹ️ [${identifier}] Dynamically resolved VIP Level ${oldTier} from 'VIP Level (Old)'.`);
        return oldTier;
    }

    return 0;
}

async function parseRecordData(record, vipMap) {
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

    const parsedVipLevel = resolveVipLevel(fields, vipMap);
    
    // Calculate the exact percentage OFF based on the Futures Taker fee table (Base 0.04%)
    const discountMap = { 1: 12.5, 2: 25, 3: 37.5, 4: 50, 5: 62.5, 6: 75, 7: 80, 8: 100 };
    const discountPercent = discountMap[parsedVipLevel] || 0;

    
  // Generate specific text formats
    const signUpVipText = parsedVipLevel > 0 
        ? `<span class="vip-gold">✦</span>&nbsp;Instant&nbsp;<span class="vip-gold">VIP ${parsedVipLevel}</span>&nbsp;Upgrade`
        : null;
        
    const twitterVipText = parsedVipLevel > 0
        ? config.getVipFeeText(parsedVipLevel, discountPercent)
        : null;

    return {
        ticket_id: fields.ticket_id,
        kol_name: fields.kol_name,
        activity_record: fields.activity_record,
        event_type: fields.event_type || null,
        record_id: fields.record_id,
        vip_level: parsedVipLevel,
        should_generate_namecard: (fields.should_generate_namecard === 'Yes'),
        posterData: {
            kol_name: fields.kol_name,
            kol_logo_url: downloadedLogoDataUri,
            has_logo: !!downloadedLogoDataUri,
            signUpVipText: signUpVipText,
            twitterVipText: twitterVipText,
            vip_text: signUpVipText, // Default fallback
            vip_level: parsedVipLevel,
            vip_discount_percent: discountPercent
        }
    };
}

// --- Single-record processing logic ---
async function processSingleRecord(record, vipMap) {
    const ticketId = record.fields.ticket_id || record.record_id;

    const data = await parseRecordData(record, vipMap);
    if (!data) return;

    const isVip = data.vip_level > 0;
    const resolvedEventType = config.resolveEventConfig(data.activity_record, data.event_type, isVip);

    if (!resolvedEventType || !config.backgrounds[resolvedEventType]) {
        console.warn(`⚠️ Unknown Event Name '${data.activity_record}' / Event Type '${data.event_type || 'N/A'}' for ${ticketId}. Posters will be skipped.`);
    }

    const saneKolName = String(data.kol_name).replace(/[\r\n]/g, '').replace(/[\\?%*:|"<> \/]/g, '_');
    const tokens = { signUpToken: null, twitterToken: null, namecardToken: null, lpProfileToken: null };

    // Process all image types sequentially for this specific record
    await processNamecard(data, saneKolName, tokens);
    if (resolvedEventType && config.backgrounds[resolvedEventType]) {
        await processPosters(data, resolvedEventType, saneKolName, tokens);
    }
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
    
    console.log("Fetching VIP mappings from Lark...");
    const vipMap = await getVipOptionMapping();
    
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
                await processSingleRecord(record, vipMap);
            } catch (error) {
                // Catch errors here so one failed record doesn't crash the whole batch
                console.error(`❌ Critical error processing record ${record.record_id}:`, error.message);
            }
        }));

        console.log(`=== 🏁 Finished Batch ${index + 1} ===`);
    }

    console.log("\n🎉 All batches complete. Automation finished.");
}

if (require.main === module) {
    main().catch(error => {
        console.error("A critical error occurred in main:", error);
        process.exit(1);
    });
}

module.exports = {
    resolveVipLevel,
    parseRecordData,
    processSingleRecord
};