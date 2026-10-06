import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  MapPin,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";

import Countdown from "../components/Countdown";
import EventCard from "../components/EventCard";
import EventModal from "../components/EventModal";
import MagneticButton from "../components/MagneticButton";
import Oscilloscope from "../components/Oscilloscope";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import SignalBus from "../components/SignalBus";
import SignalTicker from "../components/SignalTicker";
import { BRAND } from "../data/brand";
import { PROGRAMME_NOTE, buildProgramme } from "../data/programme";
import { eventService, settingsService } from "../lib/services";
import Logo from "../components/Logo";

const EASE = [0.16, 1, 0.3, 1];

const FAQS = [
  {
    q: "Is registration for Technical Events mandatory?",
    a: "Yes! Every participant MUST register for at least 1 Technical Event. Once selected, you may optionally participate in Non-Technical events or the Special IPL Auction.",
  },
  {
    q: "What is the registration fee structure?",
    a: "The online registration fee is ₹250 per participant, granting entry to registered events. On-spot registration (if open) is ₹300.",
  },
  {
    q: "How do I submit my payment proof?",
    a: 'During Step 3 & 4 of registration, scan the UPI QR code or pay to "shyamroshan12@oksbi". Upload a clear screenshot of your payment receipt along with the 12-digit UPI Transaction ID.',
  },
  {
    q: "When will I receive my registration confirmation?",
    a: 'Upon submission, your registration receives a unique ID (FREQ26-XXXXX) with status "UNDER REVIEW". The committee verifies payments within 2–4 hours.',
  },
  {
    q: "Who can I contact for queries?",
    a: "You can contact Overall Student Coordinators: Jerush Thanusha (+91 88259 98947), Preethi (+91 93421 37108), Manoj (+91 78711 79650), or Natchathran (+91 93459 23091).",
  },
];

function heroWords() {
  return ["FREQUENZA", "'26"];
}

export default function Home() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [events, setEvents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      eventService.getEvents(),
      settingsService.getCoordinators(),
      settingsService.getSettings(),
    ])
      .then(([evts, coords, st]) => {
        if (!alive) return;
        setEvents(evts);
        setCoordinators(coords);
        setSettings(st);
      })
      .catch((err) => console.error("Failed to load symposium data:", err));
    return () => {
      alive = false;
    };
  }, []);

  const technicalEvents = useMemo(
    () => events.filter((e) => e.category === "technical"),
    [events],
  );
  const otherEvents = useMemo(
    () => events.filter((e) => e.category !== "technical"),
    [events],
  );

  // Schedule preview: the symposium start block + the three events with the
  // most specific published durations. Every value is quoted from the source
  // data — nothing is invented.
  const programmePreview = useMemo(() => {
    const all = buildProgramme(events);
    const start = all[0];
    const rest = all.slice(1).slice(0, 3);
    return [start, ...rest];
  }, [events]);

  const eventDate = settings?.event_date || "2026-10-14T09:00:00+05:30";
  const venue = settings?.venue || "Department of ECE, GCE Tirunelveli";
  const college =
    settings?.college_name || "Government College of Engineering, Tirunelveli";
  const department =
    settings?.department_name ||
    "Department of Electronics and Communication Engineering";

  const goRegister = (id) => {
    if (id) navigate("/register", { state: { preselectedEventId: id } });
    else navigate("/register");
  };

  return (
    <div className="relative">
      {/* ══════════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-32 pb-20">
        {/* ══ hero ambience: additive blooms + PCB substrate + scan ══ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          {/* color-dodge bloom — the "signal overdriving" core */}
          <div className="bloom-dodge absolute left-1/2 top-[40%] h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-500/25 blur-[120px] animate-bloom" />
          <div className="bloom-dodge absolute left-1/2 top-[40%] h-[300px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-300/20 blur-[80px] animate-ambient" />
          <div className="bloom-overlay absolute bottom-[6%] right-[4%] h-[380px] w-[380px] rounded-full bg-plasma-500/18 blur-[110px] animate-float-gentle" />
          <div className="bloom-overlay absolute left-[2%] top-[22%] h-[320px] w-[320px] rounded-full bg-ion-500/14 blur-[100px] animate-ambient" />

          <div className="absolute inset-0 traces-fine opacity-70 animate-grid-drift" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,6,12,0.85)_100%)]" />

          {/* instrument bezels */}
          <div className="absolute left-1/2 top-[40%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal-400/[0.07] animate-spin-slow" />
          <div className="absolute left-1/2 top-[40%] h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-signal-400/[0.055] animate-spin-reverse" />
        </div>

        {/* travelling scan line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-full overflow-hidden"
        >
          <div className="absolute inset-x-0 h-[38vh] animate-scan-sweep bg-gradient-to-b from-transparent via-signal-400/[0.055] to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* HUD corner registration marks */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
            <span className="absolute left-0 top-1/4 h-10 w-10 border-l border-t border-signal-400/25" />
            <span className="absolute right-0 top-1/4 h-10 w-10 border-r border-t border-signal-400/25" />
            <span className="absolute bottom-1/4 left-0 h-10 w-10 border-b border-l border-signal-400/25" />
            <span className="absolute bottom-1/4 right-0 h-10 w-10 border-b border-r border-signal-400/25" />
          </div>

          <div className="flex flex-col items-center text-center">
            {/* status strip */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="inline-flex items-center gap-2.5 rounded-full border border-signal-400/25 bg-ink/70 px-4 py-2 backdrop-blur-md"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-300" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-signal-200 sm:text-[11px]">
                National Level Technical Symposium
              </span>
            </motion.div>

            {/* crest with radar rings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="relative mt-9"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal-400/25 animate-radar"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal-400/20 animate-radar"
                style={{ animationDelay: "1.8s" }}
              />
              <Logo size="lg" showText={false} src={BRAND.logo} framed />
            </motion.div>

            {/* ══ wordmark — the dominant element ══ */}
            <h1 className="relative mt-10 flex flex-col items-center">
              <span className="sr-only">
                FREQUENZA &rsquo;26 &mdash; National Level Technical Symposium
              </span>

              {/* waveform running behind the wordmark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[190px] w-[135%] -translate-x-1/2 -translate-y-1/2 opacity-45 mix-blend-screen sm:h-[240px]"
              >
                <Oscilloscope grid={false} baseFreq={3} modFreq={8} subFreq={19} phase={0.4} />
              </span>

              {heroWords().map((word, i) => (
                <motion.span
                  key={word}
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 40, filter: "blur(18px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.1, delay: 0.22 + i * 0.14, ease: EASE }}
                  className={`poster-word block text-[19vw] leading-[0.8] sm:text-[15vw] lg:text-[11.5rem] ${
                    i === 0
                      ? "signal-gradient-text glow-signal"
                      : "text-white/95 [text-shadow:0_0_60px_rgba(34,200,236,0.35)]"
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* rule under the wordmark */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.2 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: EASE }}
              className="mt-7 h-px w-40 bg-gradient-to-r from-transparent via-signal-400/70 to-transparent sm:w-64"
            />

            {/* college / department */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
              className="mt-7 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base"
            >
              <span className="font-semibold text-signal-200">{college}</span>
              <span className="mx-2 text-slate-600">/</span>
              {department}
            </motion.p>

            {/* date + venue */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62, ease: EASE }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
            >
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-void/60 px-3.5 py-2 font-mono text-[11px] text-slate-200 backdrop-blur-md">
                <CalendarDays className="h-3.5 w-3.5 text-signal-400" />
                October 14, 2026
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-void/60 px-3.5 py-2 font-mono text-[11px] text-slate-200 backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-signal-400" />
                {venue}
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
              className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            >
              <MagneticButton to="/register" className="w-full sm:w-auto">
                Register Now
                <ArrowRight className="h-3.5 w-3.5" />
              </MagneticButton>
              <MagneticButton to="/events" variant="ghost" className="w-full sm:w-auto">
                Explore Events
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        {/* scroll cue */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute inset-x-0 bottom-5 hidden justify-center sm:flex"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="mono-label text-slate-600">Scroll</span>
            <motion.span
              animate={reduce ? {} : { y: [0, 7, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-7 w-px bg-gradient-to-b from-signal-400 to-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CINEMATIC TRANSITION — signal ticker
          ══════════════════════════════════════════════════════════════ */}
      <SignalTicker
        events={events}
        college={college}
        department={department}
        dateLabel="14 October 2026"
      />

      {/* ══════════════════════════════════════════════════════════════
          INSTRUMENT BAND — live scope + signal bus + countdown
          ══════════════════════════════════════════════════════════════ */}
      <section className="section-y relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="bloom-dodge absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-500/14 blur-[110px] animate-bloom" />
          <div className="absolute inset-0 traces-faint opacity-40" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* framed instrument panel */}
          <Reveal>
            <div className="glass-panel sheen relative overflow-hidden rounded-2xl px-4 pb-6 pt-5 sm:px-8">
              <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-70" />
              <span className="circuit-corner left-4 top-4 border-l border-t" />
              <span className="circuit-corner right-4 top-4 border-r border-t" />
              <span className="circuit-corner bottom-4 left-4 border-b border-l" />
              <span className="circuit-corner bottom-4 right-4 border-b border-r" />
              {/* vertical scan bar inside the panel */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan-bar bg-gradient-to-b from-transparent via-signal-400/[0.07] to-transparent"
              />

              <div className="relative flex items-center justify-between gap-4">
                <span className="mono-label inline-flex items-center gap-2 text-signal-300">
                  <Activity className="h-3.5 w-3.5" />
                  Live Signal Trace
                </span>
                <span className="hidden font-mono text-[10px] text-slate-500 sm:block">
                  CH-A · 1.00 kHz · SYNC
                </span>
              </div>

              <div className="relative mt-4 h-[130px] sm:h-[190px]">
                <Oscilloscope phase={0.6} intensity={0.95} />
              </div>

              <div className="relative mt-3 h-8">
                <SignalBus
                  nodes={Array.from({ length: 11 }, (_, i) => ({
                    id: i,
                    pct: ((i + 0.5) / 11) * 100,
                  }))}
                />
              </div>
            </div>
          </Reveal>

          {/* countdown */}
          <Reveal delay={0.1}>
            <div className="mt-10">
              <Countdown targetDateStr={eventDate} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          MANDATORY RULE BAND
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-9">
            <span className="absolute inset-0 traces-faint opacity-50" aria-hidden="true" />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="mono-label inline-flex items-center gap-2 rounded-md border border-signal-400/30 bg-signal-400/10 px-2.5 py-1 text-signal-200">
                  <Zap className="h-3 w-3" />
                  Mandatory rule
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-3xl">
                  1 Technical Event Compulsory for All Participants
                </h2>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
                  To promote core engineering research and practical technical skills, every
                  registered candidate must participate in at least one Technical Event (Tech
                  Quest, PPT Presentation, Code Debugging, or Circuit Debugging).
                </p>
              </div>
              <MagneticButton to="/register" className="w-full shrink-0 lg:w-auto">
                Select Technical Event
                <ArrowRight className="h-3.5 w-3.5" />
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TECHNICAL EVENTS
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Core ECE competitions"
            title="Technical"
            accent="Events"
            lede="Every registered participant must select at least one of these events."
          />
          <Reveal delay={0.1}>
            <Link
              to="/events?category=technical"
              className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-signal-300 transition-colors hover:text-signal-100"
            >
              View all technical events
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {technicalEvents.map((evt, i) => (
            <Reveal key={evt.id} delay={i * 0.08} className="h-full">
              <EventCard
                event={evt}
                onViewDetails={setSelectedEvent}
                onRegisterSelect={(e) => goRegister(e.id)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          NON-TECHNICAL & SPECIAL
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Open category"
          title="Non-Technical &"
          accent="Special"
          lede="Optional additions to your registration, including the exclusive IPL Mock Auction."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {otherEvents.map((evt, i) => (
            <Reveal key={evt.id} delay={i * 0.08} className="h-full">
              <EventCard
                event={evt}
                onViewDetails={setSelectedEvent}
                onRegisterSelect={(e) => goRegister(e.id)}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.16}>
          <div className="mt-12 flex justify-center">
            <MagneticButton to="/events" variant="ghost">
              Explore the full event matrix
            </MagneticButton>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SCHEDULE PREVIEW
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Day programme"
          title="Signal"
          accent="Schedule"
          lede="A single-day symposium on 14 October 2026. Below are the timings published in each event's official rules."
        />

        <Reveal delay={0.1}>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {programmePreview.map((block) => (
              <Link
                key={block.id}
                to="/schedule"
                className="glass-panel glass-panel-hover group relative flex flex-col overflow-hidden rounded-xl p-6"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-60" />
                <span className="circuit-corner right-3 top-3 border-r border-t opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-signal-300">
                    {block.time}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-base font-bold uppercase leading-tight tracking-wide text-white">
                  {block.title}
                </h3>

                <ul className="mt-3 space-y-1.5">
                  {block.timings.slice(0, 2).map((t, i) => (
                    <li
                      key={i}
                      className="line-clamp-2 font-mono text-[10px] leading-relaxed text-slate-400"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="max-w-2xl text-center font-mono text-[10px] leading-relaxed tracking-wide text-slate-500">
              {PROGRAMME_NOTE}
            </p>
            <Link to="/schedule" className="btn-ghost">
              Open full schedule
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          COORDINATORS
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Organising committee"
          title="Overall Student"
          accent="Coordinators"
          align="center"
          lede="Reach out to the coordinating team for registration, payment or venue queries."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coordinators.map((c, i) => (
            <Reveal key={c.id ?? i} delay={i * 0.08} className="h-full">
              <CoordinatorCard person={c} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-4xl px-4 pt-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Need clarity?"
          title="Frequently Asked"
          accent="Questions"
          align="center"
        />

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, index) => (
            <Reveal key={index} delay={index * 0.05}>
              <div className="glass-panel glass-panel-hover overflow-hidden rounded-xl">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span className="font-display text-sm font-semibold text-white sm:text-[15px]">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-signal-400/20 text-signal-300 transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-white/6 px-5 py-4 text-[13px] leading-relaxed text-slate-300 sm:px-6">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-panel relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12">
            <span className="absolute inset-0 traces-faint opacity-40" aria-hidden="true" />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-56 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-500/14 blur-[110px]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-signal-400/25 bg-signal-400/8 px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-signal-200">
                <Radio className="h-3 w-3 animate-pulse" />
                Registration Open
              </span>

              <h2 className="display-mask mx-auto mt-6 max-w-3xl text-3xl text-white sm:text-5xl">
                Register for <span className="signal-gradient-text">FREQUENZA '26</span>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
                One registration, one compulsory technical event, and optional open-category
                additions. Online fee ₹250 per participant.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <MagneticButton to="/register">
                  Register Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </MagneticButton>
                <MagneticButton to="/contact" variant="ghost">
                  Contact Committee
                </MagneticButton>
              </div>

              <div className="mt-9 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <Sparkles className="h-3 w-3 text-plasma-400" />
                Government College of Engineering, Tirunelveli
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegisterSelect={(id) => {
          setSelectedEvent(null);
          goRegister(id);
        }}
      />
    </div>
  );
}

/* ── Shared coordinator card (also used on /team) ─────────────────────── */
export function CoordinatorCard({ person }) {
  if (!person) return null;
  const initials = person.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="glass-panel glass-panel-hover group relative flex h-full flex-col overflow-hidden rounded-xl p-6 text-center">
      <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-50" />
      <span className="circuit-corner left-3 top-3 border-l border-t opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="circuit-corner bottom-3 right-3 border-b border-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* hex node avatar */}
      <div className="relative mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-signal-500/20 blur-lg transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-signal-400/35 bg-void/80 font-display text-xl font-bold text-signal-200">
          {initials}
        </div>
      </div>

      <h3 className="mt-5 font-display text-base font-bold uppercase tracking-wide text-white">
        {person.name}
      </h3>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-signal-300">
        {person.role}
      </p>

      <div className="mt-auto pt-5">
        {person.phone && (
          <a
            href={`tel:${person.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-2 rounded-lg border border-signal-400/18 bg-void/50 px-3 py-2 font-mono text-[11px] text-slate-300 transition-colors hover:border-signal-400/55 hover:text-signal-200"
          >
            {person.phone}
          </a>
        )}
        {person.email && (
          <a
            href={`mailto:${person.email}`}
            className="mt-2 block truncate font-mono text-[10px] text-slate-500 transition-colors hover:text-signal-300"
          >
            {person.email}
          </a>
        )}
      </div>
    </div>
  );
}