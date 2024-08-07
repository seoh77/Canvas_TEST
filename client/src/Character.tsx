import React, { useRef, useEffect, useState } from "react";

import fanmeetingImg from "./assets/bg.png";
import hanaL from "./assets/hana-left.png";
import hanaR from "./assets/hana-right.png";

const CharacterCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [characterSrc, setCharacterSrc] = useState<string>(hanaL);
  const [position, setPosition] = useState({
    x: 50,
    y: (window.innerHeight * 2) / 3,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const bgImg = new Image();
    const charImg = new Image();

    bgImg.src = fanmeetingImg;
    charImg.src = characterSrc;

    bgImg.onload = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(charImg, position.x, position.y, 50, 50);
      }
    };

    charImg.onload = () => {
      if (ctx && canvas) {
        ctx.drawImage(charImg, position.x, position.y, 50, 50);
      }
    };
  }, [position, characterSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const bgImg = new Image();
    const charImgL = new Image();
    const charImgR = new Image();

    bgImg.src = fanmeetingImg;
    charImgL.src = hanaL;
    charImgR.src = hanaR;

    const drawCanvas = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        if (characterSrc === hanaL) {
          ctx.drawImage(charImgL, position.x, position.y, 50, 50);
        } else {
          ctx.drawImage(charImgR, position.x, position.y, 50, 50);
        }
      }
    };

    bgImg.onload = drawCanvas;
    charImgL.onload = drawCanvas;
    charImgR.onload = drawCanvas;
  }, [characterSrc, position]);

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
        setCharacterSrc(hanaL);
        break;
      case "ArrowRight":
        setPosition((prev) => ({
          ...prev,
          x: Math.min(prev.x + 10, window.innerWidth - 50),
        }));
        setCharacterSrc(hanaR);
        break;
    }
  };

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: "none" }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth - 1}
        height={window.innerHeight - 1}
        style={{ border: "1px solid black" }}
      />
    </div>
  );
};

export default CharacterCanvas;
