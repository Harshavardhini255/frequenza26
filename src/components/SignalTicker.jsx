/**
 * SignalTicker — a full-bleed marquee used as a cinematic section transition.
 *
 * Content is built ONLY from real symposium data (event names, the published
 * date, the department and college names). Nothing here is invented filler.
 */

const NODE = (
  <span
    aria-hidden="true"
    className="relative mx-6 inline-flex h-1.5 w-1.5 shrink-0"
  >
    <span className="absolute inset-0 rounded-full bg-signal-400/60 animate-node-blink" />
    <span className="relative h-1.5 w-1.5 rounded-full bg-signal-300 shadow-[0_0_8px_rgba(34,200,236,0.9)]" />
  </span>
);

function Row({ items, reverse, duration }) {
  const track = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-3">
      <div
        className={`animate-marquee w-max ${reverse ? "animate-marquee-reverse" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((item, i) => (
          <span key={i} className="inline-flex items-center whitespace-nowrap">
            <span className="font-display text-[13px] font-700 uppercase tracking-[0.22em] text-slate-400 sm:text-sm">
              {item}
            </span>
            {NODE}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignalTicker({ events = [], college, department, dateLabel }) {
  const items = [
    "FREQUENZA '26",
    dateLabel,
    "National Level Technical Symposium",
    ...events.map((e) => e.name),
    college,
    department,
  ].filter(Boolean);

  // de-duplicate while preserving order
  const unique = items.filter((v, i) => items.indexOf(v) === i);
  if (unique.length === 0) return null;

  const half = Math.ceil(unique.length / 2);
  const rowA = unique.slice(0, half);
  const rowB = unique.slice(half);

  return (
    <section
      aria-hidden="true"
      className="relative border-y border-white/8 bg-void/40 backdrop-blur-sm"
    >
      <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-40" />
      <span className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-void to-transparent" />
      <span className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-void to-transparent" />

      <Row items={rowA} duration={38} />
      {rowB.length > 0 && <Row items={rowB} reverse duration={30} />}
    </section>
  );
}
