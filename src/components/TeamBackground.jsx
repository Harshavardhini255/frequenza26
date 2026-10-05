import { useEffect, useRef } from "react";

export default function TeamBackground({ className = "" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const nodes = [];
    const MAX_NODES = 40;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      nodes.length = 0;
      const count = Math.min(MAX_NODES, Math.floor((width * height) / 220000));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.03,
          r: Math.random() * 0.8 + 0.2,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawGrid = () => {
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 0.5;
      const grid = 90;
      for (let x = 0; x <= width + grid; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height + grid; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawTraces = (t) => {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const y1 = height * 0.15 + Math.sin(t * 0.00005 + 1) * height * 0.04;
      const y2 = height * 0.5 + Math.cos(t * 0.00004 + 2) * height * 0.03;
      const y3 = height * 0.85 + Math.sin(t * 0.000045 + 3) * height * 0.04;
      ctx.moveTo(0, y1);
      ctx.bezierCurveTo(width * 0.25, y1 + 30, width * 0.4, y2 - 30, width * 0.5, y2);
      ctx.bezierCurveTo(width * 0.6, y2 + 30, width * 0.75, y3 - 30, width, y3);
      ctx.stroke();

      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "#b91c1c";
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      const y4 = height * 0.25 + Math.cos(t * 0.000055 + 0.5) * height * 0.03;
      const y5 = height * 0.75 + Math.sin(t * 0.00005 + 1.5) * height * 0.03;
      ctx.moveTo(width, y4);
      ctx.bezierCurveTo(width * 0.75, y4 - 20, width * 0.6, y5 + 20, width * 0.5, y5);
      ctx.bezierCurveTo(width * 0.4, y5 - 20, width * 0.25, y4 + 20, 0, y4);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const drawNodes = (t) => {
      ctx.save();
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulse += 0.008;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) n.x = width + 10;
        if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        if (n.y > height + 10) n.y = -10;

        const glow = 0.2 + Math.sin(n.pulse) * 0.1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "#fca5a5";
        ctx.fill();

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 5);
        g.addColorStop(0, `rgba(220,38,38,${0.25 + glow * 0.2})`);
        g.addColorStop(1, "rgba(220,38,38,0)");
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.restore();
    };

    const loop = (t) => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawTraces(t);
      drawNodes(t);
      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    rafRef.current = requestAnimationFrame(loop);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.06)_0%,rgba(5,6,8,0.5)_70%,rgba(5,6,8,0.98)_100%)]" />
    </div>
  );
}