#!/bin/bash
# 同時啟動 server + client，Ctrl+C 一次關掉兩個

# 清掉佔用 3001 的舊 process
lsof -ti :3001 | xargs kill -9 2>/dev/null

trap 'kill 0' INT

(cd server && npm run dev) &
(cd client && npm run dev) &

wait
