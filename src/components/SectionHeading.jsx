import Reveal from "./Reveal";
import SignalBus from "./SignalBus";

/**
 * SectionHeading — the consistent section opener used across every page.
 *
 * Eyebrow label → poster-scale display title (gradient-clipped across the
 * whole heading, the site's signature treatment) → lede → signal bus carrying
 * a travelling pulse into the content below.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  lede,
  align = "left",
  busNodes = 5,
  as: Heading = "h2",
  className = "",
}) {
  const centred = align === "center";

  return (
    <div className={`${centred ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <Reveal>
          <div
            className={`eyebrow inline-flex items-center gap-2.5 ${
              centred ? "justify-center" : ""
            }`}
          >
            <span className="inline-block h-px w-8 bg-gradient-to-r from-transparent via-signal-400 to-signal-400/0" />
            {eyebrow}
          </div>
        </Reveal>
      )}

      <Reveal delay={0.06}>
        <Heading className="display-mask mt-4 text-[2.1rem] leading-[0.94] sm:text-6xl lg:text-[4.25rem]">
          {title}
          {accent && (
            <>
              {" "}
              <span className="signal-gradient-text">{accent}</span>
            </>
          )}
        </Heading>
      </Reveal>

      {lede && (
        <Reveal delay={0.12}>
          <p
            className={`mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-slate-300/90 ${
              centred ? "mx-auto" : ""
            }`}
          >
            {lede}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.18}>
        <div className={`mt-8 h-8 ${centred ? "flex justify-center" : ""}`}>
          <SignalBus
            className={centred ? "w-full max-w-md" : "w-full max-w-sm"}
            nodes={Array.from({ length: busNodes }, (_, i) => ({ id: i, pct: ((i + 0.5) / busNodes) * 100 }))}
          />
        </div>
      </Reveal>
    </div>
  );
}
