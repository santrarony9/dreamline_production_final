const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');

function getAllFiles(dir, exts = ['.js', '.jsx', '.tsx']) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules' && entry.name !== '.next') {
                files = files.concat(getAllFiles(fullPath, exts));
            }
        } else if (exts.includes(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }
    return files;
}

const files = getAllFiles(SRC_DIR);
const imgRegex = /<(Image|img)\b([^>]*)\/?>/gs;

files.forEach(file => {
    const relPath = path.relative(path.resolve(__dirname, '..'), file);
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
        const tag = match[1];
        const props = match[2];
        const altMatch = props.match(/\balt=(?:\{([^}]+)\}|"([^"]*)"|'([^']*)')/);
        const srcMatch = props.match(/\bsrc=(?:\{([^}]+)\}|"([^"]+)"|'([^']+)')/);
        const alt = altMatch ? (altMatch[1] || altMatch[2] || altMatch[3]) : 'MISSING';
        const src = srcMatch ? (srcMatch[1] || srcMatch[2] || srcMatch[3]) : 'UNKNOWN';
        console.log(`${relPath} | <${tag}> | alt=${JSON.stringify(alt)} | src=${src.substring(0, 50)}`);
    }
});
