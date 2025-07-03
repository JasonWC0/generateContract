/*
 * FeaturePath: 自動報表產製-工具庫-資料庫-資料庫操作
 * Accountable: Tang Chuang, Jason Kao
 */

// ---------------------------------------- import * from node_modules ----------------------------------------
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { DB_TYPE } from './enums';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config(); // ⬅️ 載入 .env 中的金鑰

// ---------------------------------------- constant ----------------------------------------
const ERP_STAGING = 'compalswhq-175501';
const ERP_STAGING_DB_ID = '5665841866943586520';
const ZONE = 'asia-east1-b';
const REPLACE_IP_TARGET = '{}';

let _client: any = null;
let _database: any = null;

// ---------------------------------------- helper: 解密加密後的 db.enc.json ----------------------------------------
function getDecryptedDBJson(): any {
  const secret = process.env.DB_ENCRYPT_KEY;
  if (!secret) {
    throw new Error('❌ 缺少 DB_ENCRYPT_KEY（請檢查 .env）');
  }

  const key = crypto.scryptSync(secret, 'salt', 32);
  const encrypted = JSON.parse(fs.readFileSync('db.enc.json', 'utf-8'));
  const iv = Buffer.from(encrypted.iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(encrypted.data, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return JSON.parse(decrypted);
}

// ---------------------------------------- class: DefaultDBNative ----------------------------------------

export class DefaultDBNative {
  static async tryConnect() {
    try {
      const dbInfo = this.getDBInfo('db.enc.json', 'lunaWebDB');
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
      const mongoClient = await MongoClient.connect(dbInfo.url, options);
      _database = mongoClient.db(dbInfo.name);
    } catch (err) {
      console.error('❌ 無法連線至 MongoDB:', err);
    }
  }

  static async getDatabase() {
    if (!_database) {
      await this.tryConnect();
    }
    return _database;
  }

  /*
   * 和 luna_web 資料庫連線
   */
  static async getLunaWebDB(type = DB_TYPE.UAT) {
    if (!_database) {
      try {
        let dbInfo;
        let dbUrl;
        switch (type) {
          case DB_TYPE.PROD:
            dbInfo = this.getDBInfo('db.enc.json', 'lunaProdDB');
            break;
          case DB_TYPE.UAT:
            dbInfo = this.getDBInfo('db.enc.json', 'lunaWebDB');
            break;
          default:
            dbInfo = this.getDBInfo('db.enc.json', 'lunaWebDB');
        }

        const options = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        _client = await MongoClient.connect(dbInfo.url, options);
        _database = _client.db(dbInfo.name);
      } catch (err) {
        console.error('❌ 連線 LunaWebDB 失敗:', err);
      }
    }
    return _database;
  }

  /*
   * 連線 SystemLog 資料庫
   */
  static async getSystemLogDB() {
    if (!_database) {
      try {
        const dbInfo = this.getDBInfo('db.enc.json', 'systemLogDB');
        const options = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        _client = await MongoClient.connect(dbInfo.url, options);
        _database = _client.db(dbInfo.name);
      } catch (err) {
        console.error('❌ 連線 SystemLogDB 失敗:', err);
      }
    }
    return _database;
  }

  /*
   * 從 JSON（明文或加密）中讀取資料庫資訊
   */
  static getDBInfo(file: string, db: string) {
    let json;
    if (file.includes('.enc.')) {
      json = getDecryptedDBJson();
    } else {
      const fin = fs.readFileSync(file, 'utf-8');
      json = JSON.parse(fin);
    }

    if (!json[db]) {
      throw new Error(`❌ 找不到資料庫設定：${db}`);
    }
    return json[db];
  }

  static getCurrDb() {
    return _database;
  }

  static async closeDatabase() {
    _database = null;
    await _client?.close();
  }
}
