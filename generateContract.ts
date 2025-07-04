/**
 * FeaturePath: 自動報表產製-合約-報價單與訂閱合約-自動產出合約
 * Accountable: Shane Yu, Hilbert Huang
 */

// ---------------------------------------- import * from node_moudles ----------------------------------------
import path from 'path';
import moment from 'moment';
import fontkit from 'pdf-fontkit';
import { PDFDocument, TextAlignment } from 'pdf-lib';
// ---------------------------------------- import * from tools ----------------------------------------
import { DefaultDBNative as db } from './database';
import * as fs from 'fs';
import {
  addChangeLineSymbol,
  getCompaniesUsingBankBill,
  getCompaniesUsingReceipt,
  getContractsPlanedToRenew,
  getCustomerInvoiceSettings,
  getLatestProfile
} from './renewContract/tool';
import { CONTRACT_STATUS, DB_TYPE, MomentConf, TimeConf } from './enums';
// ---------------------------------------- import * from constant ----------------------------------------
import {
  CONTRACT_TYPE,
  CONTRACTILE_ONE_LINE_CHARACTERS,
  DEVISABLE_REMAINDER,
  HomeCareProductPriceMap,
  PRODUCT_LINE_NAME,
  QUOTATION_FORMS,
  RENEW_CONTRACT_IMG_PATH,
  RENEW_CONTRACT_FILE_PATH,
  SUBSCRIPTION_FORMS,
  SUBSCRIPTION_TEMPLATE_PATH,
  SUBSCRIPTION_FORM_FONTS_SETTING,
  PRODUCT_LINE_TYPE,
  MSJH_FONT_FILE_PATH,
  KAIU_FONT_FILE_PATH,
  QUOTATION_TEMPLATE_PATH,
  QUOTATION_FONTS_SETTING,
  DAYCARE_MEMBER_STAGE,
  DAYCARE_MEMBER_STAGE_FEE,
  SUBSCRIPTION_MAX_CHARACTER,
  QUOTATION_IMAGE_SETTING,
  MINIUM_TOLERATE_NUMBER,
  TOLERATE_RATE,
  HCAdditionalSubProductInfoMap
} from './renewContract/constant';
// ---------------------------------------- import * from enums ----------------------------------------
import { collectionEnums } from './renewContract/enums/collection_codes';
// ---------------------------------------- import * from report/renewContract/generateContracts ----------------------------------------
import { generateHomeCareTable } from './renewContract/generateHCQutationTable';
import { calculateDayCareMonthlyRent, generateDaycareTable } from './renewContract/generateDCQutationTable';
// ---------------------------------------- import * from tools/constant ----------------------------------------
import { EMPTY_ARRAY_LENGTH, EMPTY_STRING, OFFSET_ONE, ZERO_BASE_TO_ONE_BASE } from './constant';
// ---------------------------------------- function ----------------------------------------
/**
 * 計算報價單價格
 * @param {number} averageUse 平均使用人數
 * @param {number} previousMaxMembers 上一次合約人數
 * @returns {estimateMaxMembers: number, estimateContractType: number, estimateQuantity: number}
 */
function calculateQuotationPrice(
  averageUse: number,
  previousMaxMembers: number
): { estimateMaxMembers: number; estimateContractType: number; estimateQuantity: number } {
  // STEP_01 如果平均使用人數小於等於上一次合約人數，則返回上一次合約的人數
  // 5 是最小的容忍人數
  // STEP_01 判斷上一次合約的類型 (合約目前類型有 10人, 15人, 20人, 25人 為一個級距)
  const previousContractType = judgePreviousContractType(previousMaxMembers);

  // STEP_02 如果平均使用人數小於等於上一次合約人數*1.1(最小容忍值為 5，避免小機構容忍值過小)，則返回上一次合約的人數
  if (averageUse <= previousMaxMembers + Math.max(Math.ceil(previousMaxMembers * 0.1), MINIUM_TOLERATE_NUMBER)) {
    // 如果上一次合約的類型不是其他，則返回上一次合約的人數
    if (previousContractType !== CONTRACT_TYPE.OTHER) {
      return {
        estimateMaxMembers: previousMaxMembers,
        estimateContractType: previousContractType,
        estimateQuantity: previousMaxMembers / previousContractType
      };
    }
  }

  // STEP_02 更新合約類型為統一使用 15人 為一個級距
  const newContractType = CONTRACT_TYPE.FIFTEEN_MEMBERS_RANGE;
  // STEP_03 計算新的合約人數
  return {
    estimateMaxMembers: Math.ceil(averageUse / newContractType) * newContractType,
    estimateContractType: newContractType,
    estimateQuantity: Math.ceil(averageUse / newContractType)
  };
}

function generateAdditionalHtml(additionalProductName: string) {
  return `</tr><tr>
              <td style="text-align: center;"></td>
              <td colspan="6">${additionalProductName}</td>
          </tr>`;
}
/**
 * 判斷上一次合約的類型
 * @param {number} previousMaxMembers 上一次合約人數
 * @returns {number}
 */
function judgePreviousContractType(previousMaxMembers: number) {
  // STEP_01 如果上一次合約人數小於等於 10，則合約類型為 10
  if (previousMaxMembers === CONTRACT_TYPE.TEN_MEMBERS_RANGE) {
    return CONTRACT_TYPE.TEN_MEMBERS_RANGE;
  }
  // STEP_02 如果上一次合約人數小於等於 15，則合約類型為 15
  if (previousMaxMembers % CONTRACT_TYPE.FIFTEEN_MEMBERS_RANGE === DEVISABLE_REMAINDER) {
    return CONTRACT_TYPE.FIFTEEN_MEMBERS_RANGE;
  }

  // STEP_03 如果上一次合約人數小於等於 25，則合約類型為 25
  if (previousMaxMembers % CONTRACT_TYPE.TWENTY_FIVE_MEMBERS_RANGE === DEVISABLE_REMAINDER) {
    return CONTRACT_TYPE.TWENTY_FIVE_MEMBERS_RANGE;
  }

  // STEP_04 如果上一次合約人數小於等於 20，則合約類型為 20
  if (previousMaxMembers % CONTRACT_TYPE.TWENTY_MEMBERS_RANGE === DEVISABLE_REMAINDER) {
    return CONTRACT_TYPE.TWENTY_MEMBERS_RANGE;
  }

  // STEP_05 如果上一次合約人數無法匹配 10, 15, 20, 25 人級距，則合約類型為其他
  return CONTRACT_TYPE.OTHER;
}

/**
 * 產生報價單資料
 * @param {any} lunaDB lunaDB
 * @param {number} year 年份
 * @param {number} month 月份
 * @param {Array<{ siteId: string; contractType: number; quantity: number }>} specificSite 特定站
 * @returns
 */
export async function generateQuotationData(
  lunaDB: any,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1,
  specificSite?: {
    siteId: string;
    contractType: number;
    quantity: number;
    duration?: number;
    startDate?: string;
    endDate?: string;
    specificPrice?: number;
  }[]
) {
  const COMPAL_HEALTH_COMPANY_CODE = 'COMPAL_HEALTH';
  const quotationData: QUOTATION_FORMS[] = [];
  const subscriptionData: SUBSCRIPTION_FORMS[] = [];
  const genQuotationFailed: { siteId: string; reason: string }[] = [];
  // STEP_01.01 取得特條件的合約
  const renewContracts = await getContractsPlanedToRenew(lunaDB, month, year, specificSite);

  // STEP_01.02 取得超額資料
  const excessData = await lunaDB.collection(collectionEnums.REPORT_EXCESS).find({}).toArray();

  const additionContracts = await lunaDB.collection(collectionEnums.COMPANY_CONTRACT).find({ CS: '加購' }).toArray();
  // STEP_01.03 取得最新的 profile 資料
  const profileData = await getLatestProfile(lunaDB);
  // STEP_01.04 取得活動中的合約
  //  const activeContracts = await getActiveContracts(lunaDB);
  // STEP_01.05 取得使用銀行匯款的公司
  const companiesUsingBankBill = await getCompaniesUsingBankBill(lunaDB);
  // STEP_01.06 取得使用收據的公司
  const companiesUsingReceipt = await getCompaniesUsingReceipt(lunaDB);
  // STEP_01.07 取得客戶發票設定
  const customerInvoiceSettings = await getCustomerInvoiceSettings(lunaDB);
  // STEP_01.08 取得匯款資訊
  const remitInfos = await lunaDB
    .collection(collectionEnums.REMIT_INFO)
    .findOne({ companyCode: COMPAL_HEALTH_COMPANY_CODE });

  // STEP_02 逐一產生對應的合約的資料
  for (const renewContract of renewContracts) {
    // STEP_02.01 取得特定站的資料
    // STEP_02.02 如果有指定站的合約類型與數量，則使用指定的合約類型與數量
    const specificSiteData = specificSite ? specificSite.find((site) => site.siteId === renewContract.ID) : undefined;
    const specificContractType = specificSiteData ? specificSiteData.contractType : undefined;
    const specificQuantity = specificSiteData ? specificSiteData.quantity : undefined;
    const specificStartDate = specificSiteData?.startDate ? specificSiteData.startDate : renewContract.startDate;
    const specificEndDate = specificSiteData?.endDate ? specificSiteData.endDate : renewContract.endDate;
    const contractDuration = moment(specificEndDate).diff(moment(specificStartDate), TimeConf.MONTH) + OFFSET_ONE;
    const specificMaxMembers = specificSiteData
      ? specificSiteData.quantity * (specificSiteData.contractType ?? CONTRACT_TYPE.OTHER)
      : CONTRACT_TYPE.OTHER;
    // STEP_02.03 取得超額資料
    const excessDatum = excessData.find((excess: any) => excess.siteId === renewContract.ID);
    // STEP_02.04 取得最新的 profile 資料
    const profileDatum = profileData.find((profile: any) => profile._id === renewContract.ID);
    // STEP_02.05 取得客戶發票設定資料
    const customerInvoiceSetting = customerInvoiceSettings.find(
      (customerInvoiceSetting: any) => customerInvoiceSetting.siteId === renewContract.ID
    );
    const additionContract = additionContracts.find(
      (additionContract: any) =>
        additionContract.ID === renewContract.ID &&
        additionContract.CS === '加購' &&
        additionContract.ST === CONTRACT_STATUS.ACTIVE &&
        !/(個案收據套印|銀行繳費單|加購-個案收據、銀行繳費單)/.test(
          additionContract.contractContent[0].context || EMPTY_STRING
        )
    );

    const reason: string[] = [];
    // STEP_02.06 如果有任何原因，記錄錯誤並跳過此合約
    if (!profileDatum) {
      reason.push('profileDatum not found');
    }
    if (!renewContract) {
      reason.push('activeContract not found');
    }

    // STEP_02.06 如果有任何原因，記錄錯誤並跳過此合約
    if (reason.length > EMPTY_ARRAY_LENGTH) {
      genQuotationFailed.push({ siteId: renewContract.ID, reason: reason.join(', ') });
      continue;
    }

    let quotation: QUOTATION_FORMS;
    const contractTitle =
      customerInvoiceSetting?.invoiceTitle || profileDatum.contractTitle || profileDatum.invoiceTitle;
    //----------------------------------------------------------------------------
    // STEP_02.07 產生居服系統報價單
    if (renewContract.PL === PRODUCT_LINE_TYPE.HOME_CARE) {
      // STEP_02.07.01 計算報價單 (合約人數, 合約類型, 合約數量)
      const { estimateMaxMembers, estimateContractType, estimateQuantity } = calculateQuotationPrice(
        excessDatum?.averageNumbers,
        renewContract.maxMembers
      );

      // STEP_02.07.02 若有指定合約類型與數量，則使用指定的合約類型與數量，否則使用預估的合約類型與數量
      const maxMembers =
        specificContractType && specificQuantity ? specificQuantity * specificContractType : estimateMaxMembers;
      // STEP_02.07.03 若有指定合約類型與數量，則使用指定的合約類型與數量，否則使用預估的合約類型與數量
      const contractType = specificContractType || estimateContractType;
      // STEP_02.07.04 若有指定合約類型與數量，則使用指定的合約類型與數量，否則使用預估的合約類型與數量
      const quantity = specificQuantity || estimateQuantity;
      // STEP_02.07.05 計算最大容忍人數
      const tolerateMembers = Math.floor(maxMembers * TOLERATE_RATE);
      // STEP_02.07.06 根據合約類型取得一階段費用
      const oneStageFee = HomeCareProductPriceMap.get(CONTRACT_TYPE[contractType]).HBA001;
      // STEP_02.07.07 檢查是有加購銀行匯款或收據
      const additionalProducts: { price: number; html: string }[] = [];
      if (companiesUsingBankBill.has(renewContract.ID)) {
        additionalProducts.push({
          price: HCAdditionalSubProductInfoMap.get('HAC001')?.price ?? 0,
          html: HCAdditionalSubProductInfoMap.get('HAC001')?.html ?? ''
        });
      }
      // 公司收據用印
      if (companiesUsingReceipt.has(renewContract.ID)) {
        additionalProducts.push({
          price: HCAdditionalSubProductInfoMap.get('HAL001')?.price ?? 0,
          html: HCAdditionalSubProductInfoMap.get('HAL001')?.html ?? ''
        });
      }
      //
      if (additionContract) {
        additionalProducts.push({
          price: additionContract?.monthlyRent || 0,
          html: generateAdditionalHtml(additionContract?.contractContent[0].context || EMPTY_STRING)
        });
      }

      // STEP_02.08.01 產生居家服務系統報價單表格
      const quotationTablePath = await generateHomeCareTable(
        quantity,
        contractType,
        additionalProducts,
        path.join(process.cwd(), RENEW_CONTRACT_IMG_PATH, `${renewContract.ID}.jpg`),
        contractDuration
      );

      quotation = {
        productLine: PRODUCT_LINE_NAME.get(renewContract.PL) || EMPTY_STRING,
        contractTitle: addChangeLineSymbol(contractTitle, CONTRACTILE_ONE_LINE_CHARACTERS),
        quotationTable: quotationTablePath,
        year: moment().year(),
        maxMembers,
        startDate1: moment(specificStartDate).format(MomentConf.ChineseYearMonthDay),
        endDate1: moment(specificEndDate).format(MomentConf.ChineseYearMonthDay),
        quotationValidDate: moment().add(29, TimeConf.DAY).format(MomentConf.ChineseYearMonthDay),
        startDate2: moment(specificStartDate).format(MomentConf.ChineseYearMonthDay),
        endDate2: moment(specificEndDate).format(MomentConf.ChineseYearMonthDay),
        numericalRange: contractType,
        maxMembers2: maxMembers,
        tolerateMembers,
        oneStageFee,
        overAllowableThreshold: tolerateMembers + 1,
        stageMax: (quantity + 1) * contractType,
        nextMonthlyRent: HomeCareProductPriceMap.get(CONTRACT_TYPE[contractType]).HBA001 * (quantity + 1),
        nextStageFee: HomeCareProductPriceMap.get(CONTRACT_TYPE[contractType]).HBA001 * (quantity + 2),
        nextStageMin: (quantity + 1) * contractType + 1,
        nextStageMax: (quantity + 2) * contractType,
        filePath: path.join(
          process.cwd(),
          RENEW_CONTRACT_FILE_PATH,
          `${year}-${month}-${renewContract.PL}`,
          `${renewContract.ID}${contractTitle}報價單.pdf`
        )
      };
      // STEP_02.09 產生日照系統報價單
    } else {
      // STEP_029.01 計算報價單 (合約人數, 合約類型, 合約數量)
      const maxMembers =
        specificMaxMembers || Math.floor(renewContract.maxMembers / DAYCARE_MEMBER_STAGE) * DAYCARE_MEMBER_STAGE;
      // STEP_02.09.02 計算最大容忍人數
      const tolerateMembers = Math.floor(maxMembers * TOLERATE_RATE);
      // STEP_02.09.03 取得一階段費用
      const oneStageFee = DAYCARE_MEMBER_STAGE_FEE;
      // STEP_02.09.04 產生日照系統報價單表格
      const quotationTablePath = await generateDaycareTable(
        path.join(process.cwd(), RENEW_CONTRACT_IMG_PATH, `${renewContract.ID}.jpg`),
        contractDuration,
        maxMembers,
        specificSiteData?.specificPrice
      );
      // STEP_02.09.05 根據合約人數計算下一階段的月租金
      const { monthlyRent } = calculateDayCareMonthlyRent(maxMembers, contractDuration);
      // STEP_02.09.06 組合報價單資料
      quotation = {
        productLine: PRODUCT_LINE_NAME.get(renewContract.PL) || '',
        contractTitle: addChangeLineSymbol(contractTitle, CONTRACTILE_ONE_LINE_CHARACTERS),
        quotationTable: quotationTablePath,
        year: moment().year(),
        maxMembers,
        startDate1: moment(specificStartDate).format(MomentConf.ChineseYearMonthDay),
        endDate1: moment(specificEndDate).format(MomentConf.ChineseYearMonthDay),
        quotationValidDate: moment().add(29, TimeConf.DAY).format(MomentConf.ChineseYearMonthDay),
        startDate2: moment(specificStartDate).format(MomentConf.ChineseYearMonthDay),
        endDate2: moment(specificEndDate).format(MomentConf.ChineseYearMonthDay),
        numericalRange: maxMembers,
        maxMembers2: maxMembers,
        tolerateMembers,
        oneStageFee,
        overAllowableThreshold: tolerateMembers + 1,
        stageMax: maxMembers + DAYCARE_MEMBER_STAGE,
        nextMonthlyRent: monthlyRent + DAYCARE_MEMBER_STAGE_FEE,
        nextStageFee: monthlyRent + DAYCARE_MEMBER_STAGE_FEE + DAYCARE_MEMBER_STAGE_FEE,
        nextStageMin: maxMembers + DAYCARE_MEMBER_STAGE + 1,
        nextStageMax: maxMembers + DAYCARE_MEMBER_STAGE + DAYCARE_MEMBER_STAGE + 1,
        filePath: path.join(
          process.cwd(),
          RENEW_CONTRACT_FILE_PATH,
          `${year}-${month}-${renewContract.PL}`,
          `${renewContract.ID}${contractTitle}報價單.pdf`
        )
      };
    }
    //----------------------------------------------------------------------------
    const subscription: SUBSCRIPTION_FORMS = {
      checkBoxHC: renewContract.PL === PRODUCT_LINE_TYPE.HOME_CARE,
      checkBoxDC: renewContract.PL === PRODUCT_LINE_TYPE.DAY_CARE,
      contractTitle1: addChangeLineSymbol(contractTitle, 31),
      duration1: `${moment(specificStartDate).format(MomentConf.ChineseYearMonthDay)}至${moment(specificEndDate).format(
        MomentConf.ChineseYearMonthDay
      )}`,
      contractTitle2: addChangeLineSymbol(
        `本訂閱合約係由仁寶健康科技股份有限公司(以下稱「仁寶健康科技」或「本公司」)與 ${contractTitle}  長照機構( 以下均稱「貴用戶」) 間所共同成立之合約。雙方為仁寶 i 照護系統產品（以下簡稱「產品」）使用事宜訂立本合約書，互守條款如下。`,
        SUBSCRIPTION_MAX_CHARACTER
      ),
      compalAccountName: remitInfos.accountName,
      bankName: remitInfos.bankName,
      bankAddress: remitInfos.bankAddress,
      bandCode: `${remitInfos.bankCode}${remitInfos.branchCode}`,
      virtualAccount: profileDatum.virtualAccount,
      duration2: `${moment(specificStartDate).format(MomentConf.ChineseYearMonthDay)}至${moment(specificEndDate).format(
        MomentConf.ChineseYearMonthDay
      )}`,
      representative: EMPTY_STRING,
      address: EMPTY_STRING,
      taxID: customerInvoiceSetting?.taxID || profileDatum.taxID || EMPTY_STRING,
      representativeTitle: '',
      invoiceWindowManager: customerInvoiceSetting?.contactPerson || EMPTY_STRING,
      invoiceWindowMail: customerInvoiceSetting?.contactEmail || EMPTY_STRING,
      invoiceWindowPhone: customerInvoiceSetting?.contactPhone || EMPTY_STRING,
      shippingAddress: customerInvoiceSetting?.invoiceAddress || EMPTY_STRING,
      invoiceTitle: addChangeLineSymbol(
        customerInvoiceSetting?.invoiceTitle || profileDatum.invoiceTitle || EMPTY_STRING,
        30
      ),
      filePath: path.join(
        process.cwd(),
        RENEW_CONTRACT_FILE_PATH,
        `${year}-${month}-${renewContract.PL}`,
        `${renewContract.ID}${contractTitle}訂閱合約.pdf`
      )
    };
    subscriptionData.push(subscription);
    quotationData.push(quotation);
  }

  console.log('genQuotationFailed', genQuotationFailed);
  return { quotationData, subscriptionData };
}
/**
 * 填寫表單欄位
 * @param {QUOTATION_FORMS[]} quotationData 報價單資料
 * @param {string} templatePath 模板路徑
 * @param {Map<string, any>} formFontSetting 字體設定
 * @param {string} fontsPath 字體路徑
 */
async function fillFormFields(
  quotationData: any[],
  templatePath: string,
  formFontSetting: Map<string, any>,
  fontsPath: string = MSJH_FONT_FILE_PATH
) {
  // STEP_01 讀取字體檔案
  const fontBytes = fs.readFileSync(fontsPath);
  const originalPdfBytes = fs.readFileSync(templatePath);

  // STEP_02 逐一填寫表單欄位
  for (const quotation of quotationData) {
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fonts: { [key: string]: any } = {};
    fonts.msjh = await pdfDoc.embedFont(fontBytes, { subset: true });
    const form = pdfDoc.getForm();
    const tableRegExp = /table/i;
    const checkBoxExp = /checkBox/i;
    const changeLineExp = /\n/i;
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    for (const key in quotation) {
      const fontSetting: any = formFontSetting.get(key) || formFontSetting.get('default');
      let fontSize = fontSetting.size;
      let targetKey = key;
      if (key === 'filePath') {
        continue;
      }

      // STEP_02 如果 Key 符合 table 的正則表達式，則插入圖片
      if (tableRegExp.test(key)) {
        // STEP_02.01 取得報價單圖片路徑
        const imagePath = quotation[key as keyof QUOTATION_FORMS] as string;
        const pngImage = await pdfDoc.embedPng(imagePath);
        firstPage.drawImage(pngImage, {
          x: QUOTATION_IMAGE_SETTING.x,
          y: QUOTATION_IMAGE_SETTING.y,
          width: QUOTATION_IMAGE_SETTING.width,
          height: QUOTATION_IMAGE_SETTING.height
        });
        continue;
      }

      if (checkBoxExp.test(key)) {
        if (quotation[key as keyof QUOTATION_FORMS] === false) {
          continue;
        }
        const field = form.getCheckBox(key);
        field.check();
        continue;
      }
      if (changeLineExp.test(quotation[key])) {
        if (fontSetting.maxCharacters && fontSetting.maxCharacters < quotation[key].length) {
          //  fonts.maxCharacters = quotation[key].length
          fontSize = Math.ceil((fontSetting.maxCharacters / quotation[key].length) * fontSetting.size) - 1;
        }
        targetKey = `${key}MultiLine`;
      }
      const field = form.getTextField(targetKey);
      if (!field) {
        console.log(`Field "${key}" does not exist in｛ the PDF form.`);
        continue;
      }
      field.setText(String(quotation[key as keyof QUOTATION_FORMS]));
      field.setFontSize(fontSize || 9);
      console.log(TextAlignment[fontSetting.align]);
      field.setAlignment(TextAlignment[fontSetting.align] as any);
      field.updateAppearances(fonts.msjh); // 確保使用正確的字體更新外觀
    }

    form.getFields().forEach((formField) => formField.enableReadOnly());
    const pdfBytes = await pdfDoc.save(); // 儲存PDF
    if (!fs.existsSync(path.dirname(quotation.filePath))) {
      await fs.mkdirSync(path.dirname(quotation.filePath), { recursive: true });
    }
    await fs.promises.writeFile(quotation.filePath, pdfBytes);
	return quotation.filePath
  }
}
/**
 * 主程式
 * @returns {Promise<void>}
 */
export async function generateContract(
  siteId: string,
  contractType: number,
  quantity: number,
  duration: number,
  startDate: string ,
  endDate: string,
  specificPrice: number,
) {
  const nodeEnv = process.env.NODE_ENV || DB_TYPE.PROD;
  // STEP_01 DB 連線
  const lunaDB = await db.getLunaWebDB(nodeEnv as DB_TYPE);
  // STEP_02 產生指定站的報價單和訂閱合約資訊
  // (siteId, contractType, quantity) contractType = 0 和 quantity = 0 代表使用預估的合約類型與數量
  const { quotationData, subscriptionData } = await generateQuotationData(lunaDB, undefined, undefined, [
    {
      siteId,
      contractType,
      quantity,
      duration,
      startDate,
      endDate,
      specificPrice
    }
  ]);
  //(25-05-01~27-04-30)
  // STEP_02 產生指定月份的報價單和訂閱合約資訊
  //  const { quotationData, subscriptionData } = await generateQuotationData(lunaDB, specificYear, specificMonth, []);
  // STEP_03 填寫報價單表單欄位
  const quotationOutputPath = await fillFormFields(quotationData, path.join(process.cwd(), QUOTATION_TEMPLATE_PATH), QUOTATION_FONTS_SETTING);
  // STEP_04 填寫訂閱合約表單欄位
  let contractOutputPath = await fillFormFields(
    subscriptionData,
    path.join(process.cwd(), SUBSCRIPTION_TEMPLATE_PATH),
    SUBSCRIPTION_FORM_FONTS_SETTING,
    KAIU_FONT_FILE_PATH
  );
  console.log('Quotation PDFs generated successfully');
  // STEP_04 關閉 DB 連線
  console.log('Contract generated successfully:', contractOutputPath);
  await db.closeDatabase();
  return { quotationOutputPath:path.relative(
    path.join(process.cwd(), 'renewContract', 'files'),
    quotationOutputPath
  ),
	 contractOutputPath:path.relative(
    path.join(process.cwd(), 'renewContract', 'files'),
    contractOutputPath
  ) };
}
async function generateMonthContract(
  specificMonth: number = new Date().getMonth() + ZERO_BASE_TO_ONE_BASE,
  specificYear: number = new Date().getFullYear()
) {
  const nodeEnv = process.env.NODE_ENV || DB_TYPE.UAT;
  // STEP_01 DB 連線
  const lunaDB = await db.getLunaWebDB(nodeEnv as DB_TYPE);
  // STEP_02 產生指定站的報價單和訂閱合約資訊
  // (siteId, contractType, quantity) contractType = 0 和 quantity = 0 代表使用預估的合約類型與數量
  const { quotationData, subscriptionData } = await generateQuotationData(lunaDB, undefined, undefined, [
    {
      siteId: '2400266-H-01',
      contractType: 15,
      quantity: 1,
      duration: 0,
      startDate: '2025-10-01',
      endDate: '2027-09-30',
      specificPrice: 0
    }
  ]);
  //(25-05-01~27-04-30)
  // STEP_02 產生指定月份的報價單和訂閱合約資訊
  //  const { quotationData, subscriptionData } = await generateQuotationData(lunaDB, specificYear, specificMonth, []);
  // STEP_03 填寫報價單表單欄位
  await fillFormFields(quotationData, path.join(process.cwd(), QUOTATION_TEMPLATE_PATH), QUOTATION_FONTS_SETTING);
  // STEP_04 填寫訂閱合約表單欄位
  await fillFormFields(
    subscriptionData,
    path.join(process.cwd(), SUBSCRIPTION_TEMPLATE_PATH),
    SUBSCRIPTION_FORM_FONTS_SETTING,
    KAIU_FONT_FILE_PATH
  );
  console.log('Quotation PDFs generated successfully');
  // STEP_04 關閉 DB 連線
  await db.closeDatabase();
}
//if (require.main === module) generateMonthContract(6, 2025);
