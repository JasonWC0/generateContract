import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import { generateContract } from './generateContract';

const app = express();
const port = 3000; // 或你要改成 8082

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 👉 指定靜態檔案資料夾
app.use(express.static(path.join(__dirname, 'public'))); // 這裡的 public 要改成你放 index.html 的資料夾

// 👉 顯示首頁 index.html
app.get('/', (_req, res) => {
  const indexPath = path.join(__dirname, 'index.html'); // 改成你 index.html 實際路徑
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('❌ 找不到 index.html');
  }
});

app.post('/createContract', async (req, res) => {
  try {
    const { siteId, contractType, quantity, duration, startDate, endDate, specificPrice } = req.body;
    const { quotationOutputPath, contractOutputPath } = await generateContract(siteId, contractType, quantity, duration, startDate, endDate, specificPrice);
    console.log('quotationOutputPath', quotationOutputPath);
    console.log('contractOutputPath', contractOutputPath);
    //res.json({ message: '✅ 合約與報價單已成功產生！', downloadUrl: `/download/${encodeURIComponent(quotationOutputPath)}` });
	res.json({
	  message: '✅ 合約與報價單已成功產生！',
	  quotationDownloadUrl: `/download/${encodeURIComponent(quotationOutputPath)}`,
	  contractDownloadUrl: `/download/${encodeURIComponent(contractOutputPath)}`
	});
  } catch (err: any) {
    res.status(500).json({ error: err.message || '伺服器內部錯誤' });
  }
});

// 👉 提供檔案下載
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'renewContract/files', req.params.filename); // 'output' 改成你產生 PDF 的資料夾
  res.download(filePath);
});

app.listen(port, () => {
  console.log(`🚀 Server 已啟動：http://localhost:${port}`);
});
