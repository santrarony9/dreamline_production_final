const { Client } = require('ssh2');

const host = '160.187.68.243';
const user = 'root';
const password = '&hT0C10k!9tp';
const command = process.argv[2] || 'uname -a';

const conn = new Client();
conn.on('ready', () => {
  conn.exec(command, (err, stream) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    stream.on('close', (code, signal) => {
      conn.end();
      process.exit(code);
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
    console.error('Connection error: ', err);
    process.exit(1);
}).connect({
  host: host,
  port: 22,
  username: user,
  password: password,
  readyTimeout: 20000
});
