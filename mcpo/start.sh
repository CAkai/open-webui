#!/bin/sh
# MCPO 啟動腳本：啟動 MCPO 並持續送出 keepalive 給 search SSE server
# 防止 search server 因閒置 session timeout 而踢掉連線

set -e

# 啟動 MCPO（背景執行）
uvx mcpo --config /app/config.json &
MCPO_PID=$!

# 捕捉終止訊號，確保子行程一起結束
trap "echo 'Shutting down...'; kill $MCPO_PID 2>/dev/null; exit 0" TERM INT

# 等待 MCPO 就緒
echo "[keepalive] Waiting for MCPO to start..."
for i in $(seq 1 30); do
  if curl -sf --max-time 3 http://localhost:8000/openapi.json > /dev/null 2>&1; then
    echo "[keepalive] MCPO is ready."
    break
  fi
  sleep 1
done

# 每 45 秒呼叫 /search/help，維持 search SSE session 存活
# search server 的 idle session timeout 約 1-2 分鐘，keepalive 頻率需小於此值
echo "[keepalive] Starting search SSE session keepalive (interval: 45s)..."
while kill -0 $MCPO_PID 2>/dev/null; do
  result=$(curl -sf --max-time 10 http://localhost:8000/search/help \
    -X POST -H 'Content-Type: application/json' -d '{}' 2>&1)
  if [ $? -eq 0 ]; then
    echo "[keepalive] $(date '+%H:%M:%S') search session OK"
  else
    echo "[keepalive] $(date '+%H:%M:%S') search session ping failed, MCPO will reconnect automatically"
  fi
  sleep 45
done

# MCPO 已結束，等待並傳遞退出碼
wait $MCPO_PID
