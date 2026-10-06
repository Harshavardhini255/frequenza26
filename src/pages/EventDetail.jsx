import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  Users,
} from "lucide-react";

import MagneticButton from "../components/MagneticButton";
import Oscilloscope from "../components/Oscilloscope";
import Reveal from "../components/Reveal";
import SignalBus from "../components/SignalBus";
import { CATEGORY_CHIPS, CATEGORY_LABELS } from "../data/brand";
import { eventCategory, extractTeamSize, isTechnical, teamSizeLabel } from "../utils/eventMeta";
import { eventService } from "../lib/services";
import PageAtmosphere from "../components/PageAtmosphere";

const HEADER_RE = /^\d+\.\s+[A-Z][A-Z\s&/]+$/;

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fixed: previously useEffect was invoked inside the JSX return, which is a
  // conditional hook call and breaks the rules of hooks.
  useEffect(() => {
    let alive = true;
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    eventService
      .getEventBySlug(slug)
      .then((evt) => {
        if (!alive) return;
        setEvent(evt);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load event:", err);
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-signal-300">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-300 animate-pulse" />
          Loading event record
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Event Not Found
        </h2>
        <p className="mt-2 max-w-sm text-[13px] text-slate-400">
          The requested event slug could not be found.
        </p>
        <Link to="/events" className="btn-ghost mt-7">
          Back to events listing
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const category = eventCategory(event);
  const technical = isTechnical(event);
  const teamFull = extractTeamSize(event);
  const teamShort = teamSizeLabel(event);

  return (
    <div className="section-y relative">
      <PageAtmosphere variant="detail" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-signal-300 transition-colors hover:text-signal-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to all events
          </Link>
        </Reveal>

        {/* ── header panel ── */}
        <Reveal delay={0.05}>
          <header className="glass-panel relative mt-6 overflow-hidden rounded-2xl p-6 sm:p-9">
            <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
            <span className="circuit-corner left-5 top-5 border-l border-t" />
            <span className="circuit-corner right-5 top-5 border-r border-t" />

            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-signal-500/10 blur-[90px]"
            />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                    CATEGORY_CHIPS[category]
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </span>
                {technical && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Fulfils compulsory requirement
                  </span>
                )}
              </div>

              <h1 className="display-mask mt-5 text-3xl text-white sm:text-5xl">
                {event.name}
              </h1>

              {event.tagline && (
                <p className="mt-3 font-mono text-xs italic text-signal-300 sm:text-sm">
                  “{event.tagline}”
                </p>
              )}

              <div className="mt-5 h-6 max-w-md">
                <SignalBus nodes={Array.from({ length: 5 }, (_, i) => ({ id: i, pct: 10 + i * 20 }))} />
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300">
                {event.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/6 pt-7 sm:flex-row sm:items-center">
                <MagneticButton
                  onClick={() =>
                    navigate("/register", { state: { preselectedEventId: event.id } })
                  }
                >
                  Register for this event
                  <ArrowRight className="h-3.5 w-3.5" />
                </MagneticButton>

                <Link
                  to="/events"
                  className="btn-ghost"
                >
                  Browse other events
                </Link>
              </div>
            </div>
          </header>
        </Reveal>

        {/* ── facts ── */}
        {(teamShort || event.max_participants) && (
          <Reveal delay={0.1}>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {teamFull && (
                <div className="glass-panel rounded-xl p-5">
                  <div className="mono-label flex items-center gap-1.5 text-slate-500">
                    <Users className="h-3 w-3" />
                    Team composition
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-200">{teamFull}</p>
                </div>
              )}
              {event.max_participants && (
                <div className="glass-panel rounded-xl p-5">
                  <div className="mono-label text-slate-500">Total seats</div>
                  <p className="mt-2 font-mono text-lg font-bold text-signal-200">
                    {event.max_participants} participants
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* ── rules ── */}
        {Array.isArray(event.rules) && event.rules.length > 0 && (
          <Reveal delay={0.14}>
            <section className="glass-panel relative mt-6 overflow-hidden rounded-2xl p-6 sm:p-8">
              <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
              <span className="circuit-corner right-5 top-5 border-r border-t" />

              <h2 className="eyebrow">Official rules &amp; guidelines</h2>

              <ul className="mt-5 space-y-3">
                {event.rules.map((rule, i) =>
                  HEADER_RE.test(rule.trim()) ? (
                    <li
                      key={i}
                      className="pt-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-300"
                    >
                      {rule}
                    </li>
                  ) : (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-500" />
                      <span className="text-[13px] leading-relaxed text-slate-300">{rule}</span>
                    </li>
                  ),
                )}
              </ul>
            </section>
          </Reveal>
        )}

        {/* ── waveform flourish ── */}
        <Reveal delay={0.16}>
          <div className="mt-6 h-20 opacity-40">
            <Oscilloscope baseFreq={4} modFreq={8} subFreq={15} phase={0.9} grid={false} />
          </div>
        </Reveal>

        {/* ── coordinator ── */}
        {event.coordinator_name && (
          <Reveal delay={0.18}>
            <section className="glass-panel mt-6 flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <div className="mono-label text-slate-500">Event student coordinator</div>
                <div className="mt-1.5 font-display text-xl font-bold text-white">
                  {event.coordinator_name}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {event.coordinator_phone && (
                    <a
                      href={`tel:${event.coordinator_phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-signal-400/25 bg-signal-400/8 px-3 py-2 font-mono text-[11px] text-signal-200 transition-colors hover:border-signal-400/60 hover:bg-signal-400/15"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {event.coordinator_phone}
                    </a>
                  )}
                  {event.coordinator_email && (
                    <a
                      href={`mailto:${event.coordinator_email}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-void/60 px-3 py-2 font-mono text-[11px] text-slate-300 transition-colors hover:border-signal-400/50 hover:text-signal-200"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {event.coordinator_email}
                    </a>
                  )}
                </div>
              </div>

              {event.coordinator_phone && (
                <motion.a
                  whileHover={{ y: -3 }}
                  href={`tel:${event.coordinator_phone.replace(/\s+/g, "")}`}
                  className="btn-ghost w-full shrink-0 sm:w-auto"
                >
                  Call coordinator
                </motion.a>
              )}
            </section>
          </Reveal>
        )}
      </div>
    </div>
  );
}
