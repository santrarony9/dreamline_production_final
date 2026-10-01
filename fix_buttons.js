const fs = require('fs');
const path = require('path');
const walk = d => {
    let r = [];
    fs.readdirSync(d).forEach(f => {
        f = path.join(d, f);
        if (fs.statSync(f).isDirectory()) r = r.concat(walk(f));
        else if (f.endsWith('.js')) r.push(f);
    });
    return r;
};
walk('src/app/admin').forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    content = content.replace(/<button([^>]*?)>/g, (match, p1) => {
        if (!p1.includes('type=')) {
            changed = true;
            return `<button type="button"${p1}>`;
        }
        return match;
    });
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
