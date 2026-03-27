# Romeo & Juliet PQ — 跳箱協調工具

Artale MapleStory Romeo & Juliet Party Quest 跳箱路徑規劃網頁，支援最多 4 人即時同步協調。

---

## 專案需求

### 核心功能

- **房間系統**：輸入房間號碼與密碼建立或加入房間，最多 4 人同時進入
- **顏色選擇**：進房後從紅、藍、綠、黃四色中選擇一個作為自己的識別色，已被佔用的顏色無法選取
- **跳箱規劃表**：10 × 4 表格，代表 10 層箱子 × 4 個位置
  - 每格顯示位置編號（1–4）
  - 點擊格子填滿自己的顏色（再點取消）
  - 每層最多選一格，點新格子自動取代舊的
  - 其他玩家已選的格子無法點擊
  - 表格由下至上顯示（第 1 層在最下方，第 10 層在最上方）
- **路徑摘要**：即時顯示自己選擇的路徑，格式為位置號碼序列，前 5 個與後 5 個以 `-` 分隔
- **即時同步**：所有操作透過 WebSocket 即時同步給同房間所有玩家

### UI / UX

- 深色遊戲風格介面
- 房間內容以 Border 卡片置中呈現
- RWD 支援手機瀏覽（breakpoint: 480px）

---

## 技術架構

```
romeo/
├── server/          # Node.js 後端
│   ├── index.js
│   └── package.json
├── client/          # React 前端
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── socket.js
│       └── components/
│           ├── LandingPage.jsx
│           └── GameRoom.jsx
└── dev.sh           # 一鍵啟動腳本
```

### Frontend

| 項目 | 技術 |
|------|------|
| 框架 | React 18 |
| 建置工具 | Vite 5 |
| WebSocket | socket.io-client 4 |
| 部署 | GitHub Pages（`gh-pages`） |

### Backend

| 項目 | 技術 |
|------|------|
| 執行環境 | Node.js |
| HTTP Server | Express 4 |
| WebSocket | Socket.io 4 |
| 部署 | Render.com（免費方案） |

### Socket 事件

| 事件 | 方向 | 說明 |
|------|------|------|
| `join-room` | client → server | 加入或建立房間 |
| `room-joined` | server → client | 加入成功，回傳房間初始狀態 |
| `join-error` | server → client | 密碼錯誤 / 房間已滿 / 顏色已被選 |
| `pick-color` | client → server | 選擇顏色 |
| `players-updated` | server → all | 玩家狀態更新 |
| `toggle-cell` | client → server | 點選 / 取消格子 |
| `table-updated` | server → all | 表格狀態更新 |

### 資料結構

```js
// Server 房間狀態
rooms[roomId] = {
  password: string,
  players: {
    [socketId]: { color: 'red' | 'blue' | 'green' | 'yellow' | null }
  },
  table: string[10][4]  // null = 空, color string = 已選
}
```

---

## 本地開發

```bash
# 安裝依賴
cd server && npm install
cd ../client && npm install

# 一鍵啟動（需回到根目錄）
cd ..
./dev.sh
```

開啟 `http://localhost:5173`

---

## 部署

### 後端（Render.com）

1. 將 `server/` 推上 GitHub
2. Render.com 建立 Web Service，start command 設為 `node index.js`

### 前端（GitHub Pages）

在 `client/` 建立 `.env.production`：

```env
VITE_SOCKET_URL=https://your-render-app.onrender.com
VITE_BASE=/your-repo-name/
```

```bash
cd client
npm run deploy
```
