/*
 * FeaturePath: 自動報表產製-工具庫-資料庫-資料庫操作
 * Accountable: Hilbert Huang, Tang Chuang
 */
// ---------------------------------------- import * from node_modules ----------------------------------------
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { DB_TYPE } from './enums';

const DB_URL =
  'mongodb://lunaWorker:RrFuA9xX7@10.109.35.167:32018/?authSource=luna_web&authMechanism=SCRAM-SHA-1&connectTimeoutMS=4800000&socketTimeoutMS=4800000';
const DB_NAME = 'luna_web';

let _client: any = null;
let _database: any = null;

export class DefaultDBNative {
  static async tryConnect() {
    try {
      const dbUrl = DB_URL;
      const dbName = DB_NAME;
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
      const mongoClient = await MongoClient.connect(dbUrl, options);
      _database = mongoClient.db(dbName);
    } catch (err) {
      // err
    }
  }

  static async getDatabase() {
    if (!_database) {
      await this.tryConnect();
    }
    return _database;
  }

  /*
   * 和luna_web資料庫連線
   * @ return {any} _database資料庫物件
   */
  static async getLunaWebDB(type = DB_TYPE.UAT) {
    if (!_database) {
      try {
        let dbInfo;
        switch (type) {
          case DB_TYPE.PROD:
            dbInfo = this.getDBInfo('./tools/db.json', 'lunaProdDB');
            break;
          case DB_TYPE.UAT:
            dbInfo = this.getDBInfo('./tools/db.json', 'lunaWebDB');
            break;
          default:
            dbInfo = this.getDBInfo('./tools/db.json', 'lunaWebDB');
        }
        const options = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        _client = await MongoClient.connect(dbInfo.url, options);
        _database = _client.db(dbInfo.name);
      } catch (err) {
        // err
      }
    }
    return _database;
  }

  /*
   * 和SystemLog資料庫連線
   * @ return {any} _database 資料庫物件
   */
  static async getSystemLogDB() {
    if (!_database) {
      try {
        const dbInfo = this.getDBInfo('./tools/db.json', 'systemLogDB');
        const options = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        _client = await MongoClient.connect(dbInfo.url, options);
        _database = _client.db(dbInfo.name);
      } catch (err) {
        // err
      }
    }
    return _database;
  }

  /*
   * 到db.json中讀取指定database的資訊(url & name)
   * @param {string} file 檔案名稱
   * @param {string} db 資料庫名稱
   * @return {object} 指定資料庫的資訊
   */
  static getDBInfo(file: string, db: string) {
    const fin = fs.readFileSync(file, 'utf-8');
    const json = JSON.parse(fin);
    return json[db];
  }

  /*
   * 關閉目前的資料庫連線
   */
  static async closeDatabase() {
    _database = null;
    _client.close();
  }
}
