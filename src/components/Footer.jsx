import { Link } from "react-router-dom";
import { CircuitBoard, Mail, MapPin, Phone, Zap } from "lucide-react";

import Logo from "./Logo";
import SignalBus from "./SignalBus";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/events", label: "All Events" },
  { to: "/events/ipl-auction", label: "Special IPL Auction" },
  { to: "/schedule", label: "Day Schedule" },
  { to: "/team", label: "The Team" },
  { to: "/register", label: "Online Registration" },
  { to: "/participant/status", label: "Track Payment Status" },
];

const TECHNICAL_LINKS = [
  { to: "/events/tech-quest", label: "Tech Quest (Technical Quiz)" },
  { to: "/events/ppt-presentation", label: "Paper / PPT Presentation" },
  { to: "/events/code-debugging", label: "Code Debugging" },
  { to: "/events/circuit-debugging", label: "Circuit Debugging" },
];

const CONTACTS = [
  { phone: "+91 88259 98947", name: "Jerush Thanusha" },
  { phone: "+91 93421 37108", name: "Preethi" },
  { phone: "+91 78711 79650", name: "Manoj" },
  { phone: "+91 93459 23091", name: "Natchathran" },
];

function linkList(items) {
  return items.map((item) => (
    <li key={item.to}>
      <Link
        to={item.to}
        className="group inline-flex items-center gap-2 text-[12.5px] text-slate-400 transition-colors duration-300 hover:text-signal-200"
      >
        <span className="h-px w-0 bg-signal-400 transition-all duration-300 group-hover:w-3" />
        {item.label}
      </Link>
    </li>
  ));
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-signal-400/12 bg-void/70 pt-14 pb-10">
      <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient opacity-70" />
      <span className="absolute inset-0 traces-faint opacity-30" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-signal-500/8 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* brand */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-[12.5px] leading-relaxed text-slate-400">
              FREQUENZA '26 is the premier National Level Technical Symposium organized by the
              Department of Electronics and Communication Engineering at Government College of
              Engineering, Tirunelveli.
            </p>
            <div className="h-5 w-40">
              <SignalBus nodes={[{ id: "a", pct: 20 }, { id: "b", pct: 55 }, { id: "c", pct: 85 }]} />
            </div>
          </div>

          {/* quick links */}
          <div>
            <h4 className="mono-label text-signal-300">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">{linkList(QUICK_LINKS)}</ul>
          </div>

          {/* technical events */}
          <div>
            <h4 className="mono-label text-signal-300">Technical Events</h4>
            <ul className="mt-4 space-y-2.5">{linkList(TECHNICAL_LINKS)}</ul>
          </div>

          {/* venue & contact */}
          <div>
            <h4 className="mono-label text-signal-300">Venue &amp; Contact</h4>
            <div className="mt-4 space-y-2.5 text-[12.5px] text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal-400" />
                <span>
                  Department of ECE, Government College of Engineering, Tirunelveli - 627007,
                  Tamil Nadu
                </span>
              </div>

              {CONTACTS.map((c) => (
                <a
                  key={c.phone}
                  href={`tel:${c.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 transition-colors hover:text-signal-200"
                >
                  <Phone className="h-4 w-4 shrink-0 text-signal-400" />
                  <span className="font-mono text-[11.5px]">{c.phone}</span>
                  <span className="text-slate-500">({c.name})</span>
                </a>
              ))}

              <a
                href="mailto:frequenza2026@gmail.com"
                className="flex items-center gap-2 transition-colors hover:text-signal-200"
              >
                <Mail className="h-4 w-4 shrink-0 text-signal-400" />
                <span>frequenza2026@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-7 sm:flex-row">
          <p className="font-mono text-[10.5px] tracking-wide text-slate-500">
            © 2026 FREQUENZA '26 • Dept of ECE, GCE Tirunelveli. All rights reserved.
          </p>

          <span className="inline-flex items-center gap-2 rounded-full border border-signal-400/25 bg-signal-400/8 px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-wide text-signal-200">
            <Zap className="h-3 w-3 animate-pulse text-signal-300" />
            Developed by{" "}
              <span className="font-display font-bold uppercase tracking-[0.12em] text-white">
                HARSHA BALAN GCE
              </span>
            <CircuitBoard className="h-3 w-3 text-signal-400" />
          </span>
        </div>
      </div>
    </footer>
  );
}