const fs = require('fs');


const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');
const changedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/\/journal"/g, '/blogs"')
    .replace(/"\/journal"/g, '"/blogs"')
    .replace(/'\/journal'/g, "'/blogs'")
    .replace(/`\/journal`/g, '`/blogs`')
    .replace(/\/journal\//g, '/blogs/')
    .replace(/\/journal\?/g, '/blogs?');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles.push(file);
  }
});

console.log("Changed files:", changedFiles);
