/**
 * Brand assets & identity constants for FREQUENZA '26.
 *
 * logo: the official crest. Note this is an opaque 1024x1024 JPEG with no
 * alpha channel, so it is always presented inside a designed "emblem plate"
 * (see components/Logo.jsx) rather than blended directly into the dark theme.
 */
export const BRAND = {
  logo: "/frequenza_logo.jpg",
  upiQr: "/upi_qr.jpg",
  favicon: "/favicon.svg",
};

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/schedule", label: "Schedule" },
  { to: "/team", label: "Team" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const CATEGORY_LABELS = {
  technical: "Technical Event",
  non_technical: "Non-Technical Event",
  special: "Special Event",
};

export const CATEGORY_CHIPS = {
  technical: "chip-technical",
  non_technical: "chip-nontechnical",
  special: "chip-special",
};