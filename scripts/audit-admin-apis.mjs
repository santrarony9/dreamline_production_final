import fs from 'fs';
import path from 'path';

function auditAdminPages() {
  const adminDir = 'src/app/admin';
  const subdirs = fs.readdirSync(adminDir);
  for (const sub of subdirs) {
    const full = path.join(adminDir, sub);
    let pageFile = null;
    if (fs.statSync(full).isDirectory()) {
      const p = path.join(full, 'page.js');
      if (fs.existsSync(p)) pageFile = p;
    } else if (sub === 'page.js') {
      pageFile = full;
    }
    if (pageFile) {
      const txt = fs.readFileSync(pageFile, 'utf8');
      const endpoints = new Set();
      const regex = /(?:axios\.(?:get|post|put|delete|patch)|\bfetch)\s*\(\s*[`'"]([^'"\s?$`]+)/g;
      let m;
      while ((m = regex.exec(txt)) !== null) {
        endpoints.add(m[1]);
      }
      console.log(`\n=== ${pageFile} ===`);
      for (const ep of endpoints) {
        console.log(`   ${ep}`);
      }
    }
  }
}

auditAdminPages();
