#!/bin/bash
cd ~/chat-app
sudo systemctl start mongod
node server.js &
SERVER_PID=$!
sleep 3
xdg-open http://localhost:3000
wait $SERVER_PID
