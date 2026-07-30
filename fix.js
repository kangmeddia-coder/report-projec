const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes("export const runtime = 'edge'")) {
                const newContent = content.replace(/export const runtime = 'edge';?\r?\n?/g, '');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Fixed ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
