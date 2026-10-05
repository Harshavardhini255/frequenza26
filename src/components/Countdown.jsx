import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio, Sparkles } from "lucide-react";

/**
 * Countdown
 * ────────────────────────────────────────────────────────────────────────────
 * Logic preserved from the original component (event-day, completed, and
 * standard diff states). The presentation is now a futuristic digital
 * readout with rolling digits, corner brackets and a scan sweep.
 */

function compute(targetDateStr) {
  const target = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const diff = target - now;
  const targetDay = new Date(targetDateStr).toDateString();
  const today = new Date().toDateString();

  if (targetDay === today) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: false, isEventDay: true };
  }

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true, isEventDay: false };
  }

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isCompleted: false,
    isEventDay: false,
  };
}

function Unit({ value, label, delay = 0 }) {
  const padded = String(value).padStart(2, "0");

  return (
    <div
      className="glass-panel animate-border-pulse group relative flex h-[86px] w-[74px] flex-col items-center justify-center overflow-hidden rounded-xl sm:h-[112px] sm:w-[104px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* top signal rail */}
      <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-70" />

      {/* corner brackets */}
      <span className="circuit-corner left-1.5 top-1.5 border-l border-t" />
      <span className="circuit-corner right-1.5 top-1.5 border-r border-t" />
      <span className="circuit-corner bottom-1.5 left-1.5 border-b border-l" />
      <span className="circuit-corner bottom-1.5 right-1.5 border-b border-r" />

      {/* rolling digits */}
      <div className="relative h-[42px] w-full overflow-hidden sm:h-[58px]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={padded}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center font-mono text-[30px] font-bold tabular-nums leading-none text-white text-signal-glow sm:text-[44px]"
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="mono-label mt-1.5 text-signal-300/90">{label}</span>

      {/* scan sweep */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute inset-x-0 h-8 animate-scan-sweep bg-gradient-to-b from-transparent via-signal-400/8 to-transparent" />
      </span>
    </div>
  );
}

export default function Countdown({ targetDateStr = "2026-10-14T09:00:00+05:30" }) {
  const [timeLeft, setTimeLeft] = useState(() => compute(targetDateStr));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(compute(targetDateStr)), 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (timeLeft.isEventDay) {
    return (
      <div className="glass-panel inline-flex animate-border-pulse items-center gap-3 rounded-2xl border border-signal-400/50 px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-signal-200 sm:text-base">
        <Radio className="h-5 w-5 animate-pulse text-signal-300" />
        Event Day Is Here — October 14, 2026
      </div>
    );
  }

  if (timeLeft.isCompleted) {
    return (
      <div className="glass-panel inline-flex items-center gap-3 rounded-2xl px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-slate-300 sm:text-base">
        <Sparkles className="h-5 w-5 text-plasma-400" />
        FREQUENZA '26 Event Completed
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
        {units.map((unit, i) => (
          <Unit key={unit.label} value={unit.value} label={unit.label} delay={i * 260} />
        ))}
      </div>
      <span className="mono-label text-slate-500">
        Signal lock · 14 October 2026 · 09:00 IST
      </span>
    </div>
  );
}