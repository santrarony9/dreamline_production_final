const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}
const files = walk('src/app/admin');
let changed = 0;
files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    // Match the class string even if it spans multiple lines
    const regex = /className=\{\`bg-\\[#c5a059\\] text-black px-12[^]*?\`\}|className="bg-\\[#c5a059\\] text-black px-12[^]*?"/g;
    
    if (regex.test(code)) {
        const newCode = code.replace(regex, 'className="bg-transparent text-[#c5a059] border border-[#c5a059]/30 hover:bg-[#c5a059]/10 px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"');
        if (code !== newCode) {
            fs.writeFileSync(f, newCode);
            console.log('Fixed:', f);
            changed++;
        }
    }
});
console.log('Total fixed:', changed);
