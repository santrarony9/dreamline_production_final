const fs = require('fs');
const path = require('path');

const dir = 'd:/RONY DREAMLNE/Final';
const files = [
    'index.html',
    'about.html',
    'luxury.html',
    'commercial.html',
    'journal.html',
    'booking.html',
    'journal-details.html',
    'wedding-details.html'
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove the hardcoded root block from the html 
        content = content.replace(/:root\s*\{[^}]*\}/gm, '');

        // Remove the inline body styling block  
        content = content.replace(/body\s*\{\s*background-color:[^}]*\}/gm, '');

        // Optional: Remove any leftover empty style tags if needed but safer to just let them be empty
        // Or specific target removal for exact body block

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned up hardcoded styles in ${file}`);
    }
});
