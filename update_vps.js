const { Client } = require('ssh2');
const conn = new Client();
const commands = `
cat << 'EOF' > /var/www/dreamlineproduction/.env.local
MONGODB_URI=mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET=p8I0u8u8u8u8u8u8u8u8u8u8u8u8u8u8
NEXTAUTH_URL=http://localhost:3002
ADMIN_USER=info.dreamline@gmail.com
ADMIN_PASS=Dreamline2026
LOCAL_STORAGE=true
PORT=3002
EOF
cd /var/www/dreamlineproduction
pm2 restart all
`;
conn.on('ready', () => {
    conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => conn.end())
              .on('data', d => process.stdout.write(d))
              .stderr.on('data', d => process.stderr.write(d));
    });
}).connect({ host: '160.187.68.243', port: 22, username: 'root', password: '&hT0C10k!9tp' });
