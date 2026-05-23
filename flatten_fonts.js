const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components'];

const replacements = [
    { regex: /font-black/g, replacement: 'font-semibold' },
    { regex: /text-\[10px\]/g, replacement: 'text-xs' },
    { regex: /text-\[9px\]/g, replacement: 'text-xs' },
    { regex: /text-\[11px\]/g, replacement: 'text-xs' },
    { regex: /text-\[15px\]/g, replacement: 'text-sm' },
    { regex: /text-gray-900/g, replacement: 'text-gray-800' },
    { regex: /text-slate-900/g, replacement: 'text-slate-800' },
];

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const { regex, replacement } of replacements) {
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated fonts in: ${fullPath}`);
            }
        }
    }
}

targetDirs.forEach(dir => processDirectory(path.join(__dirname, dir)));
console.log('Font flattening completed.');
