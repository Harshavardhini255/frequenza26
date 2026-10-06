import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  Users,
  X,
} from "lucide-react";

import { CATEGORY_CHIPS, CATEGORY_LABELS } from "../data/brand";
import { eventCategory, extractTeamSize, isTechnical, teamSizeLabel } from "../utils/eventMeta";

const HEADER_RE = /^\d+\.\s+[A-Z][A-Z\s&/]+$/;

/**
 * EventModal
 * ────────────────────────────────────────────────────────────────────────────
 * Shows the complete published FREQUENZA information for an event: title,
 * tagline, description, team composition, rules, and coordinator contact.
 * Nothing here is generated — every field comes from the event record.
 */
export default function EventModal({ event, onClose, onRegisterSelect }) {
  const open = Boolean(event);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const category = eventCategory(event);
  const technical = isTechnical(event);
  const teamFull = extractTeamSize(event);
  const teamShort = teamSizeLabel(event);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-void/85 p-3 backdrop-blur-md sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={event.name}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
          >
            {/* header */}
            <div className="relative shrink-0 overflow-hidden border-b border-signal-400/12 bg-gradient-to-r from-panel-2/80 to-void/80 px-5 py-5 sm:px-7 sm:py-6">
              <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close event details"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-void/60 text-slate-400 transition-colors hover:border-signal-400/50 hover:text-signal-200"
              >
                <X className="h-4 w-4" />
              </button>

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
                    Fulfils mandatory requirement
                  </span>
                )}
              </div>

              <h2 className="mt-3 pr-10 font-display text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-3xl">
                {event.name}
              </h2>

              {event.tagline && (
                <p className="mt-2 font-mono text-xs italic text-signal-300">
                  “{event.tagline}”
                </p>
              )}
            </div>

            {/* body */}
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
              <section>
                <h3 className="eyebrow">Overview</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {event.description}
                </p>
              </section>

              {(teamShort || event.max_participants) && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {teamShort && (
                    <div className="rounded-xl border border-signal-400/15 bg-void/50 p-4">
                      <div className="mono-label flex items-center gap-1.5 text-slate-500">
                        <Users className="h-3 w-3" />
                        Team size
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-signal-200">
                        {teamShort}
                      </div>
                    </div>
                  )}
                  {event.max_participants ? (
                    <div className="rounded-xl border border-signal-400/15 bg-void/50 p-4">
                      <div className="mono-label text-slate-500">Total seats</div>
                      <div className="mt-1.5 font-mono text-sm font-semibold text-signal-200">
                        {event.max_participants} participants
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {Array.isArray(event.rules) && event.rules.length > 0 && (
                <section>
                  <h3 className="eyebrow">Rules &amp; regulations</h3>
                  <ul className="mt-3 space-y-2.5">
                    {event.rules.map((rule, i) =>
                      HEADER_RE.test(rule.trim()) ? (
                        <li
                          key={i}
                          className="pt-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-signal-300"
                        >
                          {rule}
                        </li>
                      ) : (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-500" />
                          <span className="text-[13px] leading-relaxed text-slate-300">
                            {rule}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </section>
              )}

              {event.coordinator_name && (
                <section className="rounded-xl border border-signal-400/18 bg-void/55 p-4 sm:p-5">
                  <div className="mono-label text-slate-500">
                    Event student coordinator
                  </div>
                  <div className="mt-1.5 font-display text-lg font-semibold text-white">
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
                </section>
              )}
            </div>

            {/* footer */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-signal-400/12 bg-void/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-white/8 px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:border-signal-400/40 hover:text-signal-200 sm:w-auto"
              >
                Close
              </button>

              {onRegisterSelect && (
                <button
                  type="button"
                  onClick={() => onRegisterSelect(event.id)}
                  className="btn-primary w-full !py-3 !text-[11px] sm:w-auto"
                >
                  Register for this event
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}