/*
 * Phase 3: The Lark API Connector
 * This script handles all communication with your Lark Bitable.
 *
 * UPDATED: Added downloadAttachmentUrlAsBase64 to use the
 * full URL, which is required for bitable attachments.
 */

const axios = require('axios');

// Paste your credentials here
const APP_ID = 'cli_a8708aee15785ed2';
const APP_SECRET = 'dNm7EgKUDQKKytiiAJ8a8bfMcT11Fixp';

// 2. Get from your Lark Sheet URL:
// https://.../wiki/QFTHwbVgYiDDwskmyaglfQBagrN?table=tblmdTnWpsi2MjYA&view=vewBwQpDQx
const BASE_ID = 'XGiubfaVNaJdzdsUzGilHpAvgUe'; // App Token
const TABLE_ID = 'tblmdTnWpsi2MjYA';  

// 3. Find the exact "internal name" of your "Material Complete?" column.
// In Lark, go to the column, click "..." -> "Edit Field" -> "Field Name"
// It's probably '物料是否完成' but it's safer to check.
const MATERIAL_COMPLETE_FIELD_NAME = "物料是否完成"; 
// --- Add this line ---
const AUTO_NUMBER_FIELD_NAME = "自动编号"; // The field to sort by (Auto-Number)
// --- End of Action ---

let tenantAccessToken = null;
let tokenExpiry = 0;

// 1. Get an access token (and export it for other modules)
async function getTenantAccessToken() {
    // Check if token is valid (with a 5-min buffer)
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
        tokenExpiry = Date.now() + (response.data.expire * 1000); // 'expire' is in seconds
        
        console.log("Successfully got new token.");
        return tenantAccessToken;
    } catch (error) {
        console.error("❌ Failed to get Lark access token:", error.response?.data || error.message);
        throw new Error("Lark auth failed. Check your APP_ID and APP_SECRET.");
    }
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
                // This filter is important!
                // It only gets records where the "Material Complete" field is '否' (No).
                // Adjust '否' if your sheet uses 'No' or is blank.
                filter: `CurrentValue.[${MATERIAL_COMPLETE_FIELD_NAME}]=""`,
                
                // --- ADDED SORT PARAMETER ---
                // This will sort by the "自动编号" field in descending order (latest first)
                // The value needs to be a JSON string of an array.
                sort: JSON.stringify([`${AUTO_NUMBER_FIELD_NAME} DESC`])
                // --- END OF ADDITION ---
            }
        });

        const records = response.data.data.items || [];
        console.log(`Found ${records.length} records to process.`);
        return records;
    } catch (error) {
        console.error("❌ Failed to get records from Lark:", error.response?.data || error.message);
        return []; // Return empty array on failure
    }
}

// // 3. Update a record to mark it as complete
// async function updateRecordStatus(recordId) {
//     const token = await getTenantAccessToken();
//     const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_ID}/tables/${TABLE_ID}/records/${recordId}`;
    
//     try {
//         await axios.put(url, {
//             fields: {
//                 [MATERIAL_COMPLETE_FIELD_NAME]: "是" // Mark as 'Yes'
//                 // You could also add the generated image URL here if you had a text field
//             }
//         }, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         console.log(`Updated Lark record ${recordId} to "Complete"`);
//     } catch (error) {
//         console.error(`❌ Failed to update record ${recordId}:`, error.response?.data || error.message);
//     }
// }

// 4. *** This function is no longer used but kept for reference ***
// Download an attachment using its file_token and return as a Base64 Data URI
async function getAttachmentAsBase64(fileToken) {
    const token = await getTenantAccessToken();
    // This is the "Download Media" endpoint from the docs
    const url = `https://open.larksuite.com/open-apis/drive/v1/medias/${fileToken}/download`;
    
    console.log(`Attempting to download file_token: ${fileToken}`);

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'arraybuffer' // Get the raw image data
        });

        // Get the content type (e.g., 'image/png') from the response
        const contentType = response.headers['content-type'] || 'image/png';
        
        // Convert the raw binary data to a Base64 string
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        
        // Return the complete Data URI
        return `data:${contentType};base64,${base64}`;

    } catch (error) {
        console.error(`❌ Failed to download media for file_token ${fileToken}:`, error.response?.data || error.message);
        throw new Error(`Media download failed for ${fileToken}`);
    }
}

// 5. *** NEW FUNCTION ***
// Download an attachment using its FULL URL (which includes the 'extra' param)
async function downloadAttachmentUrlAsBase64(downloadUrl) {
    const token = await getTenantAccessToken();
    
    console.log(`Attempting to download from URL: ${downloadUrl}`);

    try {
        const response = await axios.get(downloadUrl, { // Use the provided URL directly
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'arraybuffer' // Get the raw image data
        });

        // Get the content type (e.g., 'image/png') from the response
        const contentType = response.headers['content-type'] || 'image/png';
        
        // Convert the raw binary data to a Base64 string
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        
        // Return the complete Data URI
        return `data:${contentType};base64,${base64}`;

    } catch (error) {
        // Log the error response if available
        let errorMsg = error.message;
        if (error.response) {
            // Try to parse the buffer data as string if it's an error response
            try {
                // The error data from Lark is often a JSON string in a buffer
                const errorData = JSON.parse(error.response.data.toString('utf8'));
                errorMsg = `(Code: ${errorData.code}, Msg: ${errorData.msg})`;
            } catch (e) {
                // Fallback if it's not JSON
                errorMsg = error.response.data.toString('utf8') || error.message;
            }
        }
        console.error(`❌ Failed to download media from URL ${downloadUrl}:`, errorMsg);
        throw new Error(`Media download failed for ${downloadUrl}`);
    }
}


module.exports = { 
    getPendingRecords, 
    // updateRecordStatus,
    getAttachmentAsBase64,
    downloadAttachmentUrlAsBase64 // Export the new function
};