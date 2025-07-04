import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import { generateContract } from './generateContract';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// 👉 靜態檔案，例如 index.html, robot-banner.png 等
app.use(express.static(path.join(__dirname, 'public')));

// 👉 首頁 index.html
app.get('/', (_req, res) => {
  const indexPath = path.join(__dirname, 'public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('❌ 找不到 index.html');
  }
});

app.post('/createContract', async (req, res) => {
  try {
    const {
      siteId, contractType, quantity,
      duration, startDate, endDate, specificPrice
    } = req.body;

    const { quotationOutputPath, contractOutputPath } = await generateContract(
      siteId, contractType, quantity, duration, startDate, endDate, specificPrice
    );

    // ✅ 改這裡：只取純檔名，不含路徑
    const quotationFileName = path.basename(quotationOutputPath);
    const contractFileName = path.basename(contractOutputPath);

    res.json({
      message: '✅ 合約與報價單已成功產生！',
      quotationDownloadUrl: `/download/${encodeURIComponent(quotationFileName)}`,
      contractDownloadUrl: `/download/${encodeURIComponent(contractFileName)}`
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message || '伺服器內部錯誤' });
  }
});

// 👉 檔案下載服務
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'renewContract/files', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('❌ 找不到檔案');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server 已啟動：http://localhost:${port}`);
});
