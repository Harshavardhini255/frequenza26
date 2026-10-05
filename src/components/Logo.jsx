/**
 * Logo
 * ────────────────────────────────────────────────────────────────────────────
 * FREQUENZA '26 mark.
 *
 * `src` renders the official crest inside a designed circuit "emblem plate".
 * The plate exists because the supplied crest is a 1024×1024 opaque JPEG with
 * no alpha channel — framing it keeps the dark theme clean without needing to
 * key out its background.
 *
 * If the file ever fails to load we transparently fall back to the inline
 * frequency/chip SVG, so the navbar and footer never show a broken image.
 */

import { useState } from "react";

const SIZES = {
  sm: { plate: 40, text: "text-base", sub: "text-[8px]", gap: "gap-2.5" },
  md: { plate: 56, text: "text-xl", sub: "text-[9px]", gap: "gap-3" },
  lg: { plate: 84, text: "text-3xl", sub: "text-xs", gap: "gap-4" },
  xl: { plate: 132, text: "text-5xl sm:text-6xl", sub: "text-sm", gap: "gap-5" },
};

function EmblemSvg({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fqSignal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8ecfd" />
          <stop offset="52%" stopColor="#22c8ec" />
          <stop offset="100%" stopColor="#5b8dfb" />
        </linearGradient>
      </defs>

      {/* outer orbital ring */}
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="url(#fqSignal)"
        strokeWidth="1.5"
        strokeDasharray="5 6"
        opacity="0.45"
      />
      <circle cx="50" cy="50" r="39" stroke="#22c8ec" strokeWidth="1" opacity="0.22" />

      {/* chip body */}
      <path
        d="M50 17 L79 33.5 L79 66.5 L50 83 L21 66.5 L21 33.5 Z"
        fill="#060a12"
        stroke="url(#fqSignal)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* pins */}
      <g stroke="#22c8ec" strokeWidth="1.8" strokeLinecap="round" opacity="0.75">
        <path d="M50 6 V17" />
        <path d="M50 83 V94" />
        <path d="M6 50 H21" />
        <path d="M79 50 H94" />
      </g>

      {/* composite signal inside the chip */}
      <path
        d="M27 50 Q33 26 39 50 T51 50 T63 50 T73 50"
        stroke="url(#fqSignal)"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M27 50 Q33 74 39 50 T51 50 T63 50"
        stroke="#5b8dfb"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* node pads */}
      <circle cx="27" cy="50" r="2.4" fill="#a8ecfd" />
      <circle cx="73" cy="50" r="2.4" fill="#5b8dfb" />
    </svg>
  );
}

export default function Logo({
  className = "",
  size = "md",
  showText = true,
  src = null,
  framed = false,
}) {
  const s = SIZES[size] ?? SIZES.md;
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <div className="relative shrink-0">
        {framed && (
          <>
            <div
              className="absolute -inset-2 rounded-2xl bg-signal-500/15 blur-xl animate-ambient"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 rounded-xl border border-signal-400/35 bg-ink/70"
              aria-hidden="true"
            />
          </>
        )}

        <div
          className={`relative flex items-center justify-center ${
            framed ? "rounded-lg overflow-hidden bg-void/60 p-1" : ""
          }`}
          style={{ width: s.plate, height: s.plate }}
        >
          {showImage ? (
            <img
              src={src}
              alt="FREQUENZA '26 crest"
              width={s.plate}
              height={s.plate}
              onError={() => setFailed(true)}
              className="relative z-10 h-full w-full object-contain"
            />
          ) : (
            <EmblemSvg size={s.plate} />
          )}
        </div>
      </div>

      {showText && (
        <div className="flex min-w-0 flex-col">
          <div
            className={`font-display font-bold uppercase leading-none tracking-wide ${s.text}`}
          >
            <span className="signal-gradient-text">Frequenza</span>{" "}
            <span className="text-white/90">'26</span>
          </div>
          <div
            className={`mt-1 font-mono font-semibold uppercase tracking-[0.22em] text-slate-400 ${s.sub}`}
          >
            ECE · GCE Tirunelveli
          </div>
        </div>
      )}
    </div>
  );
}