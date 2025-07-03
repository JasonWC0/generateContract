/**
 * FeaturePath: 自動報表產製-工具庫-資料庫-常數
 * Accountable: Hilbert Huang, Tang Chuang
 */
// ---------------------------------------- import * from enums ----------------------------------------
import { DB_TYPE } from './enums';

export const ERP_API_KEY = '108a4b67-120b-42c0-9668-82ea83f7e7d2'; // ERP API KEY

export const FIRST_ELEMENT = 0; // 第一個元素
export const EMPTY_ARRAY_LENGTH = 0; // 空陣列長度
export const EMPTY_STRING = ''; // 空字串
export const ZERO = 0; // 零
export const OFFSET_ONE = 1; // 偏移量(1)

export const baseDate = new Date('1970-01-04T00:00:00.000+08:00'); // Shift中dateFromWeek 日期(週)計算起始日
// 超額 EXCEL 報表，超額工作表名稱
export const EXCESS_SHEET = '超額';
// excel 無效日期
export const INVALID_DATE = 'Invalid Date';
// excel 空白格
export const EMPTY_CELL = '';

// 選擇查詢機構類型
export const COMPANY_TYPE = {
  // 僅居服
  CASE: ['case'],
  // 僅日照
  DAYCASE: ['daycase'],
  // 居服+日照
  ALL: ['case', 'daycase']
};

// 處理優先級
export enum PRIORITY_LEVEL {
  // 不處理: 0
  NO_PROCESS = 0,
  // 第一優先級: 1
  FIRST_PRIORITY = 1,
  // 第二優先級: 2
  SECOND_PRIORITY = 2,
  // 第三優先級: 3
  THIRD_PRIORITY = 3
}

// 超額第一優先級門檻
export const LEVEL1_THRESHOLD = 100;
// 超額第二優先級門檻
export const LEVEL2_THRESHOLD = 50;
// 單人合約金額
export const ONE_PERSON_FEE = 105;
// 合約級距
export const CONTRACT_INTERVAL = 15;

// 超額跑馬燈模板
export const EXCESS_MARQUEE_TEXT_TEMPLATE =
  '貴單位近七個月使用人數平均已達 {} 人，超過簽約人數{}人，請聯繫後台服務人員進行換約，以維持服務品質不中斷';

// 超額跑報表模板路徑
export const EXCESS_REPORT_TEMPLATE_PATH = 'report/excess-stats/files/template/';

// 超額跑報表產出路徑
export const EXCESS_REPORT_OUTPUT_PATH = 'report/excess-stats/files/output/';
// 超額報表匯入錯誤產出路徑
export const EXCESS_REPORT_MISTAKE_PATH = 'report/excess-stats/files/mistake/';
// 跑馬預設燈檔名前綴
export const MARQUEE_REPORT_PRESET_PREFIX = 'ERP-preset-marquee';
// 跑馬燈設定報表檔名前綴
export const MARQUEE_REPORT_SETTINGS_PREFIX = 'ERP-settings-marquee';
// 跑馬匯入錯誤燈檔名前綴
export const MARQUEE_REPORT_MISTAKE_PREFIX = 'ERP-mistake-marquee';
export const EXCESS_REPORT_PREFIX = 'ERP-excess-report';
// 超額報表模板檔名
export const EXCESS_REPORT_TEMPLATE = 'ERP-excess-report-template.xlsx';
// 跑馬燈模板取代目標
export const TEMPLATE_REPLACE_TARGET = '{}';
// NAS URL
export const NAS_URL = 'https://tpescinas01.compal-health.com/drive';

// 跑馬燈設定excel 欄位
export const MARQUEE_SETTING_HEADER = {
  // 資料無效
  validData: 'A',
  // 公司代號
  companyCode: 'B',
  // 站點ID
  siteId: 'C',
  // 公司簡稱
  companyShortName: 'D',
  // 跑馬燈類型
  marqueeType: 'E',
  // 跑馬燈內容
  marqueeText: 'F',
  // 跑馬燈開始時間
  marqueeStart: 'G',
  // 跑馬燈結束時間
  marqueeEnd: 'H',
  // 跑馬燈字顏色
  marqueeFront: 'I',
  // 跑馬燈hover顏色
  marqueeHover: 'J',
  // 跑馬燈背景色
  marqueeBg: 'K',
  // 跑馬燈hover背景色
  marqueeHoverBg: 'L',
  // 跑馬燈連結
  marqueeLink: 'M',
  // 跑馬燈文字閃爍
  marqueeFlash: 'N',
  //  跑馬燈備註
  errorMessage: 'O'
};

// 沒有錯誤
export const NO_ERROR = 0;

// 超額報表標題
export const EXCESS_REPORT_EXCEL_HEADER = {
  // 機構代碼
  companyCode: 'B',
  // 客戶站別ID
  siteId: 'C',
  // 機構簡稱
  siteShortname: 'D',
  // 前六個月機構員工活躍人數
  month6: 'E',
  // 前五個月機構員工活躍人數
  month5: 'F',
  // 前四個月機構員工活躍人數
  month4: 'G',
  // 前三個月機構員工活躍人數
  month3: 'H',
  // 前兩個月機構員工活躍人數
  month2: 'I',
  // 前一個月機構員工活躍人數
  month1: 'J',
  // 本月機構員工活躍人數
  month0: 'K',
  // 平均人數
  averageNumbers: 'L',
  // 合約人數
  conMaxMember: 'M',
  // 合約到期日
  conEnd: 'N',
  // 月租金
  monthlyRent: 'O',
  // 超額月數
  excessMonth: 'P',
  // 平均人數
  averageExcess: 'Q',
  // 超額比例
  dived: 'R',
  // 超額分數
  excessScore: 'S',
  // 超額費用
  excessFee: 'T',
  // 建議新約月費
  newFee: 'U',
  // 處理優先順序
  priority: 'V',
  // 建議新約人數
  newNum: 'W',
  // 回覆期限
  replyDeadline: 'X',
  // 跑馬燈類型
  marqueeType: 'Y',
  // 跑馬燈內容
  marqueeText: 'Z',
  // 跑馬燈初次起始日
  marqueeFirstStart: 'AA',
  // 跑馬燈起始日
  marqueeStart: 'AB',
  // 跑馬燈結束日
  marqueeEnd: 'AC',
  // 跑馬燈建議執行與否
  marqueeAction: 'AD',
  // 跑馬燈實際執行與否
  marqueeActualAction: 'AE',
  // 合約進行中與否
  contractProcessing: 'AF',
  // 建議新約開始日
  newConStart: 'AG',
  // 處理狀況
  processStatus: 'AH',
  //  完成日期
  completeDate: 'AI',
  //  處理狀況
  remarks: 'AJ',
  // 歷史紀錄
  historyRemark: 'AK',
  // 錯誤訊息
  errorMessage: 'AL'
};

// 容許超額月份數
export const TOLERATE_MONTH = 2;
// 容許超額人數係數(容許超額人數=合約人數*容許超額人數係數)
export const TOLERATE_MEMBERS_FACTOR = 0.1;
// 一般單人月費
export const NORMAL_FEE = 100;

// 實施跑馬燈
export const MARQUEE_ACTION_IMPLEMENT = 'true';

// 合約在處理中
export const CONTRACT_IS_PROCESSING = 'true';
// 每次查詢公司數量
export const COMPANY_QUERY_LIMIT = 20;

// 發票管理報表檔案路徑
export const INVOICE_STAT_FOLDER_PATH = 'report/invoice-stat/';

// Excel 起始時間
export const EXCEL_START_TIME = '1900-01-01';

// 最小 Excel 時間
export const MINIMUM_EXCEL_TIME = 1;
// 日期字數
export const DATE_DIGITS = 2;

// 變數類型
export const TYPES = {
  // 字串
  STRING: 'string'
};

// 英文字母長度
export const ENGLISH_LETTER_LENGTH = 26;

// 年週數
export const YEAR_WEEKS = 52;

// 環境對應的網域
export const DOMAIN = new Map<string, string>([
  [DB_TYPE.UAT, 'https://lunastaging.compal-health.com'],
  [DB_TYPE.PROD, 'https://luna.compal-health.com']
]);

// 平台
export const PLATFORM = new Map<string, string>([['居服APP', 'HC_APP']]);
// 零基底轉換成一基底
export const ZERO_BASE_TO_ONE_BASE = 1;
// GCS 金鑰檔案路徑
export const GCP_KEY_FILE_PATH = 'gcs-key/compalswhq-175501-8735402b1ee5.json';
// 內容類型為圖片 PNG
export const CONTENT_TYPE_IMAGE_PNG = 'image/png';

// 720p HD 視頻解析度 (16:9)
// 視頻標準寬度
export const videoStandardWidth = 1280;
// 視頻標準高度
export const videoStandardHeight = 720;

export const INVOICE_INITIAL_NUMBER = 1; // 發票id初始編號

export const FIRST_FILE = 0; // 第一個檔案

export const FIRST_INDEX = 0; // 第一個索引
