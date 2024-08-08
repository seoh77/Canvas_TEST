import React, { useRef, useEffect, useState } from "react";
import fanmeetingImg from "../assets/bg.png";

const socket = new WebSocket("ws://localhost:8080");

interface CharacterData {
  id: string;
  characterSrc: { left: string; right: string };
  position: { x: number; y: number };
}

const CharacterCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [characters, setCharacters] = useState<Map<string, CharacterData>>(
    new Map()
  );
  const [myId, setMyId] = useState<string | null>(null);
  const [currentCharacterSrc, setCurrentCharacterSrc] = useState<string | null>(
    null
  );
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 50,
    y: window.innerHeight / 3,
  });

  // 캐릭터 상태가 업데이트될 때마다 캔버스를 다시 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const bgImg = new Image();
    bgImg.src = fanmeetingImg;

    const drawCanvas = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        characters.forEach((char) => {
          const charImg = new Image();
          charImg.src = char.characterSrc.left;
          charImg.onload = () => {
            ctx.drawImage(charImg, char.position.x, char.position.y, 50, 50);
          };
        });
      }
    };

    bgImg.onload = drawCanvas;
    drawCanvas();
  }, [characters]);

  // WebSocket 메시지 처리
  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "init") {
        setMyId(data.id);
        setCurrentCharacterSrc(data.characterSrc.left);
        setCharacters((prev) => new Map(prev).set(data.id, data));
      } else if (data.type === "update") {
        setCharacters((prev) => {
          const newCharacters = new Map(prev);
          newCharacters.set(data.id, data);
          return newCharacters;
        });
      } else if (data.type === "delete") {
        setCharacters((prev) => {
          const newCharacters = new Map(prev);
          newCharacters.delete(data.id);
          return newCharacters;
        });
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!myId) return;

    let newPosition = { ...position };
    let newCharacterSrc = currentCharacterSrc;

    switch (e.key) {
      case "ArrowUp":
        newPosition.y = Math.max(newPosition.y - 10, 0);
        break;
      case "ArrowDown":
        newPosition.y = Math.min(newPosition.y + 10, window.innerHeight - 50);
        break;
      case "ArrowLeft":
        newPosition.x = Math.max(newPosition.x - 10, 0);
        newCharacterSrc =
          characters.get(myId!)?.characterSrc.left || currentCharacterSrc;
        break;
      case "ArrowRight":
        newPosition.x = Math.min(newPosition.x + 10, window.innerWidth - 50);
        newCharacterSrc =
          characters.get(myId!)?.characterSrc.right || currentCharacterSrc;
        break;
    }

    setPosition(newPosition);
    setCurrentCharacterSrc(newCharacterSrc);

    const updatedCharacter = {
      type: "update",
      id: myId,
      characterSrc: {
        left: characters.get(myId!)?.characterSrc.left || newCharacterSrc!,
        right: characters.get(myId!)?.characterSrc.right || newCharacterSrc!,
      },
      position: newPosition,
    };

    setCharacters((prev) => {
      const newCharacters = new Map(prev);
      newCharacters.set(myId!, updatedCharacter);
      return newCharacters;
    });

    socket.send(JSON.stringify(updatedCharacter));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.focus();
    }
  }, []);

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: "none" }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        tabIndex={0}
      />
    </div>
  );
};

export default CharacterCanvas;
