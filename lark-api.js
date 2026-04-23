const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const config = require('./config.js');

let tenantAccessToken = null;
let tokenExpiry = 0;

async function getTenantAccessToken() {
    if (tenantAccessToken && Date.now() < tokenExpiry - 300 * 1000) return tenantAccessToken;

    try {
        const response = await axios.post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
            app_id: config.lark.APP_ID,
            app_secret: config.lark.APP_SECRET
        });
        tenantAccessToken = response.data.tenant_access_token;
        tokenExpiry = Date.now() + (response.data.expire * 1000);
        return tenantAccessToken;
    } catch (error) {
        console.error("❌ Failed to get Lark access token:", error.response?.data || error.message);
        throw new Error("Lark auth failed.");
    }
}

function extractLarkText(fieldData) {
    if (!fieldData) return null;
    if (typeof fieldData === 'string') return fieldData;
    if (Array.isArray(fieldData)) return fieldData.map(item => item.text || '').join('');
    if (typeof fieldData === 'object') return fieldData.text || String(fieldData.value || '');
    return String(fieldData);
}

async function getPendingRecords() {
    const token = await getTenantAccessToken();
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${config.lark.BASE_ID}/tables/${config.lark.TABLE_ID}/records`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                filter: `CurrentValue.[${config.schema.MATERIAL_COMPLETE}]="Pending"`,
                sort: JSON.stringify([`${config.schema.AUTO_NUMBER} DESC`]),
                page_size: 50
            }
        });

        const records = response.data.data.items || [];
        
        records.forEach(record => {
            const fields = record.fields;
            let logoUrl = null;
            let hasLogo = false;
            const rawLogoData = fields[config.schema.LOGO];
            
            if (rawLogoData) {
                const flatArray = Array.isArray(rawLogoData) ? rawLogoData.flat(Infinity) : [rawLogoData];
                const attachment = flatArray.find(item => item && typeof item === 'object' && (item.url || item.tmp_url || item.attachmentToken || item.file_token));

                if (attachment) {
                    if (attachment.url || attachment.tmp_url) {
                        logoUrl = attachment.url || attachment.tmp_url;
                    } else {
                        const token = attachment.attachmentToken || attachment.file_token;
                        logoUrl = `https://open.larksuite.com/open-apis/drive/v1/medias/${token}/download`;
                        if (attachment.extra) logoUrl += `?extra=${encodeURIComponent(attachment.extra)}`;
                    }
                    hasLogo = true;
                }
            }

            fields.record_id = record.record_id;
            fields.ticket_id = extractLarkText(fields[config.schema.AUTO_NUMBER]);
            fields.kol_name = extractLarkText(fields[config.schema.KOL_NAME]); 
            fields.activity_record = extractLarkText(fields[config.schema.ACTIVITY_RECORD]);
            fields.vip_level = extractLarkText(fields[config.schema.VIP_LEVEL]);
            fields.vip_level_copy = extractLarkText(fields[config.schema.VIP_LEVEL_COPY]);
            fields.has_logo = hasLogo; 
            fields.kol_logo_url = logoUrl; 
            
            const namecardField = fields[config.schema.FIRST_TIME_KOL];
            fields.should_generate_namecard = namecardField && namecardField.text ? namecardField.text : namecardField;
        });

        return records; 
    } catch (error) {
        console.error("❌ Failed to get records from Lark:", error.response?.data || error.message);
        return [];
    }
}

async function downloadAttachmentUrlAsBase64(downloadUrl) {
    const token = await getTenantAccessToken();
    try {
        const response = await axios.get(downloadUrl, { 
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'arraybuffer' 
        });
        const contentType = response.headers['content-type'] || 'image/png';
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.error(`❌ Failed to download media:`, error.message);
        throw new Error(`Media download failed.`);
    }
}

async function uploadAttachment(filePath) {
    const token = await getTenantAccessToken();
    const url = 'https://open.larksuite.com/open-apis/drive/v1/medias/upload_all';
    const fileName = path.basename(filePath);

    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;

    const form = new FormData();
    form.append('file_name', fileName);
    form.append('parent_type', 'bitable_image');
    form.append('parent_node', config.lark.BASE_ID); 
    form.append('size', fileSize);
    form.append('file', fileStream);

    try {
        const response = await axios.post(url, form, {
            headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        return response.data.data.file_token;
    } catch (error) {
        console.error(`❌ Failed to upload file ${fileName}:`, error.message);
        throw new Error(`File upload failed for ${fileName}`);
    }
}

async function batchUpdateRecord(recordId, tokens) {
    const token = await getTenantAccessToken();
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${config.lark.BASE_ID}/tables/${config.lark.TABLE_ID}/records/${recordId}`;
    
    const fieldsPayload = {};
    if (tokens.signUpToken) fieldsPayload[config.schema.SIGN_UP_MATERIAL] = [{ file_token: tokens.signUpToken }];
    if (tokens.twitterToken) fieldsPayload[config.schema.TWITTER_MATERIAL] = [{ file_token: tokens.twitterToken }];
    if (tokens.namecardToken) fieldsPayload[config.schema.NAMECARD_MATERIAL] = [{ file_token: tokens.namecardToken }];
    if (tokens.lpProfileToken) fieldsPayload[config.schema.LP_PROFILE_MATERIAL] = [{ file_token: tokens.lpProfileToken }]; 
    
    if (Object.keys(fieldsPayload).length === 0) return;

    try {
        await axios.put(url, { fields: fieldsPayload }, { headers: { 'Authorization': `Bearer ${token}` } });
    } catch (error) {
        console.error(`❌ Failed to batch update record ${recordId}:`, error.message);
        throw error;
    }
}

module.exports = { getPendingRecords, downloadAttachmentUrlAsBase64, uploadAttachment, batchUpdateRecord };