import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, Info, MapPin, Radio } from "lucide-react";

import MagneticButton from "../components/MagneticButton";
import Reveal from "../components/Reveal";
import Oscilloscope from "../components/Oscilloscope";
import SectionHeading from "../components/SectionHeading";
import SignalBus from "../components/SignalBus";
import { CATEGORY_CHIPS, CATEGORY_LABELS } from "../data/brand";
import { PROGRAMME_NOTE, buildProgramme } from "../data/programme";
import { DEFAULT_SETTINGS } from "../data/site";
import { eventService, settingsService } from "../lib/services";
import PageAtmosphere from "../components/PageAtmosphere";

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([eventService.getEvents(), settingsService.getSettings()])
      .then(([evts, st]) => {
        if (!alive) return;
        setEvents(evts);
        setSettings(st);
      })
      .catch((err) => console.error("Failed to load programme:", err));
    return () => {
      alive = false;
    };
  }, []);

  const programme = useMemo(() => buildProgramme(events), [events]);
  const venue = settings?.venue || DEFAULT_SETTINGS.venue;

  return (
    <div className="section-y relative">
      <PageAtmosphere variant="schedule" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* frequency trace bridging the heading into the timeline */}
        <div aria-hidden="true" className="mb-2 h-16 opacity-30 mix-blend-screen">
          <Oscilloscope grid={false} baseFreq={2} modFreq={6} subFreq={13} phase={0.8} />
        </div>

        <SectionHeading as="h1"
          eyebrow="Programme"
          title="Signal"
          accent="Schedule"
          lede="FREQUENZA '26 is a single-day symposium. Every duration listed below is quoted directly from that event's published rules."
        />

        {/* meta strip */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-lg border border-signal-400/18 bg-void/60 px-3.5 py-2 font-mono text-[11px] text-slate-200">
              <CalendarDays className="h-3.5 w-3.5 text-signal-400" />
              14 October 2026
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-signal-400/18 bg-void/60 px-3.5 py-2 font-mono text-[11px] text-slate-200">
              <Clock className="h-3.5 w-3.5 text-signal-400" />
              Commences 09:00 IST
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-signal-400/18 bg-void/60 px-3.5 py-2 font-mono text-[11px] text-slate-200">
              <MapPin className="h-3.5 w-3.5 text-signal-400" />
              {venue}
            </span>
          </div>
        </Reveal>

        {/* ══ electronic timeline ══════════════════════════════════════ */}
        <div className="mt-16">
          {programme.map((block, index) => {
            const isStart = block.kind === "start";
            const isLast = index === programme.length - 1;

            return (
              <Reveal key={block.id} delay={Math.min(index * 0.06, 0.3)}>
                <div className="relative grid grid-cols-1 gap-y-4 pb-10 pl-12 lg:grid-cols-[190px_1fr] lg:gap-x-10 lg:pl-0">
                  {/* ── the spine + travelling node ── */}
                  <div className="absolute left-[15px] top-1 h-full w-px lg:left-[calc(190px+15px)]">
                    {!isLast && (
                      <div className="relative h-full w-px bg-gradient-to-b from-signal-400/35 via-signal-400/15 to-transparent">
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 top-0 h-24 animate-scan-bar bg-gradient-to-b from-signal-400/50 via-signal-400/10 to-transparent"
                        />
                        <SignalBus
                          orientation="vertical"
                          className="h-full"
                          nodes={[{ id: "top", pct: 0 }]}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── time chip ── */}
                  <div className="lg:pt-1 lg:text-right">
                    <span
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11px] font-bold tracking-wide ${
                        isStart
                          ? "border-signal-400/50 bg-signal-400/10 text-signal-200 shadow-[0_0_24px_-8px_rgba(34,200,236,0.6)]"
                          : "border-white/8 bg-void/60 text-slate-400"
                      }`}
                    >
                      {isStart ? (
                        <Radio className="h-3 w-3 animate-pulse" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {block.time}
                    </span>
                  </div>

                  {/* ── card ── */}
                  <div
                    className={`glass-panel glass-panel-hover sheen group relative overflow-hidden rounded-xl p-5 sm:p-6 ${
                      isStart ? "border-signal-400/35" : ""
                    }`}
                  >
                    <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-50" />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,200,236,0.08),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span className="circuit-corner right-3 top-3 border-r border-t opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="flex flex-wrap items-center gap-2">
                      {isStart ? (
                        <span className="mono-label rounded-md border border-signal-400/35 bg-signal-400/10 px-2 py-1 text-signal-200">
                          {block.subtitle}
                        </span>
                      ) : (
                        <span
                          className={`rounded-md px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                            CATEGORY_CHIPS[block.category]
                          }`}
                        >
                          {CATEGORY_LABELS[block.category]}
                        </span>
                      )}

                      {!isStart && block.slug && (
                        <Link
                          to={`/events/${block.slug}`}
                          className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-signal-300 transition-colors hover:text-signal-100"
                        >
                          Event details
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold uppercase leading-tight tracking-wide text-white sm:text-xl">
                      {block.title}
                    </h3>

                    {block.subtitle && !isStart && (
                      <p className="mt-1.5 font-mono text-[11px] italic text-signal-300/80">
                        “{block.subtitle}”
                      </p>
                    )}

                    {block.body && (
                      <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
                        {block.body}
                      </p>
                    )}

                    {block.timings.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-white/6 pt-4">
                        {block.timings.map((timing, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 font-mono text-[11px] leading-relaxed text-slate-400"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-signal-400" />
                            <span>{timing}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* honest disclosure */}
        <Reveal>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-signal-400/15 bg-void/50 p-5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-signal-400" />
            <p className="text-[13px] leading-relaxed text-slate-400">{PROGRAMME_NOTE}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <MagneticButton to="/register">
              Register Now
              <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
            <MagneticButton to="/contact" variant="ghost">
              Contact Coordinators
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
