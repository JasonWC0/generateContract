import express from 'express';
import cors from 'cors';
import path from 'path';
import { generateContract } from './generateContract'; // 你自己的邏輯模組

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// ✅ 靜態開放 renewContract/files 底下所有 PDF 檔案
app.use('/download', express.static(path.join(process.cwd(), 'renewContract', 'files')));

app.post('/createContract', async (req, res) => {
  const {
    siteId,
    contractType,
    quantity,
    duration,
    startDate,
    endDate,
    specificPrice,
  } = req.body;

  try {
    // ✅ 呼叫 generateContract 並取得相對路徑（範例：2025-7-H/xxx.pdf）
    const relativePath = await generateContract(
      siteId,
      Number(contractType),
      Number(quantity),
      Number(duration),
      startDate,
      endDate,
      Number(specificPrice)
    );

    // ✅ 拆出檔名與資料夾
    const filename = path.basename(relativePath);           // e.g. 檔名.pdf
    const subfolder = path.dirname(relativePath);           // e.g. 2025-7-H
    const encodedFilename = encodeURIComponent(filename);   // 編碼中文檔名

    // ✅ 組成前端可用的下載連結
    const downloadUrl = `http://localhost:${port}/download/${subfolder}/${encodedFilename}`;

    res.json({
      message: '✅ 合約與報價單已成功產生！',
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
