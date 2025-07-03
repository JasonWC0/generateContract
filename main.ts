import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { generateContract } from './generateContract'; // 你自己的邏輯模組

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// ✅ 靜態開放 renewContract/files 底下所有 PDF 檔案
app.use('/download', express.static(path.join(process.cwd(), 'renewContract', 'files')));

app.post('/createContract', async (req:any, res:any, next) => {
  const {
    siteId,
    contractType,
    quantity,
    duration,
    startDate,
    endDate,
    specificPrice,
    encryptKey, // <== 來自前端密碼欄位
  } = req.body;

  if (!encryptKey) {
    return res.status(400).json({ error: '缺少 encryptKey' });
  }

  try {
    // ✅ 將 encryptKey 寫入 .env（覆蓋寫入）
    const envPath = path.join(process.cwd(), '.env');
    const content = `DB_ENCRYPT_KEY=${encryptKey}\n`;
    await fs.writeFile(envPath, content, 'utf8');

    // ✅ 呼叫 generateContract 並取得相對路徑
    const relativePath = await generateContract(
      siteId,
      Number(contractType),
      Number(quantity),
      Number(duration),
      startDate,
      endDate,
      Number(specificPrice)
    );

    const filename = path.basename(relativePath);
    const subfolder = path.dirname(relativePath);
    const encodedFilename = encodeURIComponent(filename);
    const downloadUrl = `http://localhost:${port}/download/${subfolder}/${encodedFilename}`;

    res.json({
      message: '✅ 合約與報價單已成功產生，金鑰也已更新！',
      downloadUrl
    });

  } catch (err: any) {
    console.error('❌ 發生錯誤:', err);
    res.status(500).json({ error: err.message || '伺服器錯誤' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server 已啟動：http://localhost:${port}`);
});
