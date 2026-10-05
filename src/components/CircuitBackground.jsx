import { useEffect, useRef } from "react";

/**
 * CircuitBackground
 * ────────────────────────────────────────────────────────────────────────────
 * A fixed, full-viewport electronics substrate:
 *   • faint PCB trace network (manhattan-routed)
 *   • a signal pulse travelling along every trace
 *   • circuit nodes that ignite as a pulse passes through them
 *   • slow drifting data particles
 *   • grid + radial ambient glow + vignette
 *
 * Deliberately restrained: low alpha, slow motion, no full-screen noise flood.
 * Respects prefers-reduced-motion and pauses when the tab is hidden.
 */

const CELL = 190;
const LINK_CHANCE = 0.42;
const TRACE_PERIOD = 5200; // ms — one full pulse loop per trace
const PARTICLE_PER_MEGAPIXEL = 26;

function buildNetwork(w, h) {
  const cols = Math.max(2, Math.ceil(w / CELL) + 1);
  const rows = Math.max(2, Math.ceil(h / CELL) + 1);
  const jitter = CELL * 0.34;

  const nodes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        x: c * CELL + (Math.random() - 0.5) * jitter,
        y: r * CELL + (Math.random() - 0.5) * jitter,
      });
    }
  }

  const traces = [];
  const pushTrace = (a, b) => {
    const step = Math.random() < 0.55;
    let pts;
    if (step) {
      if (Math.abs(a.y - b.y) < Math.abs(a.x - b.x)) {
        const mx = (a.x + b.x) / 2;
        pts = [a, { x: mx, y: a.y }, { x: mx, y: b.y }, b];
      } else {
        const my = (a.y + b.y) / 2;
        pts = [a, { x: a.x, y: my }, { x: b.x, y: my }, b];
      }
    } else {
      pts = [a, b];
    }
    pts = dedupe(pts);

    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    const total = cum[cum.length - 1];
    if (total < 12) return;

    traces.push({
      pts,
      cum,
      total,
      offset: Math.random() * TRACE_PERIOD,
      speed: TRACE_PERIOD * (0.82 + Math.random() * 0.42),
      width: Math.random() < 0.22 ? 1.5 : 1,
      bright: Math.random() < 0.3,
    });
  };

  // horizontal runs
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (Math.random() < LINK_CHANCE) pushTrace(nodes[r * cols + c], nodes[r * cols + c + 1]);
    }
  }
  // vertical runs
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 1; r++) {
      if (Math.random() < LINK_CHANCE) pushTrace(nodes[r * cols + c], nodes[(r + 1) * cols + c]);
    }
  }

  const particleCount = Math.round(
    Math.min(90, Math.max(14, ((w * h) / 1e6) * PARTICLE_PER_MEGAPIXEL)),
  );
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.09,
      vy: (Math.random() - 0.5) * 0.07,
      r: 0.5 + Math.random() * 1.1,
      bit: Math.random() < 0.5 ? "0" : "1",
      a: 0.1 + Math.random() * 0.22,
    });
  }

  return { traces, nodes, particles };
}

function dedupe(pts) {
  const out = [];
  for (const p of pts) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(p.x - prev.x, p.y - prev.y) > 0.5) out.push(p);
  }
  return out;
}

function pointAt(trace, dist) {
  const { pts, cum } = trace;
  if (dist <= 0) return pts[0];
  if (dist >= trace.total) return pts[pts.length - 1];
  let i = 1;
  while (i < cum.length && cum[i] < dist) i++;
  const t = (dist - cum[i - 1]) / Math.max(0.0001, cum[i] - cum[i - 1]);
  return {
    x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
    y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t,
  };
}

export default function CircuitBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let net = { traces: [], nodes: [], particles: [] };
    let raf = 0;
    let t0 = performance.now();

    // Pre-rendered glow sprite — far cheaper than per-pulse radial gradients
    const SPRITE = 64;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = SPRITE;
    const sctx = sprite.getContext("2d");
    const grad = sctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
    grad.addColorStop(0, "rgba(190,245,255,0.95)");
    grad.addColorStop(0.28, "rgba(34,200,236,0.55)");
    grad.addColorStop(1, "rgba(34,200,236,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, SPRITE, SPRITE);

    const staticLayer = document.createElement("canvas");

    const paintStatic = () => {
      staticLayer.width = w * DPR;
      staticLayer.height = h * DPR;
      const g = staticLayer.getContext("2d");
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      g.clearRect(0, 0, w, h);

      // engineering grid
      g.strokeStyle = "rgba(34,200,236,0.05)";
      g.lineWidth = 1;
      const step = 48;
      g.beginPath();
      for (let x = 0; x <= w; x += step) {
        g.moveTo(Math.round(x) + 0.5, 0);
        g.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = 0; y <= h; y += step) {
        g.moveTo(0, Math.round(y) + 0.5);
        g.lineTo(w, Math.round(y) + 0.5);
      }
      g.stroke();

      // heavier grid lines
      g.strokeStyle = "rgba(34,200,236,0.07)";
      g.beginPath();
      for (let x = 0; x <= w; x += step * 5) {
        g.moveTo(Math.round(x) + 0.5, 0);
        g.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = 0; y <= h; y += step * 5) {
        g.moveTo(0, Math.round(y) + 0.5);
        g.lineTo(w, Math.round(y) + 0.5);
      }
      g.stroke();

      // traces
      for (const tr of net.traces) {
        g.strokeStyle = tr.bright ? "rgba(34,200,236,0.16)" : "rgba(34,200,236,0.09)";
        g.lineWidth = tr.width;
        g.lineCap = "round";
        g.lineJoin = "round";
        g.beginPath();
        g.moveTo(tr.pts[0].x, tr.pts[0].y);
        for (let i = 1; i < tr.pts.length; i++) g.lineTo(tr.pts[i].x, tr.pts[i].y);
        g.stroke();
      }

      // nodes (pad rings)
      for (const n of net.nodes) {
        g.strokeStyle = "rgba(34,200,236,0.2)";
        g.lineWidth = 1;
        g.beginPath();
        g.arc(n.x, n.y, 2.6, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "rgba(34,200,236,0.14)";
        g.beginPath();
        g.arc(n.x, n.y, 1, 0, Math.PI * 2);
        g.fill();
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      net = buildNetwork(w, h);
      paintStatic();
    };

    const drawGlow = (x, y, size, alpha) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      const t = now - t0;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(staticLayer, 0, 0, w, h);

      const pulseLen = Math.max(34, w * 0.035);

      for (const tr of net.traces) {
        const phase = ((t + tr.offset) % tr.speed) / tr.speed;
        const head = phase * tr.total;
        const tail = head - pulseLen;
        if (tail > tr.total) continue;

        // leading bright segment
        const from = pointAt(tr, Math.max(0, tail));
        const to = pointAt(tr, head);
        ctx.strokeStyle = tr.bright ? "rgba(215,247,255,0.95)" : "rgba(168,236,253,0.8)";
        ctx.lineWidth = tr.width + 0.7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // head sprite + short tail of the pulse
        drawGlow(to.x, to.y, 46, 0.75);
        const mid = pointAt(tr, Math.max(0, tail + (head - tail) * 0.45));
        drawGlow(mid.x, mid.y, 26, 0.3);
      }

      // nodes ignite when a pulse head is near them
      for (const n of net.nodes) {
        let near = 0;
        for (const tr of net.traces) {
          const phase = ((t + tr.offset) % tr.speed) / tr.speed;
          const head = pointAt(tr, phase * tr.total);
          const d = Math.hypot(head.x - n.x, head.y - n.y);
          if (d < 52) near = Math.max(near, 1 - d / 52);
        }
        if (near > 0) {
          ctx.fillStyle = `rgba(215,247,255,${0.25 + near * 0.75})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
          drawGlow(n.x, n.y, 44, near * 0.65);
        }
      }

      // drifting data particles
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      for (const p of net.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        if (p.y < -12) p.y = h + 12;
        if (p.y > h + 12) p.y = -12;
        ctx.fillStyle = `rgba(34,200,236,${p.a})`;
        ctx.fillText(p.bit, p.x, p.y);
        ctx.fillStyle = `rgba(34,200,236,${p.a * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    const paintStaticOnly = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(staticLayer, 0, 0, w, h);
    };

    resize();

    if (reduceMotion) {
      paintStaticOnly();
    } else {
      raf = requestAnimationFrame(frame);
    }

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      let debounce;
      ro = new ResizeObserver(() => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          resize();
          if (reduceMotion) paintStaticOnly();
        }, 180);
      });
      ro.observe(document.documentElement);
    }

    const onVisibility = () => {
      if (reduceMotion) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        t0 = performance.now() - 1000;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* ambient radial glows — cyan core, violet whisper */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(34,200,236,0.10)_0%,transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_88%_105%,rgba(124,77,237,0.09)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_6%_88%,rgba(34,200,236,0.07)_0%,transparent_62%)]" />

      {/* vignette so content always sits on a calm base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,6,12,0.55)_78%,rgba(4,6,12,0.92)_100%)]" />
    </div>
  );
}