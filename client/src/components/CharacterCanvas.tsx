import React, { useRef, useEffect, useState } from "react";
import fanmeetingImg from "../assets/bg.png";

const socket = new WebSocket("ws://localhost:8080");

const CharacterCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [characterSrc, setCharacterSrc] = useState<{
    left: string;
    right: string;
  } | null>(null);
  const [currentCharacterSrc, setCurrentCharacterSrc] = useState<string | null>(
    null
  );

  const [position, setPosition] = useState({
    x: 50,
    y: (window.innerHeight * 2) / 3,
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

        if (currentCharacterSrc) {
          const charImg = new Image();
          charImg.src = currentCharacterSrc;
          charImg.onload = () => {
            ctx.drawImage(charImg, position.x, position.y, 50, 50);
          };
          charImg.onerror = () => {
            console.error(
              `Failed to load character image from ${currentCharacterSrc}`
            );
          };
        }
      }
    };

    bgImg.onload = drawCanvas;
    // 이미지가 변경되면 다시 그리기
    if (currentCharacterSrc) {
      const charImg = new Image();
      charImg.src = currentCharacterSrc;
      charImg.onload = drawCanvas;
      charImg.onerror = () => {
        console.error(
          `Failed to load character image from ${currentCharacterSrc}`
        );
      };
    } else {
      drawCanvas();
    }
  }, [currentCharacterSrc, position]);

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "init") {
        // 서버에서 받은 초기 캐릭터 정보 설정
        setCharacterSrc(data.characterSrc);
        setCurrentCharacterSrc(data.characterSrc.left);
      } else {
        setCurrentCharacterSrc(data.characterSrc);
        setPosition(data.position);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newPosition = { ...position };
    let newCharacterSrc = currentCharacterSrc;

    switch (e.key) {
      case "ArrowUp":
        newPosition.y = Math.max(
          newPosition.y - 10,
          (window.innerHeight * 2) / 3
        );
        break;
      case "ArrowDown":
        newPosition.y = Math.min(newPosition.y + 10, window.innerHeight - 50);
        break;
      case "ArrowLeft":
        newPosition.x = Math.max(newPosition.x - 10, 0);
        newCharacterSrc = characterSrc?.left || currentCharacterSrc;
        break;
      case "ArrowRight":
        newPosition.x = Math.min(newPosition.x + 10, window.innerWidth - 50);
        newCharacterSrc = characterSrc?.right || currentCharacterSrc;
        break;
    }

    setPosition(newPosition);
    setCurrentCharacterSrc(newCharacterSrc);

    socket.send(
      JSON.stringify({
        characterSrc: newCharacterSrc,
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
        style={{ border: "1px solid black" }}
      />
    </div>
  );
};

export default CharacterCanvas;
