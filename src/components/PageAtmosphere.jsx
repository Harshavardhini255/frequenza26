/**
 * PageAtmosphere
 * ────────────────────────────────────────────────────────────────────────────
 * The cinematic backdrop shared by every inner page. Home has an in-hero
 * version of this; this component gives About / Events / Event Detail /
 * Schedule / Team / Contact / Register / Participant Status / Admin the same
 * additive, glowing depth so no page feels flat by comparison.
 *
 * Purely decorative and non-interactive: it never intercepts pointer events
 * and is hidden from assistive technology.
 *
 * `variant` shifts the bloom placement so consecutive pages do not read as
 * identical backdrops.
 */

const BLOOMS = {
  default: [
    { pos: "left-[8%] top-[12%]", size: "h-[380px] w-[620px]", tone: "bg-signal-500/16", blur: "blur-[120px]", mode: "bloom-dodge" },
    { pos: "right-[6%] bottom-[18%]", size: "h-[340px] w-[560px]", tone: "bg-ion-500/14", blur: "blur-[110px]", mode: "bloom-overlay" },
  ],
  events: [
    { pos: "left-1/2 top-[6%] -translate-x-1/2", size: "h-[320px] w-[820px]", tone: "bg-signal-500/15", blur: "blur-[120px]", mode: "bloom-dodge" },
    { pos: "right-[4%] bottom-[24%]", size: "h-[300px] w-[480px]", tone: "bg-plasma-500/12", blur: "blur-[110px]", mode: "bloom-overlay" },
  ],
  detail: [
    { pos: "left-[10%] top-[8%]", size: "h-[300px] w-[520px]", tone: "bg-signal-500/15", blur: "blur-[110px]", mode: "bloom-dodge" },
    { pos: "right-[12%] top-[38%]", size: "h-[280px] w-[460px]", tone: "bg-ion-500/12", blur: "blur-[100px]", mode: "bloom-overlay" },
  ],
  schedule: [
    { pos: "left-[4%] top-[22%]", size: "h-[340px] w-[500px]", tone: "bg-signal-500/14", blur: "blur-[120px]", mode: "bloom-dodge" },
    { pos: "right-[8%] top-[6%]", size: "h-[300px] w-[520px]", tone: "bg-ion-500/13", blur: "blur-[110px]", mode: "bloom-overlay" },
  ],
  team: [
    { pos: "left-1/2 top-[4%] -translate-x-1/2", size: "h-[300px] w-[760px]", tone: "bg-plasma-500/12", blur: "blur-[120px]", mode: "bloom-dodge" },
    { pos: "left-[14%] bottom-[12%]", size: "h-[280px] w-[440px]", tone: "bg-signal-500/13", blur: "blur-[100px]", mode: "bloom-overlay" },
  ],
  form: [
    { pos: "left-1/2 top-0 -translate-x-1/2", size: "h-[360px] w-[820px]", tone: "bg-signal-500/14", blur: "blur-[130px]", mode: "bloom-dodge" },
    { pos: "left-1/2 bottom-0 -translate-x-1/2", size: "h-[300px] w-[700px]", tone: "bg-ion-500/12", blur: "blur-[110px]", mode: "bloom-overlay" },
  ],
  centered: [
    { pos: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", size: "h-[420px] w-[760px]", tone: "bg-signal-500/15", blur: "blur-[130px]", mode: "bloom-dodge" },
  ],
};

export default function PageAtmosphere({ variant = "default", className = "" }) {
  const blooms = BLOOMS[variant] ?? BLOOMS.default;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {blooms.map((b, i) => (
        <div
          key={i}
          className={`absolute ${b.pos} ${b.size} ${b.tone} ${b.blur} ${b.mode} animate-bloom`}
          style={{ animationDelay: `${i * 2.6}s` }}
        />
      ))}

      {/* faint PCB trace field */}
      <div className="absolute inset-0 traces-faint opacity-45" />

      {/* edge vignette keeps the centre of attention bright */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,6,12,0.55)_100%)]" />
    </div>
  );
}
