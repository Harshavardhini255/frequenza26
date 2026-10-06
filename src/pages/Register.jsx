import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImageUp,
  Info,
  ListChecks,
  Loader2,
  User,
} from "lucide-react";

import UpiPaymentPanel from "@/components/UpiPaymentPanel";
import { registrationService } from "@/lib/registrations";
import { eventService } from "@/lib/services";
import { registrationSchema, validateScreenshotFile } from "@/lib/validation";
import PageAtmosphere from "../components/PageAtmosphere";

const FOOD_PREFERENCE_FORM_URL = "https://forms.gle/masJnLkb4c82jqxB6";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [events, setEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotError, setScreenshotError] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const preselectedEventId = location.state?.preselectedEventId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      college_name: "",
      department: "ECE",
      year_of_study: "3rd Year",
      food_preference: "Veg",
      tech_event_id: preselectedEventId || "",
      non_tech_event_id: "",
      requires_teammate: false,
      team_member_2_name: "",
      team_member_2_phone: "",
      transaction_id: "",
    },
  });

  const techEventId = watch("tech_event_id");
  const nonTechEventId = watch("non_tech_event_id");

  const technicalEvents = events.filter((e) => e.category === "technical");
  const nonTechnicalEvents = events.filter((e) => e.category !== "technical");
  const selectedTechEvent = technicalEvents.find((e) => e.id === techEventId);
  const selectedNonTechEvent = nonTechnicalEvents.find((e) => e.id === nonTechEventId);

  /* Tech Quest publishes a fixed 2-member team, so the second participant is
     mandatory whenever it is the selected technical event. The slug drives it
     so nothing else in the form has to know which event it is. */
  const needsTeamMember =
    selectedTechEvent?.slug === "tech-quest" ||
    /tech\s*quest/i.test(selectedTechEvent?.name || "");

  useEffect(() => {
    setValue("requires_teammate", needsTeamMember);
    if (!needsTeamMember) {
      setValue("team_member_2_name", "");
      setValue("team_member_2_phone", "");
    }
  }, [needsTeamMember, setValue]);

  useEffect(() => {
    eventService.getEvents().then((list) => {
      setEvents(list);
      if (preselectedEventId) {
        const match = list.find((e) => e.id === preselectedEventId);
        if (match) {
          if (match.category === "technical") {
            setValue("tech_event_id", match.id);
          } else {
            setValue("non_tech_event_id", match.id);
          }
        }
      }
    });
  }, [preselectedEventId, setValue]);

  const handleNext = async () => {
    setSubmitError(null);
    if (step === 1) {
      const valid = await trigger([
        "full_name",
        "email",
        "phone",
        "college_name",
        "department",
        "year_of_study",
        "food_preference",
      ]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger(
        needsTeamMember
          ? ["tech_event_id", "team_member_2_name", "team_member_2_phone"]
          : ["tech_event_id"],
      );
      if (valid) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const result = validateScreenshotFile(file);
      if (result.valid) {
        setScreenshotError(null);
        setScreenshotFile(file);
        setScreenshotPreview(URL.createObjectURL(file));
      } else {
        setScreenshotError(result.error || "Invalid file");
        setScreenshotFile(null);
        setScreenshotPreview(null);
      }
    }
  };

  const submitRegistration = async (form) => {
    setSubmitError(null);
    const fileCheck = validateScreenshotFile(screenshotFile);
    if (!fileCheck.valid) {
      setScreenshotError(fileCheck.error || "Please select a valid payment screenshot.");
      return;
    }

    setSubmitting(true);
    try {
      const registration = await registrationService.submitRegistration({
        ...form,
        screenshot_file: screenshotFile,
      });
      navigate("/registration-success", { state: { registration } });
    } catch (err) {
      setSubmitError(err.message || "Registration submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-y relative min-h-screen bg-dark-bg px-4 text-slate-100">
      <PageAtmosphere variant="form" />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-gold-400">
            FREQUENZA '26 REGISTRATION
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-1 font-display">
            PARTICIPANT REGISTRATION
          </h1>
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 max-w-2xl mx-auto">
            {[
              { num: 1, label: "Participant Info" },
              { num: 2, label: "Select Events" },
              { num: 3, label: "Pay ₹250" },
              { num: 4, label: "Upload Proof" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${step === s.num ? "bg-gold-gradient text-white font-extrabold shadow-lg shadow-gold-500/30" : step > s.num ? "bg-gold-500/20 text-gold-300 border border-gold-500/40" : "bg-black/60 text-slate-500 border border-white/10"}`}
                >
                  {s.num}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${step === s.num ? "text-gold-300" : "text-slate-400"}`}
                >
                  {s.label}
                </span>
                {s.num < 4 && <div className="w-4 sm:w-8 h-0.5 bg-gold-500/20" />}
              </div>
            ))}
          </div>
        </div>

        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div>
              <strong className="font-bold">Submission Error:</strong> {submitError}
            </div>
          </div>
        )}

        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-gold-500/30 shadow-2xl">
          <form onSubmit={handleSubmit(submitRegistration)}>
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-white border-b border-gold-500/20 pb-3 flex items-center gap-2 font-display">
                  <User className="w-5 h-5 text-gold-400" />
                  Participant Personal &amp; College Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gold-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register("full_name")}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                    />
                    {errors.full_name && (
                      <p className="text-[11px] text-red-400 mt-1">
                        {String(errors.full_name.message)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gold-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="rahul@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-400 mt-1">
                        {String(errors.email.message)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gold-400 mb-1.5">
                      Phone Number (10-digit Mobile) *
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-400 mt-1">
                        {String(errors.phone.message)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gold-400 mb-1.5">
                      College Name *
                    </label>
                    <input
                      type="text"
                      {...register("college_name")}
                      placeholder="e.g. Government College of Engineering, Salem"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                    />
                    {errors.college_name && (
                      <p className="text-[11px] text-red-400 mt-1">
                        {String(errors.college_name.message)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gold-400 mb-1.5">
                      Department *
                    </label>
                    <select
                      {...register("department")}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white focus:outline-none focus:border-gold-400"
                    >
                      <option value="ECE">Electronics &amp; Communication Engineering (ECE)</option>
                      <option value="EEE">Electrical &amp; Electronics Engineering (EEE)</option>
                      <option value="CSE">Computer Science Engineering (CSE)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                      <option value="OTHER">Other Branch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gold-400 mb-1.5">
                      Year of Study *
                    </label>
                    <select
                      {...register("year_of_study")}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white focus:outline-none focus:border-gold-400"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="PG / ME / M.Tech">PG / Master's Student</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gold-400 mb-2">
                      Food Preference *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <a
                        href={FOOD_PREFERENCE_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex"
                      >
                        <label
                          className={`w-full p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-3 ${watch("food_preference") === "Veg" ? "bg-green-500/20 border-green-400 text-white shadow-lg" : "bg-black/60 border-gold-500/30 text-slate-400 hover:border-gold-400"}`}
                        >
                          <input
                            type="radio"
                            value="Veg"
                            {...register("food_preference")}
                            className="accent-green-400"
                          />
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            🥗 Vegetarian (Veg)
                          </span>
                        </label>
                      </a>
                      <a
                        href={FOOD_PREFERENCE_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex"
                      >
                        <label
                          className={`w-full p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-3 ${watch("food_preference") === "Non-Veg" ? "bg-red-500/20 border-red-400 text-white shadow-lg" : "bg-black/60 border-gold-500/30 text-slate-400 hover:border-gold-400"}`}
                        >
                          <input
                            type="radio"
                            value="Non-Veg"
                            {...register("food_preference")}
                            className="accent-red-400"
                          />
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            🍕 Non-Vegetarian (Non-Veg)
                          </span>
                        </label>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-gold-gradient text-white font-extrabold text-xs tracking-wider uppercase hover:brightness-110 flex items-center gap-2 shadow-lg"
                  >
                    Next: Event Selection <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-white border-b border-gold-500/20 pb-3 flex items-center gap-2 font-display">
                  <ListChecks className="w-5 h-5 text-gold-400" />
                  Event Selection
                </h3>

                <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 space-y-1">
                  <div className="font-extrabold flex items-center gap-2 text-sm text-gold-400">
                    <Info className="w-4 h-4" />
                    1 TECHNICAL EVENT IS COMPULSORY
                  </div>
                  <p>
                    You must choose at least 1 Technical Event. Non-technical events are optional
                    additions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gold-400 mb-2 uppercase tracking-wider">
                    Select Technical Event (COMPULSORY) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {technicalEvents.map((event) => (
                      <label
                        key={event.id}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${techEventId === event.id ? "bg-gold-500/20 border-gold-400 text-white shadow-lg" : "bg-black/40 border-white/10 hover:border-gold-500/30 text-slate-300"}`}
                      >
                        <input
                          type="radio"
                          value={event.id}
                          {...register("tech_event_id")}
                          className="mt-1 accent-gold-400"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{event.name}</div>
                          <div className="text-[11px] text-gold-400 italic font-medium">
                            {event.tagline}
                          </div>
                          {(event.slug === "tech-quest" ||
                            /tech\s*quest/i.test(event.name || "")) && (
                            <span className="mt-1.5 inline-block rounded border border-signal-400/40 bg-signal-400/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-signal-200">
                              Team Size: 2 Members
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.tech_event_id && (
                    <p className="text-xs text-red-400 mt-2 font-bold">
                      {String(errors.tech_event_id.message)}
                    </p>
                  )}
                </div>

                {needsTeamMember && (
                  <div className="p-4 rounded-2xl border border-signal-400/30 bg-signal-400/5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-signal-200">
                        Tech Quest Team Details
                      </div>
                      <span className="rounded border border-signal-400/40 bg-signal-400/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-signal-200">
                        Team Size: 2 Members
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                      Tech Quest is a <strong className="text-white">2-member team event</strong>.
                      You are participant <strong className="text-white">1</strong> — add your
                      second team member below. Individual participation is not allowed.
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-signal-300 mb-1.5">
                          Team Member 2 — Full Name *
                        </label>
                        <input
                          type="text"
                          {...register("team_member_2_name")}
                          placeholder="e.g. Priya S"
                          className="w-full px-4 py-3 rounded-xl bg-black/60 border border-signal-400/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-signal-400"
                        />
                        {errors.team_member_2_name && (
                          <p className="text-[11px] text-red-400 mt-1">
                            {String(errors.team_member_2_name.message)}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-signal-300 mb-1.5">
                          Team Member 2 — Phone (10-digit Mobile) *
                        </label>
                        <input
                          type="tel"
                          {...register("team_member_2_phone")}
                          placeholder="9876543210"
                          className="w-full px-4 py-3 rounded-xl bg-black/60 border border-signal-400/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-signal-400"
                        />
                        {errors.team_member_2_phone && (
                          <p className="text-[11px] text-red-400 mt-1">
                            {String(errors.team_member_2_phone.message)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gold-500/20">
                  <label className="block text-xs font-extrabold text-blue-400 mb-2 uppercase tracking-wider">
                    Select Non-Technical or Special Event (OPTIONAL)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${!nonTechEventId || nonTechEventId === "" || nonTechEventId === "none" ? "bg-white/10 border-white/30 text-white" : "bg-black/40 border-white/10 text-slate-400"}`}
                    >
                      <input
                        type="radio"
                        value=""
                        {...register("non_tech_event_id")}
                        className="accent-gold-400"
                      />
                      <span className="text-xs font-semibold">No Non-Technical Event</span>
                    </label>
                    {nonTechnicalEvents.map((event) => (
                      <label
                        key={event.id}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${nonTechEventId === event.id ? "bg-blue-500/20 border-blue-400 text-white shadow-lg" : "bg-black/40 border-white/10 hover:border-blue-500/30 text-slate-300"}`}
                      >
                        <input
                          type="radio"
                          value={event.id}
                          {...register("non_tech_event_id")}
                          className="mt-1 accent-blue-400"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            {event.name}
                            {event.category === "special" && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-extrabold">
                                SPECIAL IPL
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{event.tagline}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-gold-gradient text-white font-extrabold text-xs tracking-wider uppercase hover:brightness-110 flex items-center gap-2 shadow-lg"
                  >
                    Next: Pay ₹250 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <UpiPaymentPanel upiId="shyamroshan12@oksbi" amount={250} />

                <div className="glass-panel p-5 rounded-2xl border-gold-500/20 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-white border-b border-gold-500/20 pb-2">
                    Registration Summary Preview:
                  </div>
                  <div>
                    Participant:{" "}
                    <strong className="text-white">{watch("full_name")}</strong> (
                    {watch("phone")})
                  </div>
                  <div>
                    College: <strong className="text-white">{watch("college_name")}</strong>
                  </div>
                  <div>
                    Compulsory Tech Event:{" "}
                    <strong className="text-gold-300">{selectedTechEvent?.name}</strong>
                  </div>
                  {needsTeamMember && (
                    <div>
                      Team Member 2 (Team Size: 2 Members):{" "}
                      <strong className="text-signal-200">
                        {watch("team_member_2_name")} ({watch("team_member_2_phone")})
                      </strong>
                    </div>
                  )}
                  {selectedNonTechEvent && (
                    <div>
                      Optional Event:{" "}
                      <strong className="text-blue-300">{selectedNonTechEvent.name}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-gold-gradient text-white font-extrabold text-xs tracking-wider uppercase hover:brightness-110 flex items-center gap-2 shadow-lg"
                  >
                    I Have Paid ₹250 - Proceed to Upload Proof{" "}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-white border-b border-gold-500/20 pb-3 flex items-center gap-2 font-display">
                  <ImageUp className="w-5 h-5 text-gold-400" />
                  Enter Transaction ID &amp; Upload Screenshot
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gold-400 mb-1.5">
                    UPI Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    {...register("transaction_id")}
                    placeholder="e.g. 328491029381 or UPI/12345678"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gold-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 font-mono"
                  />
                  {errors.transaction_id && (
                    <p className="text-xs text-red-400 mt-1">
                      {String(errors.transaction_id.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold-400 mb-1.5">
                    Payment Proof Screenshot * (PNG, JPG, WEBP - Max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-gold-500/30 rounded-2xl p-6 text-center hover:border-gold-400 transition-all bg-black/40">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleScreenshotChange}
                      className="hidden"
                      id="screenshot-input"
                    />
                    <label
                      htmlFor="screenshot-input"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageUp className="w-8 h-8 text-gold-400 mb-2" />
                      <span className="text-xs font-bold text-white">
                        Click to Select Payment Screenshot
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Supports PNG, JPG, JPEG, WEBP up to 5MB
                      </span>
                    </label>
                  </div>
                  {screenshotError && (
                    <p className="text-xs text-red-400 mt-2 font-bold">{screenshotError}</p>
                  )}
                  {screenshotPreview && (
                    <div className="mt-4 p-3 rounded-2xl bg-black/60 border border-gold-500/30 flex items-center gap-4">
                      <img
                        src={screenshotPreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-white truncate max-w-xs">
                          {screenshotFile?.name}
                        </div>
                        <div className="text-[10px] text-gold-400 font-semibold mt-0.5">
                          {(screenshotFile.size / (1024 * 1024)).toFixed(2)} MB Ready for upload
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-gold-500/5 border border-gold-500/20 text-xs text-slate-300">
                  ⚠ Note: Submitting registration places your payment status under{" "}
                  <strong>"UNDER REVIEW"</strong>. The committee will verify your transaction ID
                  against bank records.
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to QR
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 rounded-xl bg-gold-gradient text-white font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl shadow-gold-500/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting Registration...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        SUBMIT REGISTRATION
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
