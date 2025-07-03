import * as fs from 'fs';
import * as crypto from 'crypto';

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DB_ENCRYPT_KEY) {
  throw new Error('DB_ENCRYPT_KEY environment variable is not defined.');
}

const key = crypto.scryptSync(process.env.DB_ENCRYPT_KEY, 'salt', 32);
const iv = crypto.randomBytes(16);

const data = fs.readFileSync('db.json', 'utf-8');
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

let encrypted = cipher.update(data, 'utf-8', 'hex');
encrypted += cipher.final('hex');

const output = { iv: iv.toString('hex'), data: encrypted };
fs.writeFileSync('db.enc.json', JSON.stringify(output, null, 2));

console.log('✅ 加密完成：db.enc.json 已產生');
