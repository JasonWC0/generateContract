/**
 * FeaturePath: 自動報表產製-合約-報價單與訂閱合約-產生日照系統報價單
 * Accountable: Jason Kao, Shane Yu
 */
// ---------------------------------------- import * from node_moudles ----------------------------------------
import fs from 'fs';
// ---------------------------------------- import * from constant ----------------------------------------
import {
  COMMON_CONTRACT_DURATION,
  CONTRACT_TYPE,
  EMPTY_HTML,
  HomeCareProductPriceMap,
  MINIMUM_VALUE,
  PRICE_DIFFERENCES
} from './constant';
// ---------------------------------------- import * from tools ----------------------------------------
import { screenshotTableBuffer } from '../../tools/screenShotBrowser';
import { EMPTY_ARRAY_LENGTH } from '../../tools/constant';
// ---------------------------------------- import * from util ----------------------------------------
import { generateServiceRows } from './util';
// ---------------------------------------- export function ----------------------------------------
/**
 * 生成居服系統報價單
 * @param {number} quantity 數量
 * @param {number} contractType 合約類型
 * @param {string[]} additionalProducts 額外產品
 * @param {string} filePath 檔案路徑
 * @param {number} duration 合約期限
 * @returns
 */
export async function generateHomeCareTable(
  quantity: number,
  contractType: number,
  additionalProducts: { price: any; html: string }[],
  filePath: string,
  duration = COMMON_CONTRACT_DURATION
): Promise<any> {
  try {
    const HBA001_FEE_PRICE = HomeCareProductPriceMap.get(CONTRACT_TYPE[contractType])?.HBA001 || MINIMUM_VALUE;
    const PHA001_FEE_PRICE = HomeCareProductPriceMap.get(CONTRACT_TYPE[contractType])?.PHA001 || MINIMUM_VALUE;

    // 合併處理額外產品邏輯
    const { additionalProductTable, additionalProductsTotal } = generateAdditionalProductsTable(
      additionalProducts,
      contractType,
      duration
    );

    // 生成產品詳細資料表
    const productDetail = generateProductDetailTable(
      contractType,
      quantity,
      HBA001_FEE_PRICE,
      PHA001_FEE_PRICE,
      duration
    );

    // 生成報價表
    const quotationTable = generateQuotationHtml(
      productDetail,
      additionalProductTable,
      HBA001_FEE_PRICE,
      PHA001_FEE_PRICE,
      quantity,
      additionalProductsTotal,
      duration,
      contractType
    );

    // 寫入檔案和生成快照
    fs.writeFileSync(filePath, quotationTable);
    const buffer = await screenshotTableBuffer(quotationTable);
    return buffer;
  } catch (e) {
    console.error('Error in generateHomeCareTable:', e);
  }
}

// 提取處理額外產品的邏輯
function generateAdditionalProductsTable(
  additionalProducts: { price: number; html: string }[],
  contractType: number,
  duration: number
) {
  let additionalProductTable = '';
  let additionalProductsTotal = MINIMUM_VALUE;

  additionalProducts.forEach((product) => {
    const { price, html } = product || { html: EMPTY_HTML, price: MINIMUM_VALUE };
    additionalProductsTotal += price;
    additionalProductTable += html;
  });

  if (additionalProducts.length > EMPTY_ARRAY_LENGTH) {
    additionalProductTable =
      `
 <tr style="background-color: #ffcccb;">
   <td>PHA002</td>
   <td>居服系統<span style="color:red;">限時選購</span>加值包 B (${contractType}人)，含以下功能</td>
   <td style="text-align: right;">${additionalProductsTotal * PRICE_DIFFERENCES}</td>
   <td style="text-align: right;">${additionalProductsTotal}</td>
   <td style="text-align: right;">1</td>
   <td style="text-align: right;">${duration}</td>
   <td style="text-align: right;">${additionalProductsTotal * duration}</td>
 </tr>` + additionalProductTable;
  }

  return { additionalProductTable, additionalProductsTotal };
}

// 生成報價表函數
function generateQuotationHtml(
  productDetail: string,
  additionalProductTable: string,
  HBA001_FEE: number,
  PHA001_FEE: number,
  quantity: number,
  additionalProductsTotal: number,
  duration: number,
  contractType: number,
  serviceType: string = 'H'
) {
  let contractAmount = 0,
    discountedAmount = 0,
    specialPrice = 0,
    tax = 0,
    totalAmount = 0;

  if (serviceType === 'H') {
    ({ contractAmount, discountedAmount, specialPrice, tax, totalAmount } = calculateHomCareMonthlyRent(
      quantity,
      additionalProductsTotal,
      duration,
      contractType,
      HBA001_FEE,
      PHA001_FEE
    ));
  }

  if (serviceType === 'D') {
    ({ contractAmount, discountedAmount, specialPrice, tax, totalAmount } = calculateDayCareMonthlyRent(
      quantity,
      additionalProductsTotal
    ));
  }

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
    ${additionalProductTable}
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
function generateTableRow(
  itemCode: string,
  description: string,
  fee: number,
  unitFee: number,
  quantity: number,
  duration: number,
  highlight: boolean = false
): string {
  const bgColor = highlight ? 'background-color: #FFFF00;' : '';
  return `
    <tr style="${bgColor}">
    <td style="border: none;">${itemCode}</td>
    <td style="border: none;">${description}</td>
    <td style="border: none; text-align: right;">${fee.toLocaleString()}</td>
    <td style="border: none; text-align: right;">${unitFee.toLocaleString()}</td>
    <td style="border: none; text-align: right;">${quantity.toLocaleString()}</td>
    <td style="border: none; text-align: right;">${duration.toLocaleString()}</td>
    <td style="border: none; text-align: right;">${(unitFee * quantity * duration).toLocaleString()}</td>
    </tr>
  `;
}

export function generateProductDetailTable(
  contractType: number,
  quantity: number,
  HBA001_FEE: number,
  PHA001_FEE: number,
  duration: number
): string {
  const HBA002_FEE = 500;
  const PHA003_FEE = 250;

  let productDetail: string;

  if (contractType === 10) {
    productDetail = `
    ${generateTableRow('HBA002', '居服系統基本版 (1-10人版，不可累加)', HBA002_FEE * 2, HBA002_FEE, quantity, duration, true)}
    ${generateServiceRows([
      {
        productCode: '',
        description:
          '分析報表: 中央服務紀錄表、個案收費單、個案收據(無機構印章)、個案總表、服務紀錄總表、員工\n總表、生理量測報表、員工體溫量測統計表及員工出勤表'
      },
      {
        productCode: '',
        description: '服務項目管理: 更新A碼清冊、及自費項目清單'
      },
      {
        productCode: '',
        description: '服務機構設定: 支審系統與聯護系統串接'
      },
      {
        productCode: '',
        description: '個案: 個案管理、服務紀錄、督導訪視紀錄表、及飲食紀錄'
      },
      {
        productCode: '',
        description: '員工管理: 員工基本資料、居服班表、請假紀錄、證書、異動紀錄、及居服員出勤表'
      },
      {
        productCode: '',
        description: '排班: 智慧排班推薦、居服員定位顯示、及請假調班'
      }
    ])}
    ${generateTableRow('PHA003', '居服系統必選加值包 C，含以下功能', PHA003_FEE * 2, PHA003_FEE, quantity, duration, true)}
    ${generateServiceRows([
      {
        productCode: 'SCS000',
        description: '真人客服(系統操作問答服務，每月以5個問題為上限)'
      },
      {
        productCode: 'SCS000',
        description: '真人客服(技術支援及疑難排解服務，每月以5個問題為上限)'
      },
      {
        productCode: 'SCS000',
        description: '機器人查詢服務'
      },
      {
        productCode: 'TCY001',
        description: '線上團訓(家教班)'
      },
      {
        productCode: 'SCS001',
        description: '線上課程教學(影片、文件)'
      }
    ])}
    `;
  } else {
    productDetail = `
      ${generateTableRow('HBA001', `居服系統基本版 (${contractType}人)`, HBA001_FEE * 2, HBA001_FEE, quantity, duration, true)}
      ${generateTableRow('PHA001', `客製化加購 (${contractType}人)，含以下功能`, PHA001_FEE * 2, PHA001_FEE, quantity, duration, false)}
      ${generateServiceRows([
        { productCode: 'HAL002', description: '身心障礙者居家照顧服務成果' },
        { productCode: 'HAL003', description: '居服員績效表' },
        { productCode: 'HAL004', description: '督導績效報表' },
        { productCode: 'HAL005', description: '長照服務統計表(聯護系統)' },
        { productCode: 'HCA001', description: '居服評鑑表單' },
        { productCode: 'HCA002', description: '居服員工作紀錄表' },
        { productCode: 'HEM001', description: '居服員考核表單' },
        { productCode: 'HSA001', description: '薪資基本設定' },
        { productCode: 'HSA002', description: '薪資報表' },
        { productCode: 'HSA003', description: '拆帳管理' },
        { productCode: 'HSA004', description: '居服員拆帳表' },
        { productCode: 'SCS001', description: '真人客服(系統操作問答服務)' },
        { productCode: 'SCS002', description: '真人客服(技術支援及疑難排解服務，每月以5個問題為上限)' },
        { productCode: 'SCS003', description: '機器人查詢服務' },
        { productCode: 'TCY001', description: '線上團訓(家教班)' },
        { productCode: 'TCY002', description: '線上課程教學(影片、文件)' }
      ])}`;
  }

  return productDetail;
}

function calculateHomCareMonthlyRent(
  quantity: number,
  additionalProductsTotal: number,
  duration: number,
  contractType: number,
  HBA001_FEE: number,
  PHA001_FEE: number
): { contractAmount: number; discountedAmount: number; specialPrice: number; tax: number; totalAmount: number } {
  let contractAmount = (HBA001_FEE * quantity + PHA001_FEE * quantity + additionalProductsTotal) * duration;
  let discountedAmount = PHA001_FEE * quantity * duration;
  let specialPrice = (HBA001_FEE * quantity + additionalProductsTotal) * duration;
  let tax = specialPrice * 0.05;
  let totalAmount = specialPrice * 1.05;

  if (contractType === 10) {
    contractAmount = (500 + 250) * duration;
    discountedAmount = 250 * duration;
    specialPrice = 500 * duration;
    tax = specialPrice * 0.05;
    totalAmount = specialPrice * 1.05;
  }

  return {
    contractAmount,
    discountedAmount,
    specialPrice,
    tax,
    totalAmount
  };
}
function calculateDayCareMonthlyRent(people: number, duration: number = 3) {
  const noDiscount = 0;
  const baseUsageFee = 1500; // 基本使用費 (每月月租)
  const additionalRentPerFivePeople = 500; // 每增加 5 人增加的額外月租費

  // 計算額外的月租費，依據人數每 5 人增加 500
  const extraRent = Math.ceil(Math.max(people, 0) / 5) * additionalRentPerFivePeople;

  // 總月租費為基本使用費加上額外月租費
  const contractAmount = (baseUsageFee + extraRent) * duration;
  //  contractAmount;
  const discountedAmount = noDiscount;
  const specialPrice = contractAmount;
  const tax = Math.ceil(specialPrice * 0.05);
  const totalAmount = specialPrice + tax;
  return { contractAmount, discountedAmount, specialPrice, tax, totalAmount };
  //  contractAmount, discountedAmount, specialPrice, tax, totalAmount
}

//generateHomeCareTable(1, 10, [], 'test.html');
