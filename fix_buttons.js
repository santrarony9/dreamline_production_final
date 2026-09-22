const fs = require('fs');

const walkSync = function(dir) {
  let filelist = [];
  fs.readdirSync(dir).forEach(file => {
    const p = dir + '/' + file;
    if (fs.statSync(p).isDirectory()) filelist = filelist.concat(walkSync(p));
    else if (p.endsWith('.js')) filelist.push(p);
  });
  return filelist;
};

const files = walkSync('./src/app/admin');
let changed = [];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let newC = c.replace(/\{saving \? "Deploying\.\.\." : "Sync.*?"\}/g, '{saving ? "Saving..." : "Save Changes"}');
  
  // Let's also check for specific hardcoded ones just in case
  newC = newC.replace(/"Sync Commercial Page"/g, '"Save Changes"');
  newC = newC.replace(/"Sync Home Page"/g, '"Save Changes"');
  newC = newC.replace(/"Sync About Page"/g, '"Save Changes"');
  
  if (c !== newC) {
    fs.writeFileSync(f, newC);
    changed.push(f);
  }
});
console.log('Changed files:', changed);
