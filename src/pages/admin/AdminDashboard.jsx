import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Eye,
  Globe,
  Lock,
  LockOpen,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { adminService } from "@/lib/admin";
import { registrationService, paymentService } from "@/lib/registrations";
import { settingsService } from "@/lib/services";
import RegistrationDetailModal from "@/components/RegistrationDetailModal";
import PageAtmosphere from "../../components/PageAtmosphere";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("frequenza_admin_session") !== "true") {
      navigate("/admin/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, regs, siteSettings] = await Promise.all([
        adminService.getDashboardStats(),
        registrationService.getAllRegistrations(),
        settingsService.getSettings(),
      ]);
      setStats(statsData);
      setRegistrations(regs);
      setSettings(siteSettings);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("frequenza_admin_session");
    navigate("/admin/login");
  };

  const toggleRegistration = async () => {
    if (settings)
      try {
        const updated = await settingsService.updateRegistrationStatus(
          !settings.registration_open,
        );
        setSettings(updated);
      } catch (err) {
        console.error("Failed to toggle registration status:", err);
      }
  };

  const handleVerify = async (id) => {
    const reg = registrations.find((r) => r.id === id);
    if (reg?.payment?.id) {
      await paymentService.verifyPayment(reg.payment.id);
      await loadData();
    }
  };

  const handleReject = async (id, reason) => {
    const reg = registrations.find((r) => r.id === id);
    if (reg?.payment?.id) {
      await paymentService.rejectPayment(reg.payment.id, reason);
      await loadData();
    }
  };

  const handleDelete = async (id, registrationNumber) => {
    if (
      window.confirm(
        `Are you sure you want to delete registration ${registrationNumber}? This action cannot be undone.`,
      )
    ) {
      await registrationService.deleteRegistration(id);
      await loadData();
    }
  };

  const filtered = registrations.filter((reg) => {
    const statusMatch = filter === "all" || reg.payment_status === filter;
    const query = search.toLowerCase();
    const searchMatch =
      reg.registration_number.toLowerCase().includes(query) ||
      reg.full_name.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      reg.phone.includes(search) ||
      reg.college_name.toLowerCase().includes(query) ||
      (reg.payment?.transaction_id &&
        reg.payment.transaction_id.toLowerCase().includes(query));
    return statusMatch && searchMatch;
  });

  return (
    <div className="section-y relative min-h-screen bg-dark-bg px-4 text-slate-100">
      <PageAtmosphere variant="default" />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="glass-panel p-6 rounded-3xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gold-400">
                SYMPOSIUM COMMITTEE PORTAL
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                ADMINISTRATION DASHBOARD
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-black/60 border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all mock/test registrations?",
                  )
                ) {
                  await registrationService.clearAllRegistrations();
                  await loadData();
                }
              }}
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
              title="Purge All Test Registrations"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => adminService.exportToCSV(registrations)}
              className="px-4 py-2.5 rounded-xl bg-gold-gradient text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> EXPORT CSV
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-panel p-4 rounded-2xl border-gold-500/20 text-center">
              <div className="text-2xl font-black text-white font-mono">
                {stats.totalRegistrations}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                Total Regs
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-amber-500/30 bg-amber-500/5 text-center">
              <div className="text-2xl font-black text-amber-300 font-mono">
                {stats.pendingPayments}
              </div>
              <div className="text-[10px] font-bold text-amber-400 uppercase mt-1">
                Under Review
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-green-500/30 bg-green-500/5 text-center">
              <div className="text-2xl font-black text-green-300 font-mono">
                {stats.verifiedPayments}
              </div>
              <div className="text-[10px] font-bold text-green-400 uppercase mt-1">
                Verified
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-red-500/30 bg-red-500/5 text-center">
              <div className="text-2xl font-black text-red-300 font-mono">
                {stats.rejectedPayments}
              </div>
              <div className="text-[10px] font-bold text-red-400 uppercase mt-1">
                Rejected
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-gold-500/30 bg-gold-500/5 text-center">
              <div className="text-2xl font-black text-gold-300 font-mono">
                ₹{stats.totalRevenue}
              </div>
              <div className="text-[10px] font-bold text-gold-400 uppercase mt-1">
                Verified Revenue
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-blue-500/30 bg-blue-500/5 text-center">
              <div className="text-2xl font-black text-blue-300 font-mono">
                {stats.techEventRegistrations}
              </div>
              <div className="text-[10px] font-bold text-blue-400 uppercase mt-1">
                Tech Events
              </div>
            </div>
          </div>
        )}

        {settings && (
          <div className="glass-panel p-4 rounded-2xl border border-gold-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gold-400" />
              <span>
                Public Portal Registration Status:{" "}
                <strong
                  className={
                    settings.registration_open ? "text-green-400" : "text-red-400"
                  }
                >
                  {settings.registration_open
                    ? "OPEN FOR REGISTRATIONS"
                    : "CLOSED / ON-SPOT ONLY"}
                </strong>
              </span>
            </div>
            <button
              onClick={toggleRegistration}
              className="px-3.5 py-1.5 rounded-lg bg-black/60 border border-gold-500/30 text-gold-300 font-bold text-xs hover:bg-gold-500/20 flex items-center gap-1.5"
            >
              {settings.registration_open ? (
                <>
                  <Lock className="w-4 h-4 text-green-400" /> Close Registration
                </>
              ) : (
                <>
                  <LockOpen className="w-4 h-4 text-red-400" /> Open Registration
                </>
              )}
            </button>
          </div>
        )}

        <div className="glass-panel p-4 rounded-2xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "All Registrations" },
              { id: "under_review", label: "Under Review" },
              { id: "verified", label: "Verified" },
              { id: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.id
                    ? "bg-gold-gradient text-white shadow-md"
                    : "bg-black/50 text-slate-300 hover:text-white border border-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Name, Email, Phone, Txn ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-gold-500/30 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/80 border-b border-gold-500/20 text-[11px] font-black uppercase tracking-wider text-gold-400">
                  <th className="p-4">Reg ID</th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">College / Dept</th>
                  <th className="p-4">Registered Events</th>
                  <th className="p-4">UPI Txn ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filtered.length > 0 ? (
                  filtered.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-white select-all">
                        {reg.registration_number}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          {reg.full_name}
                          {reg.food_preference && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                reg.food_preference === "Veg"
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {reg.food_preference}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {reg.email} • {reg.phone}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="truncate max-w-xs">{reg.college_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {reg.department} ({reg.year_of_study})
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {reg.events?.map((event) => (
                            <span
                              key={event.id}
                              className="inline-block bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[10px] text-gold-300 font-semibold mr-1"
                            >
                              {event.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-300 select-all">
                        {reg.payment?.transaction_id || "N/A"}
                      </td>
                      <td className="p-4">
                        {reg.payment_status === "verified" ? (
                          <span className="bg-green-500/20 text-green-300 border border-green-500/40 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                            ✔ Verified
                          </span>
                        ) : reg.payment_status === "rejected" ? (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                            ✘ Rejected
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase animate-pulse">
                            ⏳ Under Review
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelected(reg)}
                            className="px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-300 font-bold text-xs hover:bg-gold-500/20 transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review Proof
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(reg.id, reg.registration_number)
                            }
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-slate-400 text-xs italic"
                    >
                      No registration records match the current filter or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RegistrationDetailModal
        registration={selected}
        onClose={() => setSelected(null)}
        onVerify={handleVerify}
        onReject={handleReject}
      />
    </div>
  );
}
