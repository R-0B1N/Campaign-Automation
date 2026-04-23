const path = require('path');
const config = require('./config.js');
const { generateImage } = require('./renderer.js');
const { uploadAttachment } = require('./lark-api.js');

async function processNamecard(data, saneKolName, tokens) {
    if (!config.toggles.GENERATE_NAMECARD || !data.should_generate_namecard) return;

    try {
        const filePath = await generateImage(
            data.posterData,
            path.join(`${data.ticket_id}-${saneKolName}`, `${saneKolName}_Namecard.png`),
            'Namecard Template.png',
            3200, 1800,
            { top: 0, left: 0, align: 'center', maxW: 100 },
            'namecard-template.html'
        );
        if (config.toggles.UPLOAD_TO_LARK) tokens.namecardToken = await uploadAttachment(filePath);
    } catch (err) {
        console.error(`❌ Failed Namecard for ${data.kol_name}:`, err.message);
    }
}

async function processPosters(data, eventType, saneKolName, tokens) {
    for (const formatName of ['SignUp', 'Twitter']) {
        if (formatName === 'SignUp' && !config.toggles.GENERATE_SIGNUP) continue;
        if (formatName === 'Twitter' && !config.toggles.GENERATE_TWITTER) continue;

        const globalConfig = config.formats[formatName];
        const eventConfig = config.backgrounds[eventType]?.[formatName];

        if (!eventConfig) continue;

        const isStringConfig = typeof eventConfig === 'string';
        const bgFileName = isStringConfig ? eventConfig : eventConfig.bg;
        const width = isStringConfig ? globalConfig.width : eventConfig.width;
        const height = isStringConfig ? globalConfig.height : eventConfig.height;
        const layout = isStringConfig ? globalConfig.layout : eventConfig.layout;
        const templateFile = isStringConfig ? 'poster-template.html' : (eventConfig.template || 'poster-template.html');

        const formatPosterData = { ...data.posterData };
        if (layout?.uppercase) formatPosterData.kol_name = String(formatPosterData.kol_name).toUpperCase();

        try {
            const filePath = await generateImage(
                formatPosterData,
                path.join(`${data.ticket_id}-${saneKolName}`, `${saneKolName}_${eventType.replace(/\s+/g, '')}_${formatName}.png`),
                bgFileName, width, height, layout, templateFile
            );
            if (config.toggles.UPLOAD_TO_LARK) {
                const token = await uploadAttachment(filePath);
                if (formatName === 'SignUp') tokens.signUpToken = token;
                if (formatName === 'Twitter') tokens.twitterToken = token;
            }
        } catch (err) {
            console.error(`❌ Failed ${formatName} poster for ${data.kol_name}:`, err.message);
        }
    }
}

async function processLpProfile(data, saneKolName, tokens) {
    if (!config.toggles.GENERATE_LP_PROFILE) return;

    try {
        if (data.posterData.has_logo) {
            const filePath = await generateImage(
                data.posterData,
                path.join(`${data.ticket_id}-${saneKolName}`, `${saneKolName}_LP_Profile.png`),
                'Landing Page KOL Profile Template.png',
                1040, 680,
                { top: 0, left: 0, align: 'center', maxW: 100 },
                'lp-profile-template.html'
            );
            if (config.toggles.UPLOAD_TO_LARK) tokens.lpProfileToken = await uploadAttachment(filePath);
        } else if (config.toggles.UPLOAD_TO_LARK) {
            tokens.lpProfileToken = await uploadAttachment(config.paths.defaultLpProfileKv);
        }
    } catch (err) {
        console.error(`❌ Failed LP Profile for ${data.kol_name}:`, err.message);
    }
}

module.exports = { processNamecard, processPosters, processLpProfile };