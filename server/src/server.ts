import express from "express";
import WebSocket from "ws";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 8080;

app.use(cors());

const server = app.listen(port, () => {
  console.log(`Express 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

const wss = new WebSocket.Server({ server });

const characters = [
  {
    name: "hana",
    left: `${process.env.S3_URL}/hifive-character/hana-left.png`,
    right: `${process.env.S3_URL}/hifive-character/hana-right.png`,
  },
  {
    name: "dul",
    left: `${process.env.S3_URL}/hifive-character/dul-left.png`,
    right: `${process.env.S3_URL}/hifive-character/dul-right.png`,
  },
  {
    name: "sett",
    left: `${process.env.S3_URL}/hifive-character/sett-left.png`,
    right: `${process.env.S3_URL}/hifive-character/sett-right.png`,
  },
  {
    name: "nett",
    left: `${process.env.S3_URL}/hifive-character/nett-left.png`,
    right: `${process.env.S3_URL}/hifive-character/nett-right.png`,
  },
  {
    name: "dasut",
    left: `${process.env.S3_URL}/hifive-character/dasut-left.png`,
    right: `${process.env.S3_URL}/hifive-character/dasut-right.png`,
  },
];

wss.on("connection", (ws: WebSocket) => {
  const randomCharacter =
    characters[Math.floor(Math.random() * characters.length)];
  const characterSrc = {
    left: randomCharacter.left,
    right: randomCharacter.right,
  };

  // 클라이언트에게 랜덤 캐릭터 정보 전송
  ws.send(JSON.stringify({ type: "init", characterSrc }));

  ws.on("message", (message: WebSocket.Data) => {
    if (typeof message === "string") {
      // 메시지를 JSON 문자열로 처리
      wss.clients.forEach((client) => {
        if (
          client instanceof WebSocket &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(message);
        }
      });
    } else if (message instanceof Buffer || message instanceof ArrayBuffer) {
      // Buffer 처리
      const buffer = message instanceof Buffer ? message : Buffer.from(message);
      const jsonString = new TextDecoder("utf-8").decode(buffer);
      wss.clients.forEach((client) => {
        if (
          client instanceof WebSocket &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(jsonString);
        }
      });
    }
  });
});

console.log("WebSocket 서버가 실행 중입니다.");
