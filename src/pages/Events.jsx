import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Filter, Gamepad2, Search, Trophy } from "lucide-react";

import EventCard from "../components/EventCard";
import EventModal from "../components/EventModal";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { eventService } from "../lib/services";
import PageAtmosphere from "../components/PageAtmosphere";

const FILTERS = [
  { id: "all", label: "All Events", icon: Filter },
  { id: "technical", label: "Technical (Compulsory)", icon: Cpu },
  { id: "non_technical", label: "Non-Technical", icon: Gamepad2 },
  { id: "special", label: "Special IPL", icon: Trophy },
];

const EASE = [0.16, 1, 0.3, 1];

export default function Events() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "all";

  const setCategory = (id) => {
    if (id === "all") setSearchParams({}, { replace: true });
    else setSearchParams({ category: id }, { replace: true });
  };

  useEffect(() => {
    let alive = true;
    eventService
      .getEvents()
      .then((list) => alive && setEvents(list))
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((evt) => {
        const matchesCategory = category === "all" || evt.category === category;
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          evt.name.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          (evt.tagline && evt.tagline.toLowerCase().includes(q)) ||
          (evt.coordinator_name &&
            evt.coordinator_name.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
      }),
    [events, category, search],
  );

  const counts = useMemo(
    () => ({
      all: events.length,
      technical: events.filter((e) => e.category === "technical").length,
      non_technical: events.filter((e) => e.category === "non_technical").length,
      special: events.filter((e) => e.category === "special").length,
    }),
    [events],
  );

  return (
    <div className="section-y relative">
      <PageAtmosphere variant="events" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading as="h1"
          eyebrow="FREQUENZA '26 symposium"
          title="All Symposium"
          accent="Events"
          align="center"
          lede={
            <>
              1 Technical Event registration is strictly{" "}
              <strong className="text-signal-300">compulsory</strong> for all participants.
              Non-Technical events are optional additions.
            </>
          }
        />

        {/* ── filter + search ── */}
        <Reveal delay={0.1}>
          <div className="glass-panel sticky top-[72px] z-30 mt-12 rounded-2xl p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
                {FILTERS.map((f) => {
                  const active = category === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCategory(f.id)}
                      aria-pressed={active}
                      className={`relative shrink-0 rounded-xl px-3.5 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.11em] transition-colors duration-300 ${
                        active
                          ? "text-void"
                          : "border border-white/6 bg-void/50 text-slate-300 hover:border-signal-400/40 hover:text-signal-200"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="event-filter-pill"
                          className="absolute inset-0 -z-10 rounded-xl bg-signal-gradient shadow-[0_0_24px_-6px_rgba(34,200,236,0.6)]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="inline-flex items-center gap-2">
                        <f.icon className="h-3.5 w-3.5" />
                        {f.label}
                        <span
                          className={`font-mono text-[10px] ${active ? "text-void/70" : "text-slate-500"}`}
                        >
                          {counts[f.id]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events or coordinators..."
                  aria-label="Search events"
                  className="w-full rounded-xl border border-signal-400/18 bg-void/60 py-2.5 pl-10 pr-4 font-mono text-[11px] text-white placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── grid ── */}
        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="glass-panel h-72 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((evt, i) => (
                  <motion.div
                    key={evt.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.24), ease: EASE }}
                  >
                    <EventCard
                      event={evt}
                      onViewDetails={setSelectedEvent}
                      onRegisterSelect={(e) => navigate("/register", { state: { preselectedEventId: e.id } })}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="glass-panel rounded-2xl px-6 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-signal-500/50" />
              <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-wide text-white">
                No events found
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[13px] text-slate-400">
                Try clearing your search query or selecting a different category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
                className="btn-ghost mt-6"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegisterSelect={(id) => {
          setSelectedEvent(null);
          navigate("/register", { state: { preselectedEventId: id } });
        }}
      />
    </div>
  );
}
