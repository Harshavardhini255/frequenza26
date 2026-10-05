/**
 * SignalBus
 * ────────────────────────────────────────────────────────────────────────────
 * The recurring FREQUENZA visual language: a signal pulse travels along a
 * circuit bus and every node it passes through ignites.
 *
 * orientation="horizontal" → section dividers, hero baseline
 * orientation="vertical"   → the schedule timeline spine
 *
 * Node ignition delays are derived from each node's position so the glow
 * lines up with the travelling pulse rather than firing randomly.
 */

const DURATION = 4600; // ms — must match DURATION below

function delayForPercent(pct, vertical) {
  // travel range of the pulse centre, in % of the track
  const from = vertical ? -12 : -12;
  const to = vertical ? 112 : 112;
  const arrival = ((pct - from) / (to - from)) * DURATION;
  const centre = DURATION * 0.76; // nodeIgnite bright window centre
  let d = arrival - centre;
  if (d < 0) d += DURATION;
  return d;
}

export default function SignalBus({
  nodes = [],
  orientation = "horizontal",
  className = "",
  showLabels = false,
}) {
  const vertical = orientation === "vertical";

  return (
    <div
      aria-hidden="true"
      className={`relative ${vertical ? "w-full h-full" : "w-full"} ${className}`}
    >
      {/* the bus conductor */}
      <div
        className={`absolute bg-gradient-to-r from-transparent via-signal-500/25 to-transparent ${
          vertical ? "left-1/2 top-0 bottom-0 w-px -translate-x-1/2" : "left-0 right-0 top-1/2 h-px -translate-y-1/2"
        }`}
      />

      {/* travelling pulse */}
      <div
        className={`absolute bg-signal-gradient animate-bus-sweep ${
          vertical
            ? "left-1/2 top-0 h-[18%] w-[3px] -translate-x-1/2 rounded-full shadow-[0_0_18px_rgba(34,200,236,0.8)] animate-spine-sweep"
            : "left-0 top-1/2 h-[3px] w-1/4 -translate-y-1/2 rounded-full shadow-[0_0_18px_rgba(34,200,236,0.8)]"
        }`}
      />

      {/* nodes */}
      {nodes.map((node, i) => {
        const pct = node.pct ?? ((i + 0.5) / nodes.length) * 100;
        const delay = delayForPercent(pct, vertical);

        return (
          <div
            key={node.id ?? node.label ?? i}
            className={`absolute animate-node-ignite ${vertical ? "left-1/2" : "top-1/2"}`}
            style={{
              [vertical ? "top" : "left"]: `${pct}%`,
              [vertical ? "left" : "top"]: "50%",
              transform: `${vertical ? "translateX(-50%)" : "translate(-50%, -50%)"}`,
              animationDelay: `${delay}ms`,
            }}
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute w-5 h-5 rounded-full border border-signal-400/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-signal-200 shadow-[0_0_8px_rgba(168,236,253,0.9)]" />
            </span>

            {showLabels && node.label && (
              <span
                className={`mono-label absolute whitespace-nowrap text-signal-200/80 ${
                  vertical
                    ? "left-8 top-1/2 -translate-y-1/2"
                    : "top-6 left-1/2 -translate-x-1/2"
                }`}
              >
                {node.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}