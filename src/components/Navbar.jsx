import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, Radio, Search, ShieldCheck, X } from "lucide-react";

import Logo from "./Logo";
import { BRAND, NAV_LINKS } from "../data/brand";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "nav-scrim border-b border-white/8 py-3 shadow-[0_18px_50px_-30px_rgba(0,0,0,1)]"
            : "nav-scrim border-b border-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group shrink-0" aria-label="FREQUENZA '26 home">
            <Logo size="sm" src={BRAND.logo} />
          </Link>

          {/* ── Desktop nav ─────────────────────────────────────────── */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`relative rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.06em] transition-colors duration-200 ${
                    active ? "text-void" : "text-slate-400 hover:text-signal-200"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-signal-gradient shadow-[0_0_22px_-4px_rgba(34,200,236,0.65)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {!active && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-signal-400/0 transition-colors duration-300 hover:bg-signal-400/10" />
                  )}
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Desktop actions ─────────────────────────────────────── */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/participant/status"
              className="inline-flex items-center gap-2 rounded-xl border border-signal-400/20 bg-ink/60 px-3.5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-signal-200 transition-all duration-300 hover:border-signal-400/60 hover:bg-signal-400/10"
            >
              <Search className="h-3.5 w-3.5" />
              Track Status
            </Link>

            <Link
              to="/admin/login"
              title="Committee Admin Login"
              aria-label="Committee Admin Login"
              className="rounded-xl border border-signal-400/20 bg-ink/60 p-2.5 text-signal-300 transition-all duration-300 hover:border-signal-400/60 hover:bg-signal-400/10"
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>

            <Link
              to="/register"
              className="btn-primary !px-5 !py-2.5 !text-[11px]"
            >
              Register Now
            </Link>
          </div>

          {/* ── Mobile trigger ──────────────────────────────────────── */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-signal-400/25 bg-ink/70 text-signal-200 transition-colors hover:border-signal-400/60 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* ── Scroll progress signal ───────────────────────────────── */}
        <motion.div
          style={{ scaleX: progress }}
          className="h-px origin-left bg-signal-gradient"
        />
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm lg:hidden"
            />

            <motion.nav
              key="drawer"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 top-[68px] z-40 max-h-[calc(100dvh-68px)] overflow-y-auto border-b border-signal-400/15 bg-ink/95 px-4 pb-8 pt-4 backdrop-blur-xl lg:hidden"
            >
              <ul className="space-y-1.5">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.to);
                  return (
                    <motion.li
                      key={link.to}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.045, duration: 0.35 }}
                    >
                      <NavLink
                        to={link.to}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.13em] transition-colors ${
                          active
                            ? "border-signal-400/50 bg-signal-400/10 text-signal-200"
                            : "border-white/5 text-slate-300 active:bg-signal-400/5"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            active ? "bg-signal-300 shadow-[0_0_8px_rgba(95,220,248,0.9)]" : "bg-slate-600"
                          }`}
                        />
                        {link.label}
                      </NavLink>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-5 space-y-2.5 border-t border-signal-400/12 pt-5">
                <Link
                  to="/register"
                  className="btn-primary w-full !py-3.5 !text-xs"
                >
                  Register Now
                </Link>
                <Link
                  to="/participant/status"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-signal-400/20 bg-ink/60 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-signal-200"
                >
                  <Search className="h-3.5 w-3.5" />
                  Track Registration Status
                </Link>
                <Link
                  to="/admin/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-ink/40 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Committee Admin Login
                </Link>
              </div>

              <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <Radio className="h-3 w-3 animate-pulse text-signal-500" />
                Signal Online · 14 Oct 2026
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}