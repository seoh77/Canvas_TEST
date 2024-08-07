// server/src/server.ts
import express from "express";
import WebSocket from "ws";

const app = express();
const port = 8080;

const server = app.listen(port, () => {
  console.log(`Express 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    // 메시지를 JSON 문자열로 처리
    wss.clients.forEach((client) => {
      if (client instanceof WebSocket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

console.log("WebSocket 서버가 실행 중입니다.");
