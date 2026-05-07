#!/bin/bash
# Drain the Drive sync queue by hitting the worker repeatedly until empty.
# Stops automatically when claimed=0 (queue empty) or after 200 iterations.

URL='https://begnklspqjxwkvwhuefr.supabase.co/functions/v1/drive-sync-worker'
TOKEN='45efb299d9ef326a4bb2b2cdbf3db9c546aba803c5551982e48bfb6b7b14d758'
LOG=/tmp/cerebro_drain.log

> "$LOG"
echo "Drain started at $(date)" >> "$LOG"

for i in $(seq 1 200); do
  response=$(curl -sS -X POST "$URL" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}')
  echo "Run $i: $response" >> "$LOG"

  # Stop early when queue is empty
  if echo "$response" | grep -q '"claimed":0'; then
    echo "Queue empty, exiting at run $i" >> "$LOG"
    break
  fi

  sleep 2
done

echo "Drain finished at $(date)" >> "$LOG"
