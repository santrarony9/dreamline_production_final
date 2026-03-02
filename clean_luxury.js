const fs = require("fs");

let content = fs.readFileSync("luxury.html", "utf8");

// Slice out the giant block from "<!-- VIEW: HOME -->" to "<!-- VIEW: LUXURY WEDDINGS -->"
let startIndex = content.indexOf("<!-- VIEW: HOME -->");
let endIndex = content.indexOf("<!-- VIEW: LUXURY WEDDINGS -->");
if (startIndex !== -1 && endIndex !== -1) {
    let replaced = content.substring(0, startIndex) + content.substring(endIndex);
    content = replaced;
}

// Remove the inner `#page-wedding` wrapper
content = content.replace(/<div id="page-wedding" class="page-view">/, '<div id="page-wedding">');

// Remove the `views-container` wrapper that was left orphaned
content = content.replace(/<div id="views-container" class="pt-24">\s*<\/div>/, "");

// Fix the contact links properly!
content = content.replace(/href="index\.html#footer" class="interactive">Contact<\/a>/g, 'href="contact.html" class="interactive">Contact</a>');
content = content.replace(/href="index\.html#footer" class="hover:text-white transition-colors interactive">CONTACT<\/a>/g, 'href="contact.html" class="hover:text-white transition-colors interactive">CONTACT</a>');

fs.writeFileSync("luxury.html", content, "utf8");
console.log("Cleaned luxury.html");
