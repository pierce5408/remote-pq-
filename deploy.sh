#!/bin/bash
# 一鍵更新後端（Render）+ 前端（GitHub Pages）

echo "▶ 推送程式碼到 GitHub（後端 Render 會自動更新）..."
git add .
git commit -m "update: $(date '+%Y-%m-%d %H:%M')"
git push origin main

echo ""
echo "▶ 部署前端到 GitHub Pages..."
cd client && npm run deploy
cd ..

echo ""
echo "✓ 完成！"
echo "  前端：https://pierce5408.github.io/remote-pq-/"
echo "  後端：https://remote-pq.onrender.com"
