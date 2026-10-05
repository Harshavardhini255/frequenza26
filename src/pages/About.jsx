import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cpu,
  GraduationCap,
  Network,
  Radio,
  Signal,
  Trophy,
} from "lucide-react";

import MagneticButton from "../components/MagneticButton";
import Oscilloscope from "../components/Oscilloscope";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import SignalBus from "../components/SignalBus";
import { eventService } from "../lib/services";
import PageAtmosphere from "../components/PageAtmosphere";

/* The two paragraphs and the four highlight lines below are the original
   FREQUENZA '26 About copy, preserved verbatim. */

const HIGHLIGHTS = [
  "National Level Technical Competitions with cash awards",
  "Interactive IPL Mock Auction Special Event",
  "Networking opportunity with top engineering colleges",
  "Official certificates issued to all verified participants",
];

const HIGHLIGHT_ICONS = [Trophy, Radio, Network, GraduationCap];

export default function About() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let alive = true;
    eventService
      .getEvents()
      .then((list) => alive && setEvents(list))
      .catch((err) => console.error("Failed to load events for About:", err));
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const technical = events.filter((e) => e.category === "technical").length;
    return [
      { label: "Est.", value: "1981", icon: GraduationCap },
      { label: "Technical events", value: technical || 4, icon: Cpu },
      { label: "Total events", value: events.length || 8, icon: Signal },
      { label: "Level", value: "National", icon: Trophy },
    ];
  }, [events]);

  return (
    <div className="section-y relative">
      <PageAtmosphere variant="default" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading as="h1"
          eyebrow="Dept of Electronics & Communication Engineering"
          title="About"
          accent="FREQUENZA '26"
          align="center"
          lede="Government College of Engineering, Tirunelveli — Empowering Engineering Excellence Since 1981."
        />

        {/* ── derived stats ── */}
        <Reveal delay={0.12}>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel glass-panel-hover sheen group relative overflow-hidden rounded-xl px-4 py-5 text-center"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-50" />
                <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,200,236,0.09),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <stat.icon className="mx-auto h-4 w-4 text-signal-400 transition-transform duration-500 group-hover:scale-110" />
                <div className="display-mask mt-2.5 font-display text-2xl font-bold">
                  {stat.value}
                </div>
                <div className="mono-label mt-1 text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── institution + department ── */}
        <div className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <article className="glass-panel sheen relative h-full overflow-hidden rounded-2xl p-6 sm:p-8">
              <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
              <span className="circuit-corner left-4 top-4 border-l border-t" />

              <h2 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-white sm:text-2xl">
                Government College of Engineering, Tirunelveli
              </h2>
              <div className="mt-3 h-6">
                <SignalBus nodes={Array.from({ length: 4 }, (_, i) => ({ id: i, pct: 12 + i * 25 }))} />
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300 sm:text-sm">
                Government College of Engineering, Tirunelveli (GCE Tirunelveli) is a premier
                state government engineering institution located in Tamil Nadu, India. Established
                in 1981, the college offers high-quality technical education in core engineering
                disciplines and has cultivated thousands of successful innovators, researchers,
                and industrial leaders across the globe.
              </p>
            </article>
          </Reveal>

          {/* frequency visualiser */}
          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="glass-panel sheen relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6">
              <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
              <span className="circuit-corner right-4 top-4 border-r border-t" />

              <div className="flex items-center justify-between">
                <span className="mono-label text-signal-300">Live Trace</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-300 animate-pulse" />
                  1.00 kHz
                </span>
              </div>

              <div className="my-6 h-28">
                <Oscilloscope baseFreq={2} modFreq={5} subFreq={11} phase={1.4} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>SPECTRUM</span>
                  <span>−32 dB</span>
                </div>
                <Oscilloscope
                  grid={false}
                  baseFreq={5}
                  modFreq={9}
                  subFreq={17}
                  phase={2.2}
                  spectrum
                  className="opacity-80"
                />
              </div>

              <p className="mt-6 font-mono text-[10px] leading-relaxed tracking-wide text-slate-500">
                Electronics · Signal Processing · Embedded Systems · Communication · Robotics
              </p>
            </div>
          </Reveal>
        </div>

        {/* ── department ── */}
        <Reveal>
          <article className="glass-panel sheen relative mt-6 overflow-hidden rounded-2xl p-6 sm:p-8">
            <span className="absolute inset-0 traces-faint opacity-40" aria-hidden="true" />
            <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
            <span className="circuit-corner right-4 top-4 border-r border-t" />

            <div className="relative">
              <h2 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-white sm:text-2xl">
                Department of Electronics and Communication Engineering
              </h2>
              <div className="mt-3 h-6">
                <SignalBus nodes={Array.from({ length: 5 }, (_, i) => ({ id: i, pct: 10 + i * 20 }))} />
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300 sm:text-sm">
                The ECE Department at GCE Tirunelveli is dedicated to cutting-edge research in
                VLSI, Signal Processing, Embedded Systems, Communication Systems, and Robotics.
                FREQUENZA is the annual flagship National Level Technical Symposium organized by
                the ECE Association, designed to ignite technical passion, promote healthy
                competition, and showcase student engineering innovations.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {HIGHLIGHTS.map((item, i) => {
                  const Icon = HIGHLIGHT_ICONS[i];
                  return (
                    <div
                      key={item}
                      className="group flex items-start gap-3 rounded-xl border border-white/6 bg-void/45 p-4 transition-all duration-300 hover:border-signal-400/35 hover:bg-signal-400/[0.04]"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-signal-400/25 bg-signal-400/8">
                        <Icon className="h-4 w-4 text-signal-300" />
                      </span>
                      <span className="text-[13px] leading-relaxed text-slate-300">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        </Reveal>

        {/* ── CTA ── */}
        <Reveal>
          <div className="mt-14 flex flex-col items-center gap-4">
            <h3 className="display-mask text-center text-2xl text-white sm:text-4xl">
              Ready to <span className="signal-gradient-text">transmit?</span>
            </h3>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <MagneticButton to="/events">
                Explore Events
                <ArrowRight className="h-3.5 w-3.5" />
              </MagneticButton>
              <MagneticButton to="/register" variant="ghost">
                Register Now
              </MagneticButton>
            </div>
            <Link
              to="/schedule"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 underline-offset-4 transition-colors hover:text-signal-300 hover:underline"
            >
              View day schedule
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
