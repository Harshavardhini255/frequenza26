import { DEFAULT_SETTINGS } from "./site";
import { eventCategory } from "../utils/eventMeta";

/**
 * Programme derivation
 * ────────────────────────────────────────────────────────────────────────────
 * FREQUENZA '26 publishes a symposium date/time (14 October 2026, 09:00 IST) and
 * per-event timing rules inside each event's `rules` array — but it does NOT
 * publish a minute-by-minute timetable.
 *
 * So we do not fabricate one. Instead we surface exactly two kinds of real fact:
 *   1. the symposium start from DEFAULT_SETTINGS.event_date
 *   2. the timing sentences the organisers already published per event
 *
 * Anything a visitor cannot verify is stated as "announced on the day" rather
 * than guessed.
 */

const TIMING_RE =
  /\b\d+\s*(?:seconds?|secs?|minutes?|mins?|hours?|hrs?)\b|\btime\s+limit\b|\bbidding\s+time\b|\bper\s+round\b/i;

/** Leading clock-like label on a rule, when the organisers stated one. */
const CLOCK_RE = /^(\d{1,2})[:.](\d{2})\s*(AM|PM)?\b/i;

function cleanRule(rule) {
  return String(rule)
    // strips a leading bullet and/or list enumerator, e.g. "3. Each team ..."
    .replace(/^\s*(?:[\u2022\u2013\u2014-]\s*)?(?:\d+\s*[.)]\s*)?/, "")
    .trim();
}

export function extractTimings(event) {
  const rules = Array.isArray(event?.rules) ? event.rules : [];
  return rules
    .filter((rule) => TIMING_RE.test(rule))
    .map(cleanRule)
    .filter(Boolean);
}

/**
 * Builds the programme: the symposium start block followed by one block per
 * event that publishes at least one timing statement.
 */
export function buildProgramme(events) {
  const rawDate = DEFAULT_SETTINGS.event_date;
  const start = new Date(rawDate);
  const valid = !Number.isNaN(start.getTime());

  const startLabel = valid
    ? start
        .toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })
        .toUpperCase()
        .replace(/\s+/g, " ")
    : "09:00";

  const dateLabel = valid
    ? start
        .toLocaleDateString("en-GB", {
            day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
        .toUpperCase()
    : "14 OCTOBER 2026";

  const blocks = [
    {
      id: "symposium-start",
      kind: "start",
      time: `${startLabel} IST`,
      title: "Symposium Commences",
      subtitle: `Day 1 · ${dateLabel}`,
      body: `FREQUENZA '26 runs as a single-day symposium at ${DEFAULT_SETTINGS.venue}. Session-wise start times are announced by the respective event coordinators.`,
      timings: [],
    },
  ];

  const rest = (events ?? [])
    .map((event) => ({
      id: event.id,
      kind: "event",
      slug: event.slug,
      time: "Per round",
      title: event.name,
      subtitle: event.tagline || null,
      category: eventCategory(event),
      body: null,
      timings: extractTimings(event),
    }))
    .filter((block) => block.timings.length > 0);

  return [...blocks, ...rest];
}

export const PROGRAMME_NOTE =
  "Timings shown are the durations published in each event's official rules. Individual session start times are announced by the event coordinators on the day.";