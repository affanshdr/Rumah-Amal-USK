// Script untuk generate bcrypt hash dari password admin
// Jalankan: node scripts/generate-hash.js <password_anda>
// Contoh: node scripts/generate-hash.js admin123

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.error('Usage: node scripts/generate-hash.js <password>');
    process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\n=== Salin ke .env.local ===');
console.log(`ADMIN_EMAIL=admin@contoh.com (ganti dengan email admin Anda)`);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('===========================\n');
