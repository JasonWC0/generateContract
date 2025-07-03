// ---------------------------------------- import * from tools ----------------------------------------
import { collectionEnums } from './enums/collection_codes';
import { CONTRACT_PROCESS_STATUS, CONTRACT_STATUS, TimeConf } from '../enums';
import moment from 'moment';
/**
 * 取得指定月份的續約合約
 * @param {any} lunaDB  lunaDB
 * @param {number} month 月份
 * @param {string} contractParty 合約方
 * @returns
 */
export async function getContractsPlanedToRenew(
  lunaDB: any,
  month: number,
  year: number = new Date().getFullYear(),
  siteIds?: {
    siteId: string;
    contractType: number;
    quantity: number;
    duration?: number;
    startDate?: string;
    endDate?: string;
  }[]
): Promise<any[]> {
  // 定義查詢條件
  const contractQuery = siteIds?.length
    ? [
        {
          $match: {
            ID: { $in: siteIds.map((site) => site.siteId) },
            ST: { $in: [CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.PLANNED_RENEWAL] }
          }
        },
        {
          $sort: { ST: 1 } // 優先排序：A -> X -> R
        },
        {
          $group: {
            _id: '$ID',
            doc: { $first: '$$ROOT' } // 取第一筆（優先順序最高）
          }
        },
        {
          $replaceRoot: { newRoot: '$doc' } // 將結果展平
        }
      ]
    : [
        {
          $addFields: {
            adjustedEndDate: {
              $add: ['$endDate', TimeConf.UTC_OFFSET * TimeConf.ONE_HOUR]
            }
          }
        },
        {
          $match: {
            ST: CONTRACT_STATUS.ACTIVE,
            $expr: {
              $and: [{ $eq: [{ $month: '$adjustedEndDate' }, month] }, { $eq: [{ $year: '$adjustedEndDate' }, year] }]
            }
          }
        }
      ];

  // STEP_01: 查詢過期合約
  const overDueContracts = await lunaDB.collection(collectionEnums.COMPANY_CONTRACT).aggregate(contractQuery).toArray();

  // 查詢所有未來合約，並將其儲存在 Map 中，根據 ID 快速查找
  const futureContractsMap = new Map(
    (
      await lunaDB.collection(collectionEnums.COMPANY_CONTRACT).find({ ST: CONTRACT_STATUS.PLANNED_RENEWAL }).toArray()
    ).map((contract: any) => [contract.ID, contract])
  );

  // STEP_02: 處理合約資料
  const newContracts = overDueContracts.map((contract: any) => {
    // 查找對應的未來合約，若無則使用當前合約
    const futureContract = futureContractsMap.get(contract.ID) || contract;

    // 根據網站設定獲取合約的持續時間
    const specificSite = siteIds?.find((site) => site.siteId === futureContract.ID);
    const duration = specificSite?.duration
      ? specificSite.duration
      : Math.max(Math.round(futureContract.period / TimeConf.YEAR_MONTH) * TimeConf.YEAR_MONTH, 1);

    // 調整起始日期：將結束日期加上 UTC 偏移並設為下個月的開始
    const adjustedStartDate = moment(futureContract.startDate).utcOffset(TimeConf.UTC_OFFSET).startOf('month').toDate();

    // 計算調整後的結束日期，基於持續時間
    const adjustedEndDate = moment(adjustedStartDate)
      .add(duration - 1, 'months') // duration 可能為 0，需確保最小為 1
      .endOf('month')
      .toDate();

    // 計算下個月的起始日期
    const nextMonthStartDate = moment().add(1, 'month').startOf('month').toDate();

    // 返回處理後的合約資料
    return {
      ...futureContract,
      startDate: adjustedStartDate,
      endDate: adjustedEndDate,
      duration,
      maxMembers: contract.maxMembers,
      nextMonthStartDate
    };
  });
  // STEP_03: 回傳結果
  return newContracts;
}

/**
 * 取得最新的 Profile 資料
 * @param {string} siteId
 * @returns {Promise<any>}
 */
export async function getLatestProfile(lunaDB: any): Promise<any> {
  const result = await lunaDB
    .collection(collectionEnums.PROFILE)
    .aggregate([
      // 將 histories 展開成多筆資料
      { $unwind: '$histories' },
      // 以 siteId 進行分組，並取每組內 startAt 最大的那一筆資料
      { $sort: { 'histories.startAt': -1 } },
      {
        $group: {
          _id: '$siteId', // 分組的依據是 siteId
          // 取出每組中最新的 histories 的各欄位
          startAt: { $first: '$histories.startAt' },
          taxID: { $first: '$histories.taxID' },
          siteShortname: { $first: '$histories.siteShortname' },
          siteName: { $first: '$histories.siteName' },
          contractTitle: { $first: '$histories.contractTitle' },
          invoiceTitle: { $first: '$histories.invoiceTitle' },
          virtualAccount: { $first: '$histories.virtualAccount' }
        }
      }
    ])
    .toArray();

  // 回傳每個 siteId 最新的歷史資料
  return result;
}

/**
 * 取得最新的 Profile 資料
 * @param {string} siteId
 * @returns {Promise<any>}
 */
export async function getActiveContracts(lunaDB: any): Promise<any> {
  const result = await lunaDB
    .collection(collectionEnums.COMPANY_CONTRACT)
    .aggregate([
      { $sort: { startDate: -1 } },
      { $match: { ST: CONTRACT_STATUS.ACTIVE, CS: CONTRACT_PROCESS_STATUS.Y } },
      {
        $group: {
          _id: '$ID',
          latestContract: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: '$latestContract'
        }
      }
    ])
    .toArray();

  // 回傳每個 siteId 最新的歷史資料
  return result;
}

/**
 * 取得前一份合約資料
 * @param {string} siteId
 * @returns {Promise<any>}
 */
export async function getPreviousContracts(lunaDB: any): Promise<any> {
  const result = await lunaDB
    .collection(collectionEnums.COMPANY_CONTRACT)
    .aggregate([
      // 以 siteId 進行分組，並取每組內 startAt 最大的那一筆資料
      { $sort: { 'histories.startAt': -1 } },
      {
        $group: {
          _id: '$siteId', // 分組的依據是 siteId
          // 取出每組中最新的 histories 的各欄位
          startAt: { $first: '$histories.startAt' },
          taxID: { $first: '$histories.taxID' },
          siteShortname: { $first: '$histories.siteShortname' },
          siteName: { $first: '$histories.siteName' },
          contractTitle: { $first: '$histories.contractTitle' },
          invoiceTitle: { $first: '$histories.invoiceTitle' },
          virtualAccount: { $first: '$histories.virtualAccount' }
        }
      }
    ])
    .toArray();

  // 回傳每個 siteId 最新的歷史資料
  return result;
}

export async function getCompaniesUsingReceipt(lunaDB: any): Promise<Set<string>> {
  const receiptSettings = await lunaDB
    .collection(collectionEnums.RECEIPT_SETTING)
    .aggregate([
      {
        $match: { reportType: 'CaseReceipt', valid: true, pos: { $ne: '${qrcode}' }, contentType: 'picture' }
      },
      {
        $group: {
          _id: '$companyId'
        }
      },
      {
        $lookup: {
          from: collectionEnums.COMPANY,
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          siteId: '$company.siteId'
        }
      }
    ])
    .toArray();

  return new Set(receiptSettings.map((receiptSetting: any) => receiptSetting.siteId));
}

export async function getCompaniesUsingBankBill(lunaDB: any): Promise<Set<string>> {
  const companies = await lunaDB
    .collection(collectionEnums.COMPANY)
    .find({ customerReportList: { $elemMatch: { $regex: /bankbill/i } } })
    .toArray();

  return new Set(companies.map((company: any) => company.siteId));
}

export function addChangeLineSymbol(wording: string, oneLineCharacters: number): string {
  let line = '';
  let count = 0;
  for (const char of wording) {
    if (count >= oneLineCharacters) {
      line += '\n';
      count = 0;
    }
    line += char;
    count++;
  }
  return line;
}

export async function getCustomerInvoiceSettings(lunaDB: any): Promise<any> {
  const receiptSettings = await lunaDB
    .collection(collectionEnums.CUSTOMER_INVOICE_SETTING)
    .aggregate([
      {
        $lookup: {
          from: collectionEnums.COMPANY,
          localField: 'companyCode',
          foreignField: 'code',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          siteId: '$company.siteId',
          contactCellPhone: 1,
          contactEmail: 1,
          companyCode: 1,
          contactExt: 1,
          contactPerson: 1,
          contactPhone: 1,
          createTime: 1,
          invoiceAddress: 1,
          invoiceTitle: 1,
          modifyTime: 1,
          payDay: 1,
          taxID: 1,
          updateAt: 1,
          isChecked: 1
        }
      }
    ])
    .toArray();
  return receiptSettings;
}
