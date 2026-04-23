/*
 * lark-api.js
 * Handles all communication with the Lark Bitable using the NEW schema.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// --- APP CREDENTIALS ---
const APP_ID = 'cli_a98b74a4eef81ed4';
const APP_SECRET = 'XiOKji6kAbDeDwAoD6oairC3gmILuapf';
// e.g., https://.../wiki/QFTHwbVgYiDDwskmyaglfQBagrN?table=tblmdTnWpsi2MjYA&view=vewBwQpDQx
const BASE_ID = 'XMv5bZSb3aTiZLs6QgFlu2mZg0e'; // App Token
const TABLE_ID = 'tblB1ddhiwnxUXys';   
// const TABLE_ID = 'tblLc5BQ6rS4lgjZ';   

// --- NEW EXACT SCHEMA HEADERS ---
const MATERIAL_COMPLETE_FIELD_NAME = "Status"; // Filter field (records are picked if this is empty)
const AUTO_NUMBER_FIELD_NAME = "Event ID";
const ACTIVITY_RECORD_FIELD_NAME = "Event Type";
const KOL_NAME_FIELD_NAME = "KOL Profile";
const LANGUAGE_FIELD_NAME = "Language";
const LOGO_FIELD_NAME = "Profile Picture"; 
const KOL_UID_FIELD_NAME = "KOL UID";
const VIP_CODE_FIELD_NAME = "VIP Code"; 
const GENERATED_VIP_LINK_FIELD_NAME = "注册链接"; 
const VIP_LEVEL_FIELD_NAME = "VIP Level";
const VIP_LEVEL_COPY_FIELD_NAME = "VIP Level Copy";
const FIRST_TIME_KOL_FIELD_NAME = "Namecard"; // Assuming this is Yes/No for generating Namecards

// --- OUTPUT ATTACHMENT FIELDS ---
const SIGN_UP_MATERIAL_FIELD = "Sign Up Page 物料";
const TWITTER_MATERIAL_FIELD = "Twitter 物料";
const NAMECARD_MATERIAL_FIELD = "Name Card";

let tenantAccessToken = null;
let tokenExpiry = 0;

// 1. Get an access token
async function getTenantAccessToken() {
    if (tenantAccessToken && Date.now() < tokenExpiry - 300 * 1000) {
        return tenantAccessToken;
    }
    
    console.log("Requesting new Lark access token...");
    try {
        const response = await axios.post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
            app_id: APP_ID,
            app_secret: APP_SECRET
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
    if (typeof fieldData === 'string') return fieldData; // Already a string
    if (Array.isArray(fieldData)) {
        // Combine all text segments (Rich Text)
        return fieldData.map(item => item.text || '').join('');
    }
    if (typeof fieldData === 'object') {
        // Handle formula or lookup single objects
        return fieldData.text || String(fieldData.value || '');
    }
    return String(fieldData);
}

// 2. Get records from the table
async function getPendingRecords() {
    const token = await getTenantAccessToken();
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_ID}/tables/${TABLE_ID}/records`;

    try {
        console.log("Fetching pending records from Lark...");
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                filter: `CurrentValue.[${MATERIAL_COMPLETE_FIELD_NAME}]="Pending"`, // Adjusted filter for "Pending" or empty
                sort: JSON.stringify([`${AUTO_NUMBER_FIELD_NAME} DESC`]),
                page_size: 50
            }
        });

        const records = response.data.data.items || [];
        
        records.forEach(record => {
            const fields = record.fields;
            
            // --- Logo Extraction (Handles Standard & Lookup Attachments) ---
            let logoUrl = null;
            let hasLogo = false;
            const rawLogoData = fields[LOGO_FIELD_NAME];
            
            if (rawLogoData) {
                // Flatten any nested arrays from lookups
                const flatArray = Array.isArray(rawLogoData) ? rawLogoData.flat(Infinity) : [rawLogoData];
                
                // Find an object that has either a URL, a tmp_url, or an attachmentToken
                const attachment = flatArray.find(item => item && typeof item === 'object' && (item.url || item.tmp_url || item.attachmentToken || item.file_token));

                if (attachment) {
                    if (attachment.url || attachment.tmp_url) {
                        // Standard Attachment Field
                        logoUrl = attachment.url || attachment.tmp_url;
                    } else {
                        // Lookup Attachment Field
                        const token = attachment.attachmentToken || attachment.file_token;
                        
                        // FIX: Put the token IN THE PATH, not as a query parameter
                        logoUrl = `https://open.larksuite.com/open-apis/drive/v1/medias/${token}/download`;
                        
                        // Append the 'extra' permissions payload as the first query parameter
                        if (attachment.extra) {
                            logoUrl += `?extra=${encodeURIComponent(attachment.extra)}`;
                        }
                    }
                    
                    hasLogo = true;
                    // console.log(`✅ Found logo token/URL for record ${record.record_id}. URL: ${logoUrl}`);
                } else {
                    console.warn(`⚠️ No valid image token found for ${record.record_id}.`);
                }
            }

            // --- Safely Extract Mapped Fields ---
            fields.record_id = record.record_id;
            fields.ticket_id = extractLarkText(fields[AUTO_NUMBER_FIELD_NAME]);
            fields.kol_name = extractLarkText(fields[KOL_NAME_FIELD_NAME]); 
            fields.activity_record = extractLarkText(fields[ACTIVITY_RECORD_FIELD_NAME]);
            fields.language = extractLarkText(fields[LANGUAGE_FIELD_NAME]);
            fields.vip_code = extractLarkText(fields[VIP_CODE_FIELD_NAME]);
            
            fields.has_logo = hasLogo; 
            fields.kol_logo_url = logoUrl; 
            fields.kol_uid = fields[KOL_UID_FIELD_NAME];
            const namecardField = fields[FIRST_TIME_KOL_FIELD_NAME];
            fields.should_generate_namecard = namecardField && namecardField.text ? namecardField.text : namecardField;
            fields.vip_level = extractLarkText(fields[VIP_LEVEL_FIELD_NAME]);
            fields.vip_level_copy = extractLarkText(fields[VIP_LEVEL_COPY_FIELD_NAME]);
        });

        console.log(`Found ${records.length} records to process.`);
        return records; 

    } catch (error) {
        console.error("❌ Failed to get records from Lark:", error.response?.data || error.message);
        return [];
    }
}

// 3. Download Attachment
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
        let errorMsg = error.message;
        if (error.response) {
            try {
                const errorData = JSON.parse(error.response.data.toString('utf8'));
                errorMsg = `(Code: ${errorData.code}, Msg: ${errorData.msg})`;
            } catch (e) {
                errorMsg = error.response.data.toString('utf8') || error.message;
            }
        }
        console.error(`❌ Failed to download media from URL ${downloadUrl}:`, errorMsg);
        throw new Error(`Media download failed.`);
    }
}

// 4. Upload Attachment
async function uploadAttachment(filePath) {
    const token = await getTenantAccessToken();
    const url = 'https://open.larksuite.com/open-apis/drive/v1/medias/upload_all';
    const fileName = path.basename(filePath);

    try {
        await fs.promises.access(filePath, fs.constants.R_OK);
    } catch (err) {
        throw new Error(`File not found or unreadable: ${fileName}`);
    }

    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;

    const form = new FormData();
    form.append('file_name', fileName);
    form.append('parent_type', 'bitable_image');
    form.append('parent_node', BASE_ID); 
    form.append('size', fileSize);
    form.append('file', fileStream);

    try {
        console.log(`Uploading file ${fileName} to Lark...`);
        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        return response.data.data.file_token;
    } catch (error) {
        console.error(`❌ Failed to upload file ${fileName}:`, error.response?.data || error.message);
        throw new Error(`File upload failed for ${fileName}`);
    }
}

// 5. Batch Update Record (Routes files to specific columns)
/**
 * Updates a record in Lark with the generated attachment tokens.
 * @param {string} recordId - The Lark record ID.
 * @param {object} tokens - Object containing file tokens for different formats.
 */
async function batchUpdateRecord(recordId, { signUpToken, twitterToken, namecardToken, lpProfileToken }) { // Updated parameter list
    const token = await getTenantAccessToken();
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_ID}/tables/${TABLE_ID}/records/${recordId}`;
    
    const fieldsPayload = {};

    try {
        if (signUpToken) fieldsPayload[SIGN_UP_MATERIAL_FIELD] = [{ file_token: signUpToken }];
        if (twitterToken) fieldsPayload[TWITTER_MATERIAL_FIELD] = [{ file_token: twitterToken }];
        if (namecardToken) fieldsPayload[NAMECARD_MATERIAL_FIELD] = [{ file_token: namecardToken }];
        if (lpProfileToken) fieldsPayload['Landing Page Profile Picture'] = [{ file_token: lpProfileToken }]; // Added new mapping
        

        if (Object.keys(fieldsPayload).length === 0) {
            console.log(`No fields to update for record ${recordId}.`);
            return;
        }

        await axios.put(url, { fields: fieldsPayload }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`Successfully batch updated record ${recordId}.`);

    } catch (error) {
        console.error(`❌ Failed to batch update record ${recordId}:`, error.response?.data || error.message);
        throw error;
    }
}
    // const fields = {};

    // // Map tokens to their respective Lark field names (case-sensitive)
    // if (signUpToken) fields['Sign Up Page'] = [{ file_token: signUpToken }];
    // if (twitterToken) fields['Twitter Poster'] = [{ file_token: twitterToken }];
    // if (namecardToken) fields['KOL Name Card'] = [{ file_token: namecardToken }];
    

    // if (Object.keys(fields).length === 0) {
    //     console.warn(`[SkipUpdate] No new tokens generated for record ${recordId}.`);
    //     return null;
    // }

    // try {
    //     const response = await axios.post(`${larkBaseApiUrl}/records/${recordId}`, {
    //         fields: fields
    //     }, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         }
    //     });

    //     if (response.data.code === 0) {
    //         return response.data.data;
    //     } else {
    //         throw new Error(`Lark update error: ${response.data.msg}`);
    //     }
    // } catch (error) {
    //     console.error(`Error batch updating record ${recordId}:`, error.message);
    //     if (error.response && error.response.data) {
    //         console.error("Lark Response Detail:", JSON.stringify(error.response.data, null, 2));
    //     }
    //     throw error;
    // }
// }

module.exports = {
    getPendingRecords,
    downloadAttachmentUrlAsBase64,
    uploadAttachment,
    batchUpdateRecord
};