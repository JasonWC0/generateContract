/**
 * FeaturePath: 自動報表產製-合約-工具-工具
 * Accountable: Jason Kao, Shane Yu
 */
/**
 * 服務細項明細表
 * @param {Array<{ productCode: string; description: string }>} services 產品代號 & 說明
 * @returns
 */
export function generateServiceRows(services: { productCode: string; description: string }[]): string {
  return services
    .map(
      (service) => `
   <tr>
   <td style="text-align: center; border: none;">${service.productCode}</td>
   <td colspan="6" style="border: none;">${service.description}</td>
   </tr>
 `
    )
    .join('');
}

/**
 * 產生html表格列
 * @param {string} itemCode 產品代碼
 * @param {string} description 產品描述
 * @param {number} fee 費用
 * @param {number} unitFee 單位費用
 * @param {number} quantity 數量
 * @param {number} duration 週期
 * @param {boolean} highlight 是否亮底色
 * @returns
 */
export function generateTableRow(
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
