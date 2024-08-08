import express from "express";
import WebSocket from "ws";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

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

const clients = new Map<
  WebSocket,
  {
    id: string;
    characterSrc: { left: string; right: string };
    position: { x: number; y: number };
  }
>();

wss.on("connection", (ws: WebSocket) => {
  const id = uuidv4();
  const randomCharacter =
    characters[Math.floor(Math.random() * characters.length)];
  const initialPosition = {
    x: 50,
    y: (Math.floor(Math.random() * 600) * 2) / 3,
  };

  const clientData = {
    id,
    characterSrc: randomCharacter,
    position: initialPosition,
  };

  clients.set(ws, clientData);

  // 새로 연결된 클라이언트에게 자신을 제외한 모든 클라이언트 정보를 전송
  clients.forEach((client) => {
    if (client.id !== id) {
      ws.send(
        JSON.stringify({
          type: "update",
          ...client,
        })
      );
    }
  });

  // 새로운 클라이언트에게 자신의 정보 전송
  ws.send(
    JSON.stringify({
      type: "init",
      ...clientData,
    })
  );

  // 다른 클라이언트에게 새로 연결된 클라이언트의 정보 전송
  const newUserMessage = JSON.stringify({
    type: "update",
    ...clientData,
  });

  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(newUserMessage);
    }
  });

  ws.on("message", (message: WebSocket.Data) => {
    if (typeof message === "string") {
      const data = JSON.parse(message);
      const client = clients.get(ws);

      if (client) {
        client.position = data.position;
        client.characterSrc = data.characterSrc;

        const updateMessage = JSON.stringify({
          type: "update",
          id: client.id,
          characterSrc: client.characterSrc,
          position: client.position,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(updateMessage);
          }
        });
      }
    }
  });

  ws.on("close", () => {
    const clientData = clients.get(ws);

    if (clientData) {
      const deleteMessage = JSON.stringify({
        type: "delete",
        id: clientData.id,
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(deleteMessage);
        }
      });
    }

    clients.delete(ws);
  });
});

console.log("WebSocket 서버가 실행 중입니다.");
