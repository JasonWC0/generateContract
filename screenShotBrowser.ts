/**
 * FeaturePath: 自動報表產製-工具庫-通用工具-GCP 工具
 * Accountable: Jason Kao, Shane Yu
 */

// ---------------------------------------- import * from node_modules ----------------------------------------
import puppeteer from 'puppeteer';
import { videoStandardHeight, videoStandardWidth } from './constant';

// ---------------------------------------- export function ----------------------------------------
/**
 * 截取網頁畫面
 * @param {string} url 網址
 * @param {string} output_path 輸出路徑
 * @param {string} width 擷取網頁寬度
 * @param {string} height 擷取網頁高度
 * @returns
 */
export async function screenShotBrowser(
  url: string,
  output_path: string,
  width = videoStandardWidth,
  height = videoStandardHeight
) {
  try {
    // STEP_01: 啟動瀏覽器
    const browser = await puppeteer.launch(
      { headless: 'new' } // 使用新的 Headless 模式
    );
    // STEP_02: 開啟新分頁
    const page = await browser.newPage();
    // STEP_03: 設定瀏覽器視窗大小
    await page.setViewport({ width: Number(width), height: Number(height) });
    // STEP_04: 前往網址
    await page.goto(url, { waitUntil: 'networkidle0' });
    // STEP_05: 截取網頁畫面
    await page.screenshot({ path: output_path });
    // STEP_06: 關閉瀏覽器
    await browser.close();
  } catch (error) {
    console.error('Error capturing webpage:', error);
    return false;
  }
}

export async function screenShotHtml(
  html: string,
  output_path: string,
  width = videoStandardWidth,
  height = videoStandardHeight
) {
  try {
    // STEP_01: 啟動瀏覽器
    console.log('screenShotHtml');
    const browser = await puppeteer.launch(
      { headless: 'new' } // 使用新的 Headless 模式
    );
    // STEP_02: 開啟新分頁
    const page = await browser.newPage();
    // STEP_03: 設定瀏覽器視窗大小
    await page.setViewport({ width, height });
    // STEP_04: 設定 HTML 內容
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // STEP_05: 截取網頁畫面
    await page.screenshot({ path: output_path });
    // STEP_06: 關閉瀏覽器
    await browser.close();
    return output_path;
  } catch (error) {
    console.error('Error capturing HTML:', error);
    return false;
  }
}

export async function screenshotTable(html: string, filePath: string) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // 設置頁面內容
  await page.setContent(html);
  // 設置頁面解析度
  await page.setViewport({
    width: 1920 / 2.5, // 寬度 (像素)
    height: 1080 / 2.5, // 高度 (像素)
    deviceScaleFactor: 2 // 調整縮放比例（高於1會提高解析度）
  });
  // 選擇 table 元素
  const element = await page.$('table');

  if (element) {
    // 對選擇的 table 元素進行截圖
    await element.screenshot({ path: filePath });
    console.log('Screenshot saved:', filePath);
  } else {
    console.error('Table element not found');
  }

  await browser.close();
}

export async function screenshotTableBuffer(html: string): Promise<Buffer | null> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 設置頁面解析度
  await page.setViewport({
    width: 1920 / 2.5, // 寬度 (像素)
    height: 1080 / 2.5, // 高度 (像素)
    deviceScaleFactor: 2 // 調整縮放比例（高於1會提高解析度）
  });

  // 設置頁面內容
  await page.setContent(html);

  // 選擇 table 元素
  const element = await page.$('table');

  if (element) {
    // 對選擇的 table 元素進行截圖，並返回 Base64 格式的結果
    const base64String = await element.screenshot({ encoding: 'base64' });

    if (typeof base64String === 'string') {
      const buffer = Buffer.from(base64String, 'base64');
      console.log('Screenshot taken.');

      await browser.close();
      return buffer;
    } else {
      console.error('Unexpected result: base64String is not a string.');
      await browser.close();
      return null;
    }
  } else {
    console.error('Table element not found');
    await browser.close();
    return null;
  }
}
