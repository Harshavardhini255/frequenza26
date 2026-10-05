import { useEffect, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { paymentService } from "@/lib/registrations";

export default function RegistrationDetailModal({
  registration,
  onClose,
  onVerify,
  onReject,
}) {
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [loadingShot, setLoadingShot] = useState(true);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (registration?.payment?.screenshot_path) {
      setLoadingShot(true);
      paymentService
        .getSignedUrl(registration.payment.screenshot_path)
        .then((url) => {
          setScreenshotUrl(url);
          setLoadingShot(false);
        });
    } else {
      setScreenshotUrl(null);
      setLoadingShot(false);
    }
  }, [registration]);

  if (!registration) return null;

  const handleVerify = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onVerify(registration.id);
      onClose();
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please specify a rejection reason.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onReject(registration.id, reason.trim());
      onClose();
    } catch (err) {
      setError(err.message || "Rejection failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="glass-panel rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-gold-500/40 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-gradient-to-r from-surface to-dark-bg border-b border-gold-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-gold-400">
              PAYMENT VERIFICATION REVIEW
            </div>
            <h2 className="text-2xl font-black text-white font-mono">
              {registration.registration_number}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 text-slate-400 hover:text-white hover:bg-gold-500/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="text-gold-400 font-bold uppercase tracking-wider text-[11px]">
                  Participant Details
                </div>
                <div>
                  Full Name: <strong className="text-white">{registration.full_name}</strong>
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
                  Dept / Year:{" "}
                  <strong className="text-white">
                    {registration.department} ({registration.year_of_study})
                  </strong>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="text-gold-400 font-bold uppercase tracking-wider text-[11px]">
                  Registered Events
                </div>
                <ul className="list-disc pl-4 space-y-1 text-white font-semibold">
                  {registration.events?.map((event) => (
                    <li key={event.id}>
                      {event.name} ({event.category})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/30 p-4 rounded-2xl space-y-1">
                <div className="text-gold-400 font-bold uppercase tracking-wider text-[11px]">
                  UPI Transaction ID
                </div>
                <div className="text-base font-mono font-black text-white select-all">
                  {registration.payment?.transaction_id || "N/A"}
                </div>
                <div className="text-[10px] text-slate-400">
                  Amount: ₹{registration.payment?.amount || 250}.00 INR
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-black/60 p-4 rounded-2xl border border-gold-500/20 relative min-h-[250px]">
              {loadingShot ? (
                <div className="text-gold-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading payment
                  screenshot...
                </div>
              ) : screenshotUrl ? (
                <div className="space-y-3 text-center">
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group"
                  >
                    <img
                      src={screenshotUrl}
                      alt="Payment Proof Screenshot"
                      className="max-h-72 object-contain rounded-xl border border-white/10 shadow-lg group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity rounded-xl gap-1">
                      <Eye className="w-4 h-4" /> Click to expand image
                    </div>
                  </a>
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-gold-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Open Full Resolution Image <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  No screenshot file uploaded.
                </div>
              )}
            </div>
          </div>

          {showReject && (
            <form
              onSubmit={handleReject}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 space-y-3 animate-fadeIn"
            >
              <label className="block text-xs font-bold text-red-300">
                Specify Rejection Reason (Visible to Participant) *
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Invalid Transaction ID / Bank reference not found"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-xs text-white focus:outline-none focus:border-red-400"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReject(false)}
                  className="px-4 py-2 rounded-xl bg-black/60 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {!showReject && (
          <div className="p-6 bg-dark-bg/90 border-t border-gold-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setShowReject(true)}
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider hover:bg-red-500/30 flex items-center justify-center gap-2"
            >
              Reject Payment
            </button>
            <button
              onClick={handleVerify}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-green-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-green-400 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm & Verify Payment"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
