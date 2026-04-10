import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const mongodbUri = process.env.MONGODB_URI || 'mongodb+srv://drashti:drashti8704@drashti.mqxehb5.mongodb.net/khushi_crochet?retryWrites=true&w=majority';

let envContent = `MONGODB_URI="${mongodbUri}"\n`;

if (fs.existsSync(envPath)) {
  const existing = fs.readFileSync(envPath, 'utf8');
  // Append if MONGODB_URI not present
  if (!existing.includes('MONGODB_URI')) {
    envContent = existing.trim() + '\n' + envContent;
  }
}

fs.writeFileSync(envPath, envContent);
console.log('✅ .env.local updated with MONGODB_URI');
console.log('URI:', mongodbUri);

