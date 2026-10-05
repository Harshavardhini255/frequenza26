import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/Logo";
import PageAtmosphere from "../../components/PageAtmosphere";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (
      (email.toLowerCase() === "admin@frequenza26.com" ||
        email.toLowerCase() === "admin@frequenza26.gce") &&
      password === "Frequenza@26"
    ) {
      localStorage.setItem("frequenza_admin_session", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid admin credentials. Please check your email and password.");
    }
  };

  return (
    <div className="section-y relative flex min-h-screen items-center justify-center bg-dark-bg p-4 text-slate-100">
      <PageAtmosphere variant="centered" />
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-gold-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gold-gradient" />

        <div className="text-center space-y-4 mb-8">
          <Logo size="md" className="justify-center" />
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-gradient-to-r from-transparent via-signal-400 to-signal-400/0" />
            <span className="eyebrow gap-2">
              <ShieldCheck className="w-4 h-4 text-signal-400" aria-hidden="true" />
              Symposium
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent via-signal-400 to-signal-400/0" />
          </div>
          <h1 className="display-mask text-3xl">Committee Portal</h1>
          <p className="text-xs text-slate-400">
            Authorized administrator access for payment verification and participant
            management.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gold-400 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Enter admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gold-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white focus:outline-none focus:border-gold-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gold-gradient text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 mt-4"
          >
            LOGIN TO DASHBOARD <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
