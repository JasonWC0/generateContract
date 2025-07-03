/**
 * FeaturePath: 自動報表產製-工具庫-資料庫-列舉值
 * Accountable: Shane Yu, Hilbert Huang
 */
/* eslint-disable no-unused-vars */
// ---------------------------------------- import * from constant ----------------------------------------

// 時間
export enum TimeConf {
  ONE_MONTH = 30 * 24 * 60 * 60 * 1000, // 一個月
  ONE_DAY = 24 * 60 * 60 * 1000, // 一天
  MINUTES_PER_DAY = 24 * 60, // 分鐘(日)
  MINUTES_PER_HOUR = 60, // 分鐘(小時)
  ONE_HOUR = 60 * 60 * 1000, // 一小時
  ONE_MS = 1, // 一毫秒
  UTC_OFFSET = 8, // UTC+8
  DAYS_PER_WEEK = 7, // 一週天數
  ONE = 1, // 一
  MINUS_ONE = -1, // 負一
  MS_PER_SECOND = 1000, // 秒轉毫秒
  HOUR_SECONDS = 3600, // 小時轉秒,
  YEAR_MONTH = 12, // 一年月份
  MONTH = 'month', // 月
  WEEK = 'week', // 週
  DAY = 'day', // 日
  HOUR = 'hour', // 時
  MS = 'millisecond', // 毫秒
  MINUTES = 'minutes' // 分鐘
}

// Moment用enum
export enum MomentConf {
  formatYearMonthDay = 'YYYYMMDD',
  ChineseYearMonthDay = 'YYYY年MM月DD日',
  formatYearMonth = 'YY-MM',
  formatMonth = 'MM',
  formatYear = 'YYYY',
  formatYearAbbr = 'YY',
  formatWeek = 'WW',
  dashFormat = 'YYYY-MM-DD',
  monthName = 'MMMM' // 月份名稱(ex: January)
}

// 機構狀態
export enum COMPANY_STATUS {
  TEST = 'T', // 測試
  OPEN = 'O', // 開啟
  CLOSE = 'C' // 關閉
}

// 星期數
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

// 超額報表-表頭位置
export enum EXCESS_REPORT_HEADER {
  // 公司代碼
  COMPANY_CODE = 2,
  //  跑馬燈類型
  MARQUEE_TYPE = 25,
  //  跑馬燈內容
  MARQUEE_TEXT = 26,
  // 跑馬燈初次開始時間
  MARQUEE_FIRST_START = 27,
  // 跑馬燈開始時間
  MARQUEE_START = 28,
  //  跑馬燈結束時間
  MARQUEE_END = 29,
  // 跑馬燈執行與否
  MARQUEE_ACTION = 30,
  // 跑馬燈執行與否
  MARQUEE_ACTUAL_ACTION = 31,
  // 跑馬燈執行與否
  CONTRACT_PROCESSING = 32,
  // 新合約開始時間
  NEW_CON_START = 33,
  // 處理狀態
  PROCESS_STATUS = 34,
  // 完成日期
  COMPLETE_DATE = 35,
  // 備註
  REMARKS = 36,
  // 歷史備註
  HISTORY_REMARKS = 37
}

// 跑馬燈類型
export enum MARQUEE_TYPE {
  // 超額跑馬燈
  EXCESS = '超額',
  // 續約跑馬燈
  RENEWAL = '續約',
  // 催款跑馬燈
  PAYMENT_NOTIFY = '催款',
  // 廣告跑馬燈
  ADVERTISEMENT = '廣告'
}
// 報表類型
export enum MARQUEE_REPORT_TYPE {
  EXCESS = 'excess',
  RENEWAL = 'renewal',
  PAYMENT_NOTIFY = 'paymentNotify',
  ADVERTISEMENT = 'advertisement'
}

// 回應類型
export enum RESPONSE_TYPE {
  //固定長度二進制數據緩衝區
  ARRAY_BUFFER = 'arraybuffer'
}

// 跑馬燈模板
export enum MARQUEE_TEXT_TEMPLATE {
  // 超額跑馬燈
  EXCESS = '貴單位近七個月使用人數平均已達 {} 人，超過簽約人數{}人，請聯繫客服或續約處理同仁進行換約，以維持服務品質不中斷\n帳務合約聯絡人:褚小姐02-26586288 #17352',
  // 續約跑馬燈
  RENEWAL = '貴單位的合約即將於{}到期，請聯繫客服或續約處理同仁進行換約，以維持服務品質不中斷\n帳務合約聯絡人:褚小姐02-26586288 #17352'
}
//  超額跑馬燈預設值
export enum PRESET_MARQUEE {
  // 跑馬燈文字顏色
  FRONT_COLOR = '#FFFFFF',
  // 跑馬燈文字顏色(Hover)
  HOVER_COLOR = '',
  // 跑馬燈底色顏色
  BG_COLOR = '',
  // 跑馬燈底色顏色(Hover)
  HOVER_BG_COLOR = '',
  //  跑馬燈連結
  LINK = '',
  // 文字閃爍
  FLASH = 'FALSE',
  SPEED = 60
}

export enum NAS_FILE_PATH {
  PRESET_MARQUEE = '/Project/iCare/研發管理/主議題/iCare自動化/跑馬燈/跑馬燈預計更新表',
  IMPORT_MARQUEE = '/Project/iCare/研發管理/主議題/iCare自動化/跑馬燈/匯入',
  EXPORT_MARQUEE_ERROR = '/Project/iCare/研發管理/主議題/iCare自動化/跑馬燈/匯出/錯誤紀錄',
  EXPORT_MARQUEE_SETTING = '/Project/iCare/研發管理/主議題/iCare自動化/跑馬燈/匯出/跑馬燈設定',
  IMPORT_CUSTOMER_INVOICE = '/Project/iCare/研發管理/主議題/iCare自動化/營運管理/客戶發票管理/匯入'
}

export enum MARQUEE_REPORT_HEADER {
  // 資料是否有效
  IS_DATA_VALID = 1,
  // 公司代碼
  CODE = 2,
  // 客戶站別ID
  SITE_ID = 3,
  // 機構簡稱
  COMPANY_SHORT_NAME = 4,
  // 跑馬燈類型
  MARQUEE_TYPE = 5,
  // 跑馬燈內容
  MARQUEE_TEXT = 6,
  // 跑馬燈開始時間
  MARQUEE_START = 7,
  // 跑馬燈結束時間
  MARQUEE_END = 8,
  // 跑馬文字顏色
  MARQUEE_HOVER = 10,
  // 跑馬燈文字顏色(Hover)
  MARQUEE_FRONT = 9,
  // 跑馬燈底色顏色
  MARQUEE_BG = 11,
  // 跑馬燈底色顏色(Hover)
  MARQUEE_HOVER_BG = 12,
  // 跑馬燈連結
  MARQUEE_LINK = 13,
  // 文字閃爍
  MARQUEE_FLASH = 14
}

export enum ERROR_MSG {
  COMPANY_CODE_NF = '公司代碼不存在',
  MARQUEE_START_NV = '跑馬燈開始時間格式錯誤',
  MARQUEE_END_NV = '跑馬燈結束時間格式錯誤',
  MARQUEE_END_GT_START = '跑馬燈結束時間不得早於開始時間'
}

// 取小數位數
export enum DECIMAL_PLACE {
  TENTHS = 1,
  HUNDREDTHS = 2,
  THOUSANDTHS = 3
}

// 資料庫類型
export enum DB_TYPE {
  // 主站資料庫
  PROD = 'prod',
  // 測試站資料庫
  	UAT = 'uat'
}

// 合約狀態
export enum CONTRACT_STATUS {
  // 合約在有效期內
  ACTIVE = 'A',
  // 合約已終止
  EXPIRED = 'X',
  // 未來預計合約
  PLANNED_RENEWAL = 'R'
}

// 合約狀態
export enum CONTRACT_PROCESS_STATUS {
  // 收到雙方用印，進行
  Y = 'Y',
  // 收到客戶用印或尚未收到合約/ Waiting
  W = 'W'
}
// 個案狀態
export enum CASE_STATUS {
  APPLY = '00', // 新申請
  INTERVIEW = '10', // 家訪
  CONTRACT = '20', // 契約
  SERVICE = '30', // 服務中
  PENDING = '35', // 暫停
  CLOSED = '40', // 結案
  TRANSFORM = '50' // 轉介
}

// EXCEL 跑馬燈執行與否
export enum EXCEL_BOOLEAN {
  // 是
  TRUE = 'Y',
  // 否
  FALSE = 'N'
}

export const enum CONTRACT_PARTY {
  // 仁寶
  COMPAL = '仁寶',
  // 仁寶健康
  COMPAL_HEALTH = '健康'
}
// EXCEL 欄位對齊方式
export enum EXCEL_ALIGNMENT {
  LEFT = 'left', // 靠左
  RIGHT = 'right', // 靠右
  CENTER = 'center' // 置中
}

// ASCII碼
export enum ASCII_CODE {
  A = 65
}

// 檔案類型
export enum FILE_TYPE {
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg'
}

// 檔案類別
export enum FILE_CATEGORY {
  BANNER = 'banner' // 橫幅
}

// 快取控制類別
export enum CACHE_CONTROL_TYPE {
  // 私有
  PRIVATE = 'private',
  // 公開
  PUBLIC = 'public'
}

export enum INVOICE_STATUS {
  // 未開立
  NOT_ISSUED = 0,
  // 已開立
  ISSUED = 1,
  // 已折讓
  ALLOWANCE = 2
}
// http header 內容
export enum HTTP_HEADERS {
  // 無快取
  CACHE_CONTROL_NO_CACHE = 'no-cache',
  // 數據以 URL 編碼的形式發送
  APPLICATION_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded'
}

// 檔案編碼類型
export enum ENCODE_TYPE {
  // utf8
  UTF8 = 'utf8'
}

// 發票狀態
export enum OCRM_INVOICE_STATUS {
  FUTURE = 'F', // 未來的發票，可能被更新
  INVOICE = 'I', // Invoice found
  EXPIRED = 'X', // Invoice expired
  EXCESS_COST = 'E' // 超額費用 (Excess cost)
}

// 交易狀態
export enum TRANSACTION_STATUS {
  MATCHED = 1, // 已匹配發票
  UNMATCHED = 2, // 未匹配發票
  UNCONFIRMED = 3 // 未確認
}
