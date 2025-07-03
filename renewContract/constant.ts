import * as path from 'path';

export const EMPTY_HTML = '';
export const COMMON_CONTRACT_DURATION = 24;
export const PRICE_DIFFERENCES = 3;

export const HCAdditionalSubProductInfoMap = new Map<string, { html: string; price: number }>([
  [
    'HAC001',
    {
      html: `            </tr>
                        <tr>
                <td style="text-align: center;">HAC001</td>
                <td colspan="6">客製化銀行繳費單</td>
            </tr>`,
      price: 1000
    }
  ],
  [
    'HAL001',
    {
      html: `            <tr>
                <td style="text-align: center;">HAL001</td>
                <td colspan="6">個案收據(自動套入公司, 負責人, 業務主管, 會計, 出納, 經辦印章)</td>
            </tr>`,
      price: 500
    }
  ]
]);

export const HomeCareProductPriceMap = new Map<string, any>([
  ['TEN_MEMBERS_RANGE', { HBA001: 1000, PHA001: 500, HAC001: 2000, HAL001: 1000, HBA002_FEE: 1000 }],
  ['TWENTY_MEMBERS_RANGE', { HBA001: 2000, PHA001: 800, HAC001: 2000, HAL001: 1000 }],
  ['FIFTEEN_MEMBERS_RANGE', { HBA001: 1500, PHA001: 500, HAC001: 2000, HAL001: 1000 }],
  ['TWENTY_FIVE_MEMBERS_RANGE', { HBA001: 2500, PHA001: 500, HAC001: 2000, HAL001: 1000 }]
]);
export const QUOTATION_WORD_TEMPLATE = new Map<string, string>([
  ['TEN_MEMBERS_RANGE', '50系統報價單.docx'],
  ['FIFTEEN_MEMBERS_RANGE', '50系統報價單.docx'],
  ['TWENTY_FIVE_MEMBERS_RANGE', '50系統報價單.docx']
]);

export const QUOTATION_FONTS_SETTING = new Map<string, { size: number; align: string; maxCharacters?: number }>([
  ['productLine', { size: 10, align: 'Center' }],
  ['contractTitle', { size: 10, align: 'Left', maxCharacters: 44 }],
  ['quotationTable', { size: 9, align: 'Center' }],
  ['year', { size: 12, align: 'Center' }],
  ['maxMembers', { size: 12, align: 'Center' }],
  ['startDate1', { size: 10, align: 'Center' }],
  ['endDate1', { size: 10, align: 'Center' }],
  ['quotationValidDate', { size: 9, align: 'Center' }],
  ['startDate2', { size: 9, align: 'Center' }],
  ['endDate2', { size: 9, align: 'Center' }],
  ['numericalRange', { size: 9, align: 'Center' }],
  ['maxMembers2', { size: 9, align: 'Center' }],
  ['tolerateMembers', { size: 9, align: 'Center' }],
  ['oneStageFee', { size: 9, align: 'Center' }],
  ['overAllowableThreshold', { size: 9, align: 'Center' }],
  ['stageMax', { size: 9, align: 'Center' }],
  ['nextMonthlyRent', { size: 9, align: 'Center' }],
  ['nextStageFee', { size: 9, align: 'Center' }],
  ['nextStageMin', { size: 9, align: 'Center' }],
  ['nextStageMax', { size: 9, align: 'Center' }],
  ['default', { size: 9, align: 'Center' }]
]);

export const SUBSCRIPTION_FORM_FONTS_SETTING = new Map<string, { size: number; align: string }>([
  ['checkBoxHC', { size: 11, align: 'Center' }],
  ['checkBoxDC', { size: 11, align: 'Center' }],
  ['contractTitle1', { size: 11, align: 'Left' }],
  ['duration1', { size: 11, align: 'Left' }],
  ['contractTitle2', { size: 12, align: 'Left' }],
  ['compalAccountName', { size: 11, align: 'Center' }],
  ['bankName', { size: 11, align: 'Center' }],
  ['bankAddress', { size: 11, align: 'Center' }],
  ['bandCode', { size: 11, align: 'Center' }],
  ['virtualAccount', { size: 11, align: 'Center' }],
  ['duration2', { size: 11, align: 'Center' }],
  ['siteName', { size: 11, align: 'Center' }],
  ['representative', { size: 11, align: 'Center' }],
  ['address', { size: 11, align: 'Center' }],
  ['taxID', { size: 11, align: 'Left' }],
  ['siteName2', { size: 11, align: 'Center' }],
  ['representativeTitle', { size: 11, align: 'Center' }],
  ['invoiceWindowManager', { size: 11, align: 'Left' }],
  ['invoiceWindowMail', { size: 11, align: 'Left' }],
  ['invoiceWindowPhone', { size: 11, align: 'Left' }],
  ['shippingAddress', { size: 11, align: 'Left' }],
  ['invoiceTitle', { size: 11, align: 'Left' }],
  ['default', { size: 11, align: 'Center' }]
]);
export enum CONTRACT_TYPE {
  TEN_MEMBERS_RANGE = 10,
  FIFTEEN_MEMBERS_RANGE = 15,
  TWENTY_MEMBERS_RANGE = 20,
  TWENTY_FIVE_MEMBERS_RANGE = 25,
  OTHER = 0
}
export const RENEW_CONTRACT_PATH = './automation/renewContract';
export const RENEW_CONTRACT_IMAGE_PATH = path.join(process.cwd(), RENEW_CONTRACT_PATH, 'img');
//居家服務系統
export type QUOTATION_FORMS = {
  productLine: string;
  contractTitle: string;
  quotationTable?: string;
  year: number;
  maxMembers: number;
  startDate1: string;
  endDate1: string;
  quotationValidDate: string;
  startDate2: string;
  endDate2: string;
  numericalRange: number;
  maxMembers2: number;
  tolerateMembers: number;
  oneStageFee: number;
  overAllowableThreshold: number;
  stageMax: number;
  nextMonthlyRent: number;
  nextStageFee: number;
  nextStageMin: number;
  nextStageMax: number;
  filePath?: string;
  templatePath?: string;
};

export type SUBSCRIPTION_FORMS = {
  checkBoxHC: boolean;
  checkBoxDC: boolean;
  contractTitle1: string;
  duration1: string;
  contractTitle2: string;
  compalAccountName: string;
  bankName: string;
  bankAddress: string;
  bandCode: string;
  virtualAccount: string;
  duration2: string;
  siteName?: string;
  representative?: string;
  address: string;
  taxID: string;
  siteName2?: string;
  representativeTitle: string;
  invoiceWindowManager: string;
  invoiceWindowMail: string;
  invoiceWindowPhone: string;
  shippingAddress: string;
  invoiceTitle: string;
  filePath?: string;
  templatePath?: string;
};

export type CONTRACT_DETAIL = {
  contractTitle: string;
};

// 整除
export const DEVISABLE_REMAINDER = 0;
export const PRODUCT_LINE_NAME = new Map<string, string>([
  ['H', '居家服務系統'],
  ['D', '日照服務系統']
]);

export const RENEW_CONTRACT_TEMPLATE_PATH = 'report/renewContract/template';
export const RENEW_CONTRACT_IMG_PATH = 'report/renewContract/img';
export const CONTRACTILE_ONE_LINE_CHARACTERS = 22;
export const QUOTATION_TEMPLATE_PATH = './report/renewContract/templates/quotationTemplate2.pdf';
export const SUBSCRIPTION_TEMPLATE_PATH = './report/renewContract/templates/subscriptionTemplate.pdf';
export const RENEW_CONTRACT_FILE_PATH = './report/renewContract/files/';
export const MSJH_FONT_FILE_PATH = './report/renewContract/fonts/msjh.ttf';
export const KAIU_FONT_FILE_PATH = './report/renewContract/fonts/kaiu.ttf';

export const PRODUCT_LINE_TYPE = {
  HOME_CARE: 'H',
  DAY_CARE: 'D'
};

export const QUOTATION_IMAGE_SETTING = {
  x: 37,
  y: 370,
  width: 530,
  height: 245
};

export const DAYCARE_MEMBER_STAGE = 5;
export const DAYCARE_MEMBER_STAGE_FEE = 500;
export const PRODUCT_FREE = 0;
export const PHA001_PRODUCT_FEE = 1000;
// 單行訂閱單合約抬頭最大字數
export const SUBSCRIPTION_MAX_CHARACTER = 40;
// 最少容忍人數
export const MINIUM_TOLERATE_NUMBER = 4;
// 使用人數容忍倍率
export const TOLERATE_RATE = 1.1;
export const DC_MEMBER_STAGE = 5;
// 最少人數
export const LEAST_MEMBERS = 0;
// 稅率
export const TAX_RATE = 0.05;
// 最小值
export const MINIMUM_VALUE = 0;
