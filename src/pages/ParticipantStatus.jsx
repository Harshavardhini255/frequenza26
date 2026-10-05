import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LoaderCircle,
  Search,
  XCircle,
} from "lucide-react";

import { registrationService } from "@/lib/registrations";
import { validateScreenshotFile } from "@/lib/validation";
import PageAtmosphere from "../components/PageAtmosphere";

export default function ParticipantStatus() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("id") || "");
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const preselectedId = searchParams.get("id");
    if (preselectedId) handleLookup(preselectedId);
  }, [searchParams]);

  const handleLookup = async (lookupValue) => {
    const value = lookupValue || query;
    if (!value.trim()) return;

    setLoading(true);
    setError(null);
    setSubmitted(false);
    try {
      const found = await registrationService.getRegistrationByNumber(value);
      if (found) {
        setRegistration(found);
      } else {
        setRegistration(null);
        setError(
          `No registration record found for "${value}". Please check your Registration ID or Email address.`,
        );
      }
    } catch {
      setError("Failed to lookup registration details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const result = validateScreenshotFile(selected);
      if (result.valid) {
        setFileError(null);
        setFile(selected);
      } else {
        setFileError(result.error || "Invalid file format");
        setFile(null);
      }
    }
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!registration) return;

    if (!transactionId.trim()) {
      setFileError("Please enter a valid UPI Transaction ID.");
      return;
    }
    if (!file) {
      setFileError("Please select a payment screenshot image.");
      return;
    }

    setSubmitting(true);
    setFileError(null);
    try {
      const updated = await registrationService.reuploadPaymentProof(
        registration.id,
        transactionId.trim(),
        file,
      );
      setRegistration(updated);
      setSubmitted(true);
    } catch (err) {
      setFileError(err.message || "Reupload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "verified":
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-extrabold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            CONFIRMED &amp; VERIFIED
          </span>
        );
      case "rejected":
      case "payment_rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-extrabold text-xs uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-red-400" />
            PAYMENT REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
            <LoaderCircle className="w-4 h-4 text-amber-400 animate-spin" />
            PAYMENT UNDER REVIEW
          </span>
        );
    }
  };

  return (
    <div className="section-y relative min-h-screen bg-dark-bg px-4 text-slate-100">
      <PageAtmosphere variant="form" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-gold-400">
            REGISTRATION PORTAL
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-1 font-display">
            TRACK REGISTRATION STATUS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Enter your Registration ID (e.g. <code>FREQ26-00001</code>) or your registered Email
            address.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Registration ID or Email..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gold-gradient text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "CHECK STATUS"}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div>{error}</div>
          </div>
        )}

        {registration && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/30 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-500/20 pb-4">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Registration Number
                </div>
                <div className="text-2xl font-black text-white font-mono gold-gradient-text">
                  {registration.registration_number}
                </div>
              </div>
              <div>{statusBadge(registration.payment_status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                Full Name:{" "}
                <strong className="text-white">{registration.full_name}</strong>
              </div>
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
                UPI Ref / Txn ID:{" "}
                <strong className="text-white font-mono">
                  {registration.payment?.transaction_id || "N/A"}
                </strong>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <div className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-2">
                Registered Events:
              </div>
              <ul className="space-y-1 text-xs text-slate-200">
                {registration.events?.map((event) => (
                  <li key={event.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                    <strong>{event.name}</strong>
                    ({event.category})
                  </li>
                ))}
              </ul>
            </div>

            {registration.payment_status === "rejected" && (
              <div className="p-6 rounded-2xl bg-red-500/10 border-2 border-red-500/40 space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-300">
                      Payment Verification Rejected
                    </h4>
                    <p className="text-xs text-red-200 mt-1">
                      Reason:{" "}
                      <strong>
                        {registration.payment?.rejection_reason ||
                          "Transaction ID not found in bank records."}
                      </strong>
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold text-center">
                    ✓ New payment proof submitted! Your status is now UNDER REVIEW.
                  </div>
                ) : (
                  <form onSubmit={handleResubmit} className="space-y-4 pt-2">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Re-upload Payment Proof:
                    </h5>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        New UPI Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter correct 12-digit UPI Txn ID"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-xs text-white focus:outline-none focus:border-red-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        New Payment Screenshot *
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30"
                      />
                    </div>

                    {fileError && (
                      <p className="text-xs text-red-400 font-bold">{fileError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "RESUBMIT PAYMENT PROOF"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
