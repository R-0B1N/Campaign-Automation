/*
 * This is an *example* of Solution 2 (Advanced).
 * This file is NOT part of your current polling setup.
 *
 * To use this, you would need to:
 * 1. Install express: `npm install express`
 * 2. Run this script on a server: `node webhook-example.js`
 * 3. Expose this server to the internet (e.g., using ngrok or deploying it).
 * 4. Configure webhooks in your Lark app to point to your server's URL.
 */

const express = require('express');
// We reuse the functions from your existing files
const { updateRecordStatus } = require('./lark-api.js');
const { generateImage } = require('./renderer.js');

// --- UPDATED: Import the REAL processRecord function ---
const { processRecord } = require('./index2.js'); 
// --- End Update ---


const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
const PORT = 3000;

// This is the endpoint Lark will send POST requests to
app.post('/lark-webhook', (req, res) => {
    const { body } = req;

    // Handle Lark's URL verification challenge
    if (body.challenge) {
        console.log("Received Lark challenge, responding...");
        return res.json({ challenge: body.challenge });
    }

    // Check if it's a "record created" event
    // Note: Lark may send other events, so we check the type
    if (body.event && body.event.object && body.event.object.event_type === 'bitable.record.created_v1') {
        console.log('Record created event received:');
        
        // The record data is in body.event.object
        // We pass the whole event object to our processor
        const record = body.event.object; 
        
        // Process the record immediately
        // We run this "in the background" (don't use await)
        // to send a fast "200 OK" response to Lark.
        processNewRecord(record);
    } else if (body.event) {
        console.log(`Received an unhandled event type: ${body.event.object.event_type}`);
    } else {
        console.log("Received an unknown POST request:", body);
    }

    // Send an immediate "OK" response to Lark
    res.status(200).send('OK');
});

async function processNewRecord(record) {
    // `record` from the webhook already has `record_id` and `fields`
    // so `processRecord` (from index2.js) can handle it directly.
    const data = processRecord(record);

    if (data) {
        console.log(`Processing new record: ${data.record_id} (${data.kol_name})`);
        const hasLogo = data.kol_logo_url ? 'logo' : 'no-logo';
        const filename = `${data.kol_name.replace(/[^a-zA-Z0-9]/g, '_')}_${data.language}_${hasLogo}_banner.png`;
        
        try {
            // Generate the image
            await generateImage(data, filename);
            // Update the record in Lark
            await updateRecordStatus(data.record_id);
            console.log(`Successfully processed new record ${data.record_id}`);
        } catch (err) {
            console.error(`Failed to process new record ${data.record_id}:`, err);
        }
    } else {
        console.warn(`Data from record ${record.record_id} was invalid, skipping.`);
    }
}

app.listen(PORT, () => {
    console.log(`Webhook server listening on http://localhost:${PORT}`);
    console.log('Remember to expose this port to the internet for Lark to reach it.');
});

