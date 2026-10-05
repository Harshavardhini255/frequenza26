import { Link, Navigate, useLocation } from "react-router-dom";
import { CheckCircle2, LoaderCircle, Search } from "lucide-react";
import PageAtmosphere from "../components/PageAtmosphere";

export default function RegistrationSuccess() {
  const location = useLocation();
  const registration = location.state?.registration;

  if (!registration) {
    return <Navigate to="/participant/status" replace />;
  }

  return (
    <div className="section-y relative min-h-screen bg-dark-bg px-4 text-slate-100">
      <PageAtmosphere variant="form" />
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-400 flex items-center justify-center mx-auto text-gold-300 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.25em] text-gold-400">
            REGISTRATION SUBMITTED SUCCESSFULLY
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
            THANK YOU, {registration.full_name.toUpperCase()}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Your registration form and payment proof details have been safely received by the
            FREQUENZA '26 committee.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-gold-500/40 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gold-gradient" />
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            YOUR UNIQUE REGISTRATION ID
          </div>
          <div className="inline-block px-6 py-3 rounded-2xl bg-black/80 border border-gold-500/40 font-mono text-3xl sm:text-4xl font-black gold-gradient-text tracking-wider select-all">
            {registration.registration_number}
          </div>
          <p className="text-xs text-gold-300 font-semibold">
            Please save or screenshot this Registration ID for venue check-in on October 14, 2026.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <LoaderCircle className="w-4 h-4 text-amber-400 animate-spin" />
            PAYMENT STATUS: UNDER REVIEW
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/20 space-y-4">
          <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider border-b border-gold-500/20 pb-2">
            Registration Details Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
              Email: <strong className="text-white">{registration.email}</strong>
            </div>
            <div>
              Phone: <strong className="text-white">{registration.phone}</strong>
            </div>
            <div>
              College: <strong className="text-white">{registration.college_name}</strong>
            </div>
            <div>
              Department / Year:{" "}
              <strong className="text-white">
                {registration.department} ({registration.year_of_study})
              </strong>
            </div>
            <div>
              Food Preference:{" "}
              <strong className="text-gold-300 font-bold">
                {registration.food_preference === "Veg"
                  ? "🥗 Vegetarian (Veg)"
                  : "🍕 Non-Vegetarian (Non-Veg)"}
              </strong>
            </div>
            <div>
              Registered Events:
              <ul className="mt-1 space-y-1 pl-3 list-disc text-gold-300 font-semibold">
                {registration.events?.map((event) => (
                  <li key={event.id}>
                    {event.name} ({event.category})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              Transaction ID:{" "}
              <strong className="text-white font-mono">
                {registration.payment?.transaction_id || "Submitted"}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/participant/status"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-gradient text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            TRACK REGISTRATION STATUS
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-dark-card border border-gold-500/30 text-gold-300 font-bold text-xs hover:bg-gold-500/10 flex items-center justify-center gap-2"
          >
            RETURN TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
