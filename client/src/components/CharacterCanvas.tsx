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
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newPosition = { ...position };
    let newCharacterSrc = currentCharacterSrc;

    switch (e.key) {
      case "ArrowUp":
        newPosition.y = Math.max(newPosition.y - 10, window.innerHeight / 3);
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

    socket.send(
      JSON.stringify({
        type: "update",
        id: myId,
        characterSrc: { left: newCharacterSrc!, right: newCharacterSrc! },
        position: newPosition,
      })
    );
  };

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: "none" }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

export default CharacterCanvas;
