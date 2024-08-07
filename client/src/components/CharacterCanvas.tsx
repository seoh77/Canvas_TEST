import React, { useRef, useEffect, useState } from "react";
import fanmeetingImg from "../assets/bg.png";
import hanaL from "../assets/hana-left.png";
import hanaR from "../assets/hana-right.png";

const socket = new WebSocket("ws://localhost:8080");

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

  useEffect(() => {
    socket.onmessage = (event) => {
      // Blob을 문자열로 변환 후 JSON 파싱
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result as string);
        setCharacterSrc(data.characterSrc);
        setPosition(data.position);
      };
      reader.readAsText(event.data);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newPosition = { ...position };
    let newCharacterSrc = characterSrc;

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
        newCharacterSrc = hanaL;
        break;
      case "ArrowRight":
        newPosition.x = Math.min(newPosition.x + 10, window.innerWidth - 50);
        newCharacterSrc = hanaR;
        break;
    }

    setPosition(newPosition);
    setCharacterSrc(newCharacterSrc);

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
