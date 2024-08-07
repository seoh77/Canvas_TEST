import React, { useRef, useEffect, useState } from "react";

import fanmeetingImg from "./assets/bg.png";
import hana from "./assets/hana.png";

const CharacterCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [position, setPosition] = useState({
    x: 50,
    y: (window.innerHeight * 2) / 3,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const bgImg = new Image();
    const characterImg = new Image();

    bgImg.src = fanmeetingImg;
    characterImg.src = hana;

    const drawCanvas = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(characterImg, position.x, position.y, 50, 50);
      }
    };

    bgImg.onload = drawCanvas;
    characterImg.onload = drawCanvas;
  }, [position]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowUp":
        setPosition((prev) => ({
          ...prev,
          y: Math.max(prev.y - 10, (window.innerHeight * 2) / 3),
        }));
        break;
      case "ArrowDown":
        setPosition((prev) => ({
          ...prev,
          y: Math.min(prev.y + 10, window.innerHeight - 50),
        }));
        break;
      case "ArrowLeft":
        setPosition((prev) => ({ ...prev, x: Math.max(prev.x - 10, 0) }));
        break;
      case "ArrowRight":
        setPosition((prev) => ({
          ...prev,
          x: Math.min(prev.x + 10, window.innerWidth - 50),
        }));
        break;
    }
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
