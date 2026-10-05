import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, Users } from "lucide-react";

import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import SignalBus from "../components/SignalBus";
import { FALLBACK_COORDINATORS } from "../data/site";
import { eventService, settingsService } from "../lib/services";
import PageAtmosphere from "../components/PageAtmosphere";

/* Monogram derived from the coordinator's actual name — no stock photos,
   no invented portraits. */
function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* Deterministic hue offset so each card gets a different circuit tone without
   introducing any off-palette colour. */
function tone(index) {
  return 190 + ((index * 13) % 26); // 190–216: cyan → blue range
}

export default function Team() {
  const [coordinators, setCoordinators] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([settingsService.getSettings(), eventService.getEvents()])
      .then(([settings, list]) => {
        if (!alive) return;
        const fromSettings =
          Array.isArray(settings?.coordinators) && settings.coordinators.length > 0
            ? settings.coordinators
            : [];
        setCoordinators(fromSettings.length > 0 ? fromSettings : FALLBACK_COORDINATORS);
        setEvents(list);
      })
      .catch((err) => {
        console.error("Failed to load team data:", err);
        if (alive) setCoordinators(FALLBACK_COORDINATORS);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* Event-level student coordinators, read straight from each event record. */
  const eventCoordinators = useMemo(() => {
    const seen = new Set();
    return events
      .filter((e) => e.coordinator_name)
      .map((e) => ({
        id: e.id,
        name: e.coordinator_name,
        event: e.name,
        phone: e.coordinator_phone,
        email: e.coordinator_email,
      }))
      .filter((c) => {
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
      });
  }, [events]);

  return (
    <div className="section-y relative">
      <PageAtmosphere variant="team" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading as="h1"
          eyebrow="Who to contact"
          title="The FREQUENZA"
          accent="Team"
          align="center"
          lede="Overall student coordinators for the symposium, plus the student coordinator listed for each event."
        />

        {/* ── overall coordinators ── */}
        <Reveal delay={0.1}>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="mono-label text-slate-500">Overall coordination</span>
            <span className="h-6 w-px bg-signal-400/25" />
            <SignalBus nodes={[{ id: "a", pct: 20 }, { id: "b", pct: 80 }]} className="w-24" />
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coordinators.map((person, i) => (
            <motion.div
              key={person.id || person.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5 }}
              className="glass-panel glass-panel-hover group relative overflow-hidden rounded-2xl p-6 text-center"
            >
              <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-60" />
              <span className="circuit-corner left-3 top-3 border-l border-t" />
              <span className="circuit-corner bottom-3 right-3 border-b border-r" />

              {/* monogram emblem */}
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl border opacity-60"
                  style={{
                    borderColor: `hsl(${tone(i)} 90% 60% / 0.35)`,
                    boxShadow: `0 0 28px -10px hsl(${tone(i)} 90% 55% / 0.7)`,
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl opacity-30"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, hsl(${tone(i)} 90% 55% / 0.35), transparent 70%)`,
                  }}
                />
                <span
                  className="relative font-display text-2xl font-bold tracking-wider"
                  style={{ color: `hsl(${tone(i)} 95% 78%)` }}
                >
                  {initials(person.name)}
                </span>
              </div>

              <h3 className="mt-5 font-display text-base font-bold text-white">
                {person.name}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-signal-300">
                {person.role}
              </p>
              {person.department && (
                <p className="mono-label mt-1 text-slate-500">{person.department}</p>
              )}

              <div className="mt-5 space-y-2 border-t border-white/6 pt-4">
                {person.phone && (
                  <a
                    href={`tel:${person.phone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-center gap-2 font-mono text-[11px] text-slate-300 transition-colors hover:text-signal-200"
                  >
                    <Phone className="h-3 w-3 text-signal-400" />
                    {person.phone}
                  </a>
                )}
                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center justify-center gap-2 break-all font-mono text-[10px] text-slate-400 transition-colors hover:text-signal-200"
                  >
                    <Mail className="h-3 w-3 shrink-0 text-signal-400" />
                    {person.email}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── event coordinators ── */}
        {eventCoordinators.length > 0 && (
          <>
            <Reveal>
              <div className="mt-20 flex flex-col items-center gap-3">
                <h2 className="display-mask text-2xl text-white sm:text-4xl">
                  Event <span className="signal-gradient-text">Coordinators</span>
                </h2>
                <div className="h-6 w-64">
                  <SignalBus
                    nodes={Array.from({ length: 4 }, (_, i) => ({ id: i, pct: 15 + i * 23 }))}
                  />
                </div>
              </div>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {eventCoordinators.map((person, i) => (
                <motion.a
                  key={person.id}
                  href={`/events/${events.find((e) => e.id === person.id)?.slug || ""}`}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="glass-panel glass-panel-hover group relative overflow-hidden rounded-xl p-5"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-50" />

                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-display text-sm font-bold"
                      style={{
                        borderColor: `hsl(${tone(i + 3)} 90% 60% / 0.3)`,
                        color: `hsl(${tone(i + 3)} 95% 78%)`,
                        background: `hsl(${tone(i + 3)} 90% 55% / 0.08)`,
                      }}
                    >
                      {initials(person.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-sm font-bold text-white">
                        {person.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] leading-snug text-slate-500 line-clamp-2">
                        {person.event}
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {person.phone && (
                      <span className="rounded-md border border-white/8 px-2 py-1 font-mono text-[10px] text-slate-400">
                        {person.phone}
                      </span>
                    )}
                    {person.email && (
                      <span className="truncate rounded-md border border-white/8 px-2 py-1 font-mono text-[10px] text-slate-400">
                        {person.email}
                      </span>
                    )}
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-signal-300 transition-colors group-hover:text-signal-100">
                    Event details
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.a>
              ))}
            </div>
          </>
        )}

        {/* ── CTA ── */}
        <Reveal>
          <div className="mt-16 flex flex-col items-center gap-4">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <Users className="h-3.5 w-3.5 text-signal-400" />
              Registration queries
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link to="/contact" className="btn-ghost">
                Contact the team
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/register" className="btn-ghost">
                Register now
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
