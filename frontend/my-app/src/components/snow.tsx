"use client";

import { useEffect } from "react";

export default function Snow() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const flakes = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      d: Math.random() * 1 + 0.5,
    }));

    function update() {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "white";
      ctx.beginPath();

      flakes.forEach((f) => {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);

        f.y += f.d;
        f.x += Math.sin(f.y * 0.01) * 0.5;

        if (f.y > height) {
          f.y = -10;
          f.x = Math.random() * width;
        }
      });

      ctx.fill();
      requestAnimationFrame(update);
    }

    update();

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, []);

  return null;
}
