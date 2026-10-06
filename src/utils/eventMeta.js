/**
 * Event metadata helpers.
 *
 * Everything here is DERIVED from the existing FREQUENZA event data in
 * src/data/site.js — nothing is invented. Team size in particular is not a
 * field on the event object, so we surface the exact sentence the organisers
 * already published in that event's `rules` array, and simply omit the row
 * when no such sentence exists.
 */

const TEAM_SIZE_HINTS = [
  /team\s*size/i,
  /team\s*members?\s*limit/i,
  /consist\s+of/i,
  /can\s+have/i,
  /group\s+of/i,
  /compete\s+individually/i,
];

/**
 * Returns the published team-composition sentence for an event, or null when
 * the rules do not state one.
 */
export function extractTeamSize(event) {
  const rules = event?.rules;
  if (!Array.isArray(rules)) return null;
  const hit = rules.find((rule) =>
    TEAM_SIZE_HINTS.some((re) => re.test(rule)),
  );
  if (!hit) return null;
  return hit
    .replace(/^\s*(?:[\u2022\u2013\u2014-]\s*)?(?:\d+\s*[.)]\s*)?/, "") // strip bullets / numbering
    .trim();
}

export function eventCategory(event) {
  const c = event?.category ?? "technical";
  if (c === "technical") return "technical";
  if (c === "special") return "special";
  return "non_technical";
}

export function isTechnical(event) {
  return eventCategory(event) === "technical";
}

/** "3–4 members" style short label, derived from the published sentence. */
export function teamSizeLabel(event) {
  const full = extractTeamSize(event);
  if (!full) return null;

  /* "Individual" only counts when the sentence really permits solo entry —
     Tech Quest states that individual participation "is not allowed". */
  const individuals =
    /compete\s+individually|individual\s+participation/i.test(full) &&
    !/individual\s+participation\s+is\s+not\s+allowed/i.test(full);

  const range = full.match(/(\d+)\s*[–-]\s*(\d+)\s*(?:members|participants)/i);
  const minMax = full.match(/minimum:?\s*(\d+)[\s\S]*maximum:?\s*(\d+)/i);
  const group = full.match(/group\s+of\s+(\d+)/i);
  const upto = full.match(/up\s*(?:to)?\s*(\d+)/i);
  const exact = full.match(/(\d+)\s+members?\s+per\s+team/i);
  /* "Team Size: 2 Members" — an exact, fixed-size team. */
  const fixed = full.match(/team\s*size:?\s*(\d+)\s*(?:members?)?/i);

  let label = null;
  if (range) label = `${range[1]}–${range[2]} members`;
  else if (minMax) label = `${minMax[1]}–${minMax[2]} members / team`;
  else if (group) label = `Group of ${group[1]}`;
  else if (upto) label = `Up to ${upto[1]} members`;
  else if (exact) label = `${exact[1]} members / team`;
  else if (fixed) label = `${fixed[1]} member${fixed[1] === "1" ? "" : "s"}`;

  // Events that allow either solo or team entry must not hide the solo option.
  if (individuals) return label ? `Individual or ${label.toLowerCase()}` : "Individual";
  return label;
}