/*
 * Phase 3: The Lark API Connector
 * This script handles all communication with your Lark Bitable.
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
// --- End of Action ---

let tenantAccessToken = null;
let tokenExpiry = 0;

// 1. Get an access token
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
        console.error("❌ Failed to get Lark access token:", error.response?.data);
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
                filter: `CurrentValue.[${MATERIAL_COMPLETE_FIELD_NAME}]=""`
            }
        });

        const records = response.data.data.items || [];
        console.log(`Found ${records.length} records to process.`);
        return records;
    } catch (error) {
        console.error("❌ Failed to get records from Lark:", error.response?.data);
        return []; // Return empty array on failure
    }
}

// 3. Update a record to mark it as complete
async function updateRecordStatus(recordId) {
    const token = await getTenantAccessToken();
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_ID}/tables/${TABLE_ID}/records/${recordId}`;
    
    try {
        await axios.put(url, {
            fields: {
                [MATERIAL_COMPLETE_FIELD_NAME]: "是" // Mark as 'Yes'
                // You could also add the generated image URL here
            }
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`Updated Lark record ${recordId} to "Complete"`);
    } catch (error) {
        console.error(`❌ Failed to update record ${recordId}:`, error.response?.data);
    }
}

module.exports = { getPendingRecords, updateRecordStatus };
