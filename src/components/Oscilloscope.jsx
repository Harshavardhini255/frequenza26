/**
 * Oscilloscope
 * ────────────────────────────────────────────────────────────────────────────
 * The FREQUENZA signal waveform: a composite (3-tone) analogue signal drawn on a
 * scope grid, with a bright pulse racing along the trace and an optional FFT
 * spectrum underneath. This is the visual anchor of the frequency identity.
 */

const VB_W = 1200;
const VB_H = 240;

function buildWave({ baseFreq = 3, modFreq = 7, subFreq = 13, phase = 0 }) {
  const samples = 420;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = t * VB_W;
    const y =
      0.56 * Math.sin(2 * Math.PI * baseFreq * t + phase) +
      0.27 * Math.sin(2 * Math.PI * modFreq * t + phase * 1.7) +
      0.17 * Math.sin(2 * Math.PI * subFreq * t - phase * 0.6);
    pts.push([x, VB_H / 2 - y * (VB_H / 2 - 14)]);
  }
  return "M " + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ");
}

export default function Oscilloscope({
  className = "",
  baseFreq = 3,
  modFreq = 7,
  subFreq = 13,
  phase = 0,
  spectrum = false,
  grid = true,
  intensity = 1,
}) {
  const path = buildWave({ baseFreq, modFreq, subFreq, phase });

  const bars = spectrum
    ? Array.from({ length: 46 }, (_, i) => {
        const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const envelope = Math.exp(-i / 16) * 0.75 + 0.18;
        const amp = (0.22 + seed * 0.78) * envelope;
        return {
          h: Math.max(0.1, amp),
          tone: i / 46,
        };
      })
    : [];

  return (
    <div className={`relative w-full ${className}`} aria-hidden="true">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <defs>
          <linearGradient id="scopeStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
            <stop offset="22%" stopColor="#22c8ec" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#a8ecfd" stopOpacity="0.95" />
            <stop offset="80%" stopColor="#22c8ec" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#5b8dfb" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="scopeGrid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c8ec" stopOpacity="0" />
            <stop offset="50%" stopColor="#22c8ec" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22c8ec" stopOpacity="0" />
          </linearGradient>
          <filter id="scopeGlow" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {grid && (
          <g>
            {Array.from({ length: 17 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={(i * VB_W) / 16}
                y1={0}
                x2={(i * VB_W) / 16}
                y2={VB_H}
                stroke="#22c8ec"
                strokeOpacity={i % 4 === 0 ? 0.14 : 0.06}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={(i * VB_H) / 6}
                x2={VB_W}
                y2={(i * VB_H) / 6}
                stroke="#22c8ec"
                strokeOpacity={i === 3 ? 0.2 : 0.07}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1={0}
              y1={VB_H / 2}
              x2={VB_W}
              y2={VB_H / 2}
              stroke="url(#scopeGrid)"
              strokeWidth={1}
              strokeDasharray="4 8"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* soft halo of the signal */}
        <path
          d={path}
          fill="none"
          stroke="#22c8ec"
          strokeOpacity={0.28 * intensity}
          strokeWidth={9}
          vectorEffect="non-scaling-stroke"
          filter="url(#scopeGlow)"
        />

        {/* main trace */}
        <path
          d={path}
          fill="none"
          stroke="url(#scopeStroke)"
          strokeWidth={2.2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* travelling pulse head along the trace */}
        <path
          d={path}
          fill="none"
          stroke="#ecfeff"
          strokeOpacity={0.95 * intensity}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray="70 1130"
          vectorEffect="non-scaling-stroke"
          className="animate-wave-dash"
          style={{ filter: "drop-shadow(0 0 6px rgba(168,236,253,0.9))" }}
        />
      </svg>

      {spectrum && (
        <div className="mt-2 flex items-end gap-[2px] h-10 w-full px-[1px]">
          {bars.map((b, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-[1px] origin-bottom"
              style={{
                height: `${Math.round(b.h * 100)}%`,
                background: `linear-gradient(to top, rgba(34,200,236,${
                  0.18 + b.tone * 0.5
                }), rgba(168,236,253,${0.3 + b.tone * 0.55}))`,
                animation: `eqBar ${0.9 + (i % 7) * 0.17}s ease-in-out ${(i % 9) * 0.11}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}