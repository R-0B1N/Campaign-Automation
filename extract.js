const fs = require('fs');
let content = fs.readFileSync('figma_node.json', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
const data = JSON.parse(content);
const traverse = (node, path) => {
    if (node.name && node.name.includes('Sign Up Page-Position Voucher Package A') && node.type === 'FRAME') {
        console.log('Name:', node.name, 'ID:', node.id, 'Bounds:', node.absoluteBoundingBox);
    }
    if (node.children && Array.isArray(node.children)) node.children.forEach(c => traverse(c, path + '/' + node.name));
};
traverse(data, 'root');
