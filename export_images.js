const fs = require('fs');
const https = require('https');

const token = 'figd_MBrL3PeRJyLhmXTyQe5FSLAgOq_Ika-hX5LQxiaA';
const fileKey = '6hxtYwUzWvWw98s6bywF1e';

const downloadNode = (id, destPath) => {
    return new Promise((resolve, reject) => {
        const url = 'https://api.figma.com/v1/images/' + fileKey + '?ids=' + id + '&format=png&scale=3';
        console.log('Requesting URL:', url);
        https.get(url, { headers: { 'X-Figma-Token': token } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', async () => {
                const json = JSON.parse(data);
                if (json.err) return reject(json.err);
                const imgUrl = json.images[id];
                const file = fs.createWriteStream(destPath);
                https.get(imgUrl, (response) => {
                    response.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                });
            });
        }).on('error', reject);
    });
};

(async () => {
    try {
        await downloadNode('2528:1453', 'image-template/backgrounds/Twitter-Position Voucher Package A 2 VIP.png');
        console.log('Downloaded VIP');
        await downloadNode('2528:1494', 'image-template/backgrounds/Twitter-Position Voucher Package A 2.png');
        console.log('Downloaded Standard');
    } catch (e) {
        console.error('Error:', e);
    }
})();
