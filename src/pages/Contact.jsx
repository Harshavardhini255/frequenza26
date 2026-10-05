import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CircleCheck,
  Mail,
  MapPin,
  Phone,
  Send,
  Signal,
} from "lucide-react";

import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import SignalBus from "../components/SignalBus";
import { FALLBACK_COORDINATORS } from "../data/site";
import { settingsService } from "../lib/services";
import PageAtmosphere from "../components/PageAtmosphere";

const INQUIRY_EMAIL = "ece.symposium2026@gce.edu.in";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

const inputClass =
  "w-full rounded-xl border border-signal-400/20 bg-void/65 px-4 py-3 text-[13px] text-white placeholder:text-slate-600 outline-none transition-colors focus:border-signal-400/70";

const labelClass = "mono-label mb-1.5 block text-slate-400";

export default function Contact() {
  const [coordinators, setCoordinators] = useState([]);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    let alive = true;
    settingsService
      .getCoordinators()
      .then((list) => {
        if (!alive) return;
        setCoordinators(list && list.length > 0 ? list : FALLBACK_COORDINATORS);
      })
      .catch((err) => {
        console.error("Failed to load coordinators:", err);
        if (alive) setCoordinators(FALLBACK_COORDINATORS);
      });
    return () => {
      alive = false;
    };
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="section-y relative">
      <PageAtmosphere variant="default" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading as="h1"
          eyebrow="Get in touch"
          title="Contact"
          accent="Committee"
          align="center"
          lede="Have questions regarding events, registration fee payment, or venue navigation? Contact our student coordinators."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── left: venue + coordinators ── */}
          <div className="space-y-6">
            <Reveal>
              <section className="glass-panel relative overflow-hidden rounded-2xl p-6">
                <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
                <span className="circuit-corner right-4 top-4 border-r border-t" />

                <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
                  Venue Location
                </h3>
                <div className="mt-3 h-5">
                  <SignalBus nodes={[{ id: "a", pct: 25 }, { id: "b", pct: 75 }]} />
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-signal-400/25 bg-signal-400/8">
                      <MapPin className="h-4 w-4 text-signal-300" />
                    </span>
                    <p className="text-[13px] leading-relaxed text-slate-300">
                      <strong className="text-white">Department of ECE</strong>
                      <br />
                      Government College of Engineering, Tirunelveli - 627007,
                      <br />
                      Tirunelveli District, Tamil Nadu, India.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-signal-400/25 bg-signal-400/8">
                      <Mail className="h-4 w-4 text-signal-300" />
                    </span>
                    <a
                      href={`mailto:${INQUIRY_EMAIL}`}
                      className="mt-2 break-all font-mono text-[12px] text-slate-200 underline-offset-4 transition-colors hover:text-signal-200 hover:underline"
                    >
                      {INQUIRY_EMAIL}
                    </a>
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal delay={0.08}>
              <section className="glass-panel relative overflow-hidden rounded-2xl p-6">
                <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
                <span className="circuit-corner right-4 top-4 border-r border-t" />

                <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
                  Overall Student Coordinators
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {coordinators.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-white/6 bg-void/50 p-4 transition-colors hover:border-signal-400/30"
                    >
                      <div className="font-display text-sm font-bold text-white">{c.name}</div>
                      <div className="mono-label mt-1 text-signal-300">{c.role}</div>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone.replace(/\s+/g, "")}`}
                          className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-300 transition-colors hover:text-signal-200"
                        >
                          <Phone className="h-3 w-3 text-signal-400" />
                          {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="mt-1.5 flex items-center gap-1.5 break-all font-mono text-[10px] text-slate-500 transition-colors hover:text-signal-200"
                        >
                          <Mail className="h-3 w-3 shrink-0 text-signal-400" />
                          {c.email}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          </div>

          {/* ── right: inquiry form ── */}
          <Reveal delay={0.12}>
            <section className="glass-panel relative h-full overflow-hidden rounded-2xl p-6 sm:p-8">
              <span className="absolute inset-x-0 top-0 h-px bg-signal-gradient" />
              <span className="circuit-corner left-4 top-4 border-l border-t" />

              <h3 className="font-display text-xl font-bold text-white">Send an Inquiry</h3>
              <p className="mt-1.5 text-[12.5px] text-slate-400">
                Fill in your details below and our team will respond promptly.
              </p>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 rounded-2xl border border-signal-400/30 bg-signal-400/8 p-8 text-center"
                >
                  <CircleCheck className="mx-auto h-11 w-11 text-signal-300" />
                  <h4 className="mt-4 font-display text-lg font-bold text-white">
                    Inquiry Sent Successfully!
                  </h4>
                  <p className="mx-auto mt-2 max-w-xs text-[12.5px] leading-relaxed text-slate-300">
                    Thank you for reaching out. A coordinator will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setForm(EMPTY_FORM);
                    }}
                    className="mono-label mt-6 text-signal-300 underline-offset-4 hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className={labelClass} htmlFor="contact-name">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={update("name")}
                      className={inputClass}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="contact-email">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      className={inputClass}
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="contact-subject">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={form.subject}
                      onChange={update("subject")}
                      className={inputClass}
                      placeholder="Event query / Payment doubt..."
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="contact-message">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={update("message")}
                      className={`${inputClass} resize-y`}
                      placeholder="Write your message or question here..."
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full !py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Inquiry
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-6 bottom-1 h-px bg-white/25"
                    />
                  </button>

                  <p className="flex items-start gap-2 font-mono text-[10px] leading-relaxed text-slate-500">
                    <Signal className="mt-0.5 h-3 w-3 shrink-0 text-signal-500" />
                    For fee or UPI payment issues, the event coordinator listed on each event
                    page is the fastest route.
                  </p>
                </form>
              )}
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
