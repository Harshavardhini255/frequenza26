import {
  ArrowRight,
  CircuitBoard,
  CodeXml,
  Cpu,
  Gamepad2,
  Lightbulb,
  Link2,
  Presentation,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";

import { CATEGORY_CHIPS, CATEGORY_LABELS } from "../data/brand";
import { eventCategory, isTechnical, teamSizeLabel } from "../utils/eventMeta";

const ICONS = {
  "tech-quest": Cpu,
  "ppt-presentation": Presentation,
  "code-debugging": CodeXml,
  "circuit-debugging": CircuitBoard,
  "truth-vs-trick": Gamepad2,
  "hint-drop": Lightbulb,
  connection: Link2,
  "ipl-auction": Trophy,
};

const RAILS = {
  technical: "bg-signal-gradient",
  non_technical: "bg-gradient-to-r from-ion-400 to-signal-400",
  special: "bg-gradient-to-r from-plasma-400 to-ion-400",
};

const ICON_TONE = {
  technical: "text-signal-300",
  non_technical: "text-ion-300",
  special: "text-plasma-300",
};

export default function EventCard({ event, onViewDetails, onRegisterSelect }) {
  if (!event) return null;

  const category = eventCategory(event);
  const technical = isTechnical(event);
  const Icon = ICONS[event.slug] ?? Cpu;
  const team = teamSizeLabel(event);

  return (
    <article
      className="glass-panel glass-panel-hover sheen group relative flex min-h-[430px] flex-col overflow-hidden rounded-2xl"
      onClick={() => onViewDetails?.(event)}
    >
      {/* category rail */}
      <span className={`absolute inset-x-0 top-0 h-[3px] ${RAILS[category]}`} />
      <span className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(34,200,236,0.07),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* corner brackets */}
      <span className="circuit-corner left-3 top-3 border-l border-t opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="circuit-corner right-3 top-3 border-r border-t opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="circuit-corner bottom-3 left-3 border-b border-l opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="circuit-corner bottom-3 right-3 border-b border-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* circuit ornament, illuminates on hover */}
      <svg
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-[0.14] transition-opacity duration-500 group-hover:opacity-40"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#22c8ec" strokeWidth="1" strokeLinecap="round">
          <path d="M100 12 H74 V30" />
          <path d="M100 34 H88 V48" />
          <path d="M100 60 H82" />
          <path d="M68 100 V84 H56" />
          <path d="M44 100 V90" />
        </g>
        <g fill="#22c8ec">
          <circle cx="74" cy="30" r="2" />
          <circle cx="88" cy="48" r="1.6" />
          <circle cx="82" cy="60" r="1.6" />
          <circle cx="56" cy="84" r="1.8" />
          <circle cx="44" cy="90" r="1.4" />
        </g>
      </svg>

      <div className="relative z-10 flex flex-1 flex-col p-6">
        {/* icon + category */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-signal-400/18 bg-void/70 transition-all duration-500 group-hover:border-signal-400/60 group-hover:shadow-[0_0_24px_-6px_rgba(34,200,236,0.8)]">
              <Icon className={`h-5 w-5 ${ICON_TONE[category]}`} />
            </span>
            <span
              className={`rounded-md px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                CATEGORY_CHIPS[category]
              }`}
            >
              {CATEGORY_LABELS[category]}
            </span>
          </div>

          {technical && (
            <span className="shrink-0 rounded-md border border-signal-400/40 bg-signal-400/10 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-signal-200">
              Compulsory
            </span>
          )}
        </div>

        {/* title */}
        <h3 className="flex items-start gap-2 font-display text-xl font-bold uppercase leading-tight tracking-wide text-white transition-colors duration-300 group-hover:text-signal-200">
          <span>{event.name}</span>
          <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </h3>

        {event.tagline && (
          <p className="mt-1.5 font-mono text-[11px] italic leading-relaxed text-signal-300/80">
            “{event.tagline}”
          </p>
        )}

        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-slate-400">
          {event.description}
        </p>

        {/* meta strip */}
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/6 pt-4">
          {team && (
            <div>
              <dt className="mono-label flex items-center gap-1.5 text-slate-500">
                <Users className="h-3 w-3" />
                Team
              </dt>
              <dd className="mt-1 text-[11px] font-medium text-slate-200">{team}</dd>
            </div>
          )}
          {event.max_participants ? (
            <div className={team ? "" : "col-span-2"}>
              <dt className="mono-label text-slate-500">Slots</dt>
              <dd className="mt-1 font-mono text-[11px] font-medium text-slate-200">
                {event.max_participants} participants
              </dd>
            </div>
          ) : null}
        </dl>

        {event.coordinator_name && (
          <div className="mt-4 flex items-center gap-2 border-t border-white/6 pt-4 text-[11px] text-slate-400">
            <UserCheck className="h-3.5 w-3.5 shrink-0 text-signal-500" />
            <span className="truncate">Coord. {event.coordinator_name}</span>
          </div>
        )}

        {/* actions */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(event);
            }}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 transition-colors hover:text-signal-200"
          >
            Rules &amp; Details
          </button>

          {onRegisterSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRegisterSelect(event);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-signal-400/30 bg-signal-400/10 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-signal-200 transition-all duration-300 hover:border-signal-400/70 hover:bg-signal-400/20 hover:shadow-[0_0_20px_-6px_rgba(34,200,236,0.8)]"
            >
              Select
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}