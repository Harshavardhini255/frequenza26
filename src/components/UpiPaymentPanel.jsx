import { useState } from "react";
import { Check, Copy, Info, ShieldCheck, Smartphone } from "lucide-react";

export default function UpiPaymentPanel({
  upiId = "shyamroshan12@oksbi",
  amount = 250,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("FREQUENZA 26 ECE")}&am=${amount}&cu=INR`;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/30 text-center relative overflow-hidden">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 font-extrabold text-xs uppercase tracking-wider mb-4">
        <ShieldCheck className="w-4 h-4 text-gold-400" />
        OFFICIAL SYMPOSIUM UPI GATEWAY
      </div>

      <h3 className="text-3xl font-black text-white font-display">
        ₹{amount}.00 <span className="text-xs text-slate-400 font-normal">INR</span>
      </h3>
      <p className="text-xs text-gold-400 font-medium mt-1">
        Online Registration Fee (Includes Lunch &amp; Kit)
      </p>

      <div className="my-6 p-4 rounded-2xl bg-black/80 border border-gold-500/30 inline-block shadow-2xl relative group">
        <img
          src="/upi_qr.jpg"
          alt={`Scan to Pay ₹${amount} via UPI to ${upiId}`}
          className="w-64 h-auto max-w-full rounded-xl mx-auto shadow-md border border-white/10"
          onError={(e) => {
            e.target.src = "/upi_qr.png";
          }}
        />
        <div className="text-[10px] text-gold-300 mt-2 font-mono font-bold">
          UPI ID: {upiId} • Amount: ₹{amount}.00
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
          Scan with GPay / PhonePe / Paytm / BHIM
        </div>
      </div>

      <div className="bg-black/60 border border-gold-500/30 rounded-2xl p-4 max-w-sm mx-auto space-y-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          UPI ID / VPA
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20">
          <code className="text-sm font-mono font-bold text-gold-300 select-all">
            {upiId}
          </code>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500/30 transition-all flex items-center gap-1 text-xs font-bold"
            title="Copy UPI ID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={upiLink}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gold-gradient text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Open UPI App directly
        </a>
      </div>

      <div className="mt-6 text-[11px] text-slate-400 bg-gold-500/5 p-3 rounded-xl border border-gold-500/10 flex items-center justify-center gap-2">
        <Info className="w-4 h-4 text-gold-400 shrink-0" />
        <span>
          After paying, save your UPI Reference / Transaction ID and take a screenshot.
        </span>
      </div>
    </div>
  );
}
