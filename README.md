# Romeo & Juliet PQ — 跳箱協調工具

Artale MapleStory Romeo & Juliet Party Quest 跳箱路徑規劃網頁，支援最多 4 人即時同步協調。

**線上網址**：https://pierce5408.github.io/remote-pq-/

---

## 功能

### 房間系統
- 輸入房間號碼與密碼建立或加入房間（最多 4 人）
- 加入後網址自動帶入房間資訊（`?room=xxxx&pwd=xxxx`），重新整理不需重新輸入

### 顏色選擇
- 進房後從紅、藍、綠、黃四色中選擇識別色
- 已被他人佔用的顏色無法選取
- 可隨時切換未被佔用的顏色，切換時自動清除舊格子

### 跳箱規劃表
- 10 × 4 表格，代表 10 層箱子 × 4 個位置
- 表格由下至上顯示（第 1 層在最下，第 10 層在最上）
- 點擊格子填滿自己的顏色，再點一次取消
- 每層最多選一格，點新格自動取代舊的
- 他人已選的格子無法點擊
- 重置按鈕：清空所有格子，顏色保留

### 路徑摘要
- 即時顯示自己選擇的路徑（位置號碼序列）
- 前 5 個與後 5 個以 `-` 分隔

### 即時同步
- 所有操作透過 WebSocket 即時同步給同房間所有玩家

### UI / UX
- 深色遊戲風格介面
- 房間內容以 Border 卡片置中呈現
- RWD 支援手機瀏覽

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
├── dev.sh           # 本地開發一鍵啟動
└── deploy.sh        # 一鍵部署腳本
```

### Frontend

| 項目 | 技術 |
|------|------|
| 框架 | React 18 |
| 建置工具 | Vite 5 |
| WebSocket | socket.io-client 4 |
| 部署 | GitHub Pages |

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
| `pick-color` | client → server | 選擇或切換顏色 |
| `players-updated` | server → all | 玩家狀態更新 |
| `toggle-cell` | client → server | 點選 / 取消格子 |
| `table-updated` | server → all | 表格狀態更新 |
| `reset-table` | client → server | 清空所有格子 |

### 資料結構

```js
rooms[roomId] = {
  password: string,
  players: {
    [socketId]: { color: 'red' | 'blue' | 'green' | 'yellow' | null }
  },
  table: (string|null)[10][4]  // null = 空, color string = 已選
}
```

---

## 本地開發

```bash
# 安裝依賴
cd server && npm install
cd ../client && npm install

# 一鍵啟動（在根目錄執行）
./dev.sh
```

開啟 `http://localhost:5173`

---

## 部署

```bash
# 一鍵部署前端（GitHub Pages）+ 後端（Render 自動更新）
./deploy.sh
```

- **前端**：https://pierce5408.github.io/remote-pq-/
- **後端**：https://remote-pq.onrender.com
