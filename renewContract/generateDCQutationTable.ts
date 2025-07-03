/**
 * FeaturePath: 自動報表產製-合約-報價單與訂閱合約-產生日照系統報價單
 * Accountable: Jason Kao, Shane Yu
 */
// ---------------------------------------- import * from node_moudles ----------------------------------------
import fs from 'fs';
// ---------------------------------------- import * from constant ----------------------------------------
import {
  COMMON_CONTRACT_DURATION,
  DAYCARE_MEMBER_STAGE,
  LEAST_MEMBERS,
  PHA001_PRODUCT_FEE,
  TAX_RATE
} from './constant';
// ---------------------------------------- import * from tools ----------------------------------------
import { screenshotTableBuffer } from '../screenShotBrowser';
import { generateServiceRows, generateTableRow } from './util';

// ---------------------------------------- export function ----------------------------------------
/**
 * 生成日照系統報價單
 * @param {string} filePath 檔案路徑
 * @param {number} duration 合約期限
 * @param {number} maxMembers 最大人數
 * @param {number} specificPrice 特定價格
 * @returns {Promise<any>} 回傳檔案Buffer
 */
export async function generateDaycareTable(
  filePath: string,
  duration = COMMON_CONTRACT_DURATION,
  maxMembers: number = LEAST_MEMBERS,
  specificPrice?: number
): Promise<any> {
  try {
    // STEP_01: 生成產品明細表
    const productDetail = generateProductDetailTable(duration, maxMembers, specificPrice);
    // STEP_02: 生成報價表
    const quotationTable = generateDCQuotationHtml(productDetail, duration, maxMembers, specificPrice);
    // STEP_03: 寫入檔案
    await fs.writeFileSync(filePath, quotationTable);
    // STEP_04: 回傳檔案Buffer
    const buffer = await screenshotTableBuffer(quotationTable);
    return buffer;
  } catch (error) {
    console.error('Error in generateHomeCareTable:', error);
  }
}

/**
 * 生成日照系統表單 html
 * @param {string} productDetail 產品明細
 * @param {number} duration 合約期限
 * @param {number} maxMembers 最大人數
 * @param {number} specificPrice 特定價格
 * @returns
 */
function generateDCQuotationHtml(
  productDetail: string,
  duration: number,
  maxMembers: number = 0,
  specificPrice?: number
) {
  const { contractAmount, discountedAmount, specialPrice, tax, totalAmount } = calculateDayCareMonthlyRent(
    maxMembers,
    duration,
    specificPrice
  );

  return `
 <!DOCTYPE html>
 <html lang="zh-Hant">
 <head>
 <meta charset="UTF-8" />
 <title>Contract Details</title>
 <style>
   table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  font-family: 'Microsoft JhengHei', sans-serif;
  color: black;
   }
   th, td {
  border: 1px solid black;
  padding: 2px;
  text-align: left;
  white-space: nowrap;
   }
   th {
  background-color: #f2f2f2;
   }
   tr {
  line-height: 1;
   }
   th, td {
  font-family: 'Microsoft JhengHei', Verdana, sans-serif;
   }
   th, td *:lang(en) {
  font-family: Verdana, sans-serif;
   }
 </style>
 </head>
 <body>
 <table>
   <tr style="text-align: right;">
  <th>產品編號</th>
  <th>說明</th>
  <th>月租定價 (NT$)</th>
  <th>合約優惠價(NT$)</th>
  <th>數量</th>
  <th>月數</th>
  <th>小計</th>
   </tr>
   ${productDetail}
  <tr style="text-align: right; border: none;">
   <td colspan="2" style="text-align: right; border: none;"><strong>合約優價</strong></td>
   <td colspan="5" style="text-align: right; border: none;"><strong>${contractAmount.toLocaleString()}</strong></td>
  </tr>
  <tr style="text-align: right; border: none;">
   <td colspan="2" style="text-align: right; border: none;"><strong>專案優惠</strong></td>
   <td colspan="5" style="text-align: right; border: none;"><span style="color:red;"><strong>-${discountedAmount.toLocaleString()}</strong></span></td>
  </tr>
  <tr style="text-align: right; border: none;">
   <td colspan="2" style="text-align: right; border: none;"><strong>專案優惠價</strong></td>
   <td colspan="5" style="text-align: right; border: none;"><strong>${specialPrice.toLocaleString()}</strong></td>
  </tr>
  <tr style="text-align: right; border: none;">
   <td colspan="2" style="text-align: right; border: none;"><strong>稅額 (5%)</strong></td>
   <td colspan="5" style="text-align: right; border: none;"><strong>${tax.toLocaleString()}</strong></td>
  </tr>
  <tr style="text-align: right; border-top: double;">
   <td colspan="2" style="text-align: right; border: none;"><strong>總計</strong></td>
   <td colspan="5" style="text-align: right; border: none;"><strong>${totalAmount.toLocaleString()}</strong></td>
  </tr>
 </table>
 </body>
 </html>
 `;
}

/**
 * 生成產品明細表
 * @param {number} duration 合約期限
 * @param {number} maxMembers 最大人數
 * @param {number} specificPrice 特定價格
 * @returns
 */
export function generateProductDetailTable(duration: number, maxMembers: number = 0, specificPrice?: number): string {
  const { monthlyRent } = calculateDayCareMonthlyRent(maxMembers, duration, specificPrice);

  const productDetail = `
  ${generateTableRow('HBA001', `日照系統基本版 (${maxMembers}人)`, monthlyRent * 2, monthlyRent, 1, duration, true)}
  ${generateTableRow('PHA001', `居服系統<span style="color:red;">限時選購</span>加值包 A (${maxMembers}人)，含以下功能`, PHA001_PRODUCT_FEE * 2, PHA001_PRODUCT_FEE, 1, duration, false)}
  ${generateServiceRows([
    { productCode: 'DCA001', description: '日照系統-定期評估表單-夜間喘息服務紀錄單' },
    { productCode: 'DIM001', description: '日照系統-面試者管理' },
    { productCode: 'DSA001', description: '日照系統-薪資管理套組' },
    { productCode: 'DTR001', description: '日照系統-交通車管理套組' },
    { productCode: 'DMA001', description: '日照系統-膳食管理套組' },
    { productCode: 'DSA001', description: '日照系統-薪資管理套組' },
    { productCode: 'SCS001', description: '真人客服(系統操作問答服務)' },
    { productCode: 'SCS002', description: '真人客服(技術支援及疑難排解服務，每月以5個問題為上限)' },
    { productCode: 'SCS003', description: '機器人查詢服務' },
    { productCode: 'TCY001', description: '線上團訓(家教班)' },
    { productCode: 'SCS003', description: '線上課程教學(影片、文件)' }
  ])}`;

  return productDetail;
}

/**
 * 計算日照月租費
 * @param {number} people 人數
 * @param {number} duration 合約月數
 * @param {number} specificPrice 特定價格
 * @returns
 */
export function calculateDayCareMonthlyRent(people: number, duration: number = 36, specificPrice?: number) {
  // 基本使用費 (每月月租)
  const baseUsageFee = 1500;
  // 每增加 5 人增加的額外月租費
  const additionalRentPerFivePeople = 500;
  // 計算額外的月租費，依據人數每 5 人增加 500
  const extraRent = Math.ceil(Math.max(people, LEAST_MEMBERS) / DAYCARE_MEMBER_STAGE) * additionalRentPerFivePeople;
  const monthlyRent = specificPrice || baseUsageFee + extraRent;
  // 總月租費為基本使用費加上額外月租費
  const contractAmount = monthlyRent * duration + PHA001_PRODUCT_FEE * duration;
  const discountedAmount = PHA001_PRODUCT_FEE * duration;
  const specialPrice = monthlyRent * duration;
  const tax = Math.ceil(specialPrice * TAX_RATE);
  const totalAmount = specialPrice + tax;
  return {
    contractAmount: Math.floor(contractAmount),
    discountedAmount: Math.floor(discountedAmount),
    specialPrice: Math.floor(specialPrice),
    tax: Math.floor(tax),
    totalAmount: Math.floor(totalAmount),
    monthlyRent: Math.floor(monthlyRent)
  };
}
