import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import CircuitBackground from "./components/CircuitBackground";
import Footer from "./components/Footer";
import MusicPlayer from "./components/MusicPlayer";
import Navbar from "./components/Navbar";

import About from "./pages/About";
import Contact from "./pages/Contact";
import EventDetail from "./pages/EventDetail";
import Events from "./pages/Events";
import Home from "./pages/Home";
import ParticipantStatus from "./pages/ParticipantStatus";
import Register from "./pages/Register";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import Schedule from "./pages/Schedule";
import Team from "./pages/Team";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

/* Restores scroll on navigation, and honours in-page #anchors. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col bg-void font-sans text-slate-100 selection:bg-signal-400/30 selection:text-white">
      {/* animated PCB substrate — fixed behind all routes */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <CircuitBackground />
      </div>

      <ScrollToTop />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/participant/status" element={<ParticipantStatus />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <MusicPlayer />
        <Footer />
      </div>
    </div>
  );
}