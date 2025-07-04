FROM node:16

# 建立應用資料夾
WORKDIR /app

# 複製所有檔案進容器
COPY . .

# 安裝依賴
RUN npm install -g ts-node typescript && npm install

# 啟動指令
CMD ["ts-node", "main.ts"]
