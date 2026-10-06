import { supabase, isSupabaseEnabled } from "./supabase";
import { EVENTS } from "../data/site";

export const REGISTRATIONS_KEY = "frequenza_registrations_v4";

const BLOCKED_REGISTRATIONS = new Set([
  "FREQ26-48029",
]);

function isBlocked(reg) {
  if (!reg) return false;
  if (BLOCKED_REGISTRATIONS.has(reg.registration_number)) return true;
  if (reg.id && BLOCKED_REGISTRATIONS.has(reg.id)) return true;
  if (reg.full_name && reg.full_name.toUpperCase().includes("MOHAMED KASSALI JUBAIR")) return true;
  return false;
}

function trimStoredScreenshot(reg) {
  return reg.map((r) => ({
    ...r,
    payment: r.payment
      ? {
          ...r.payment,
          screenshot_path:
            r.payment.screenshot_path && r.payment.screenshot_path.length > 200
              ? "uploaded"
              : r.payment.screenshot_path,
        }
      : undefined,
  }));
}

/* Every localStorage write for the registration cache goes through here. The
   cache is only a light mirror — the authoritative copy lives in Supabase.
   Base64 payment screenshots fetched back from the DB are big (hundreds of
   KB each), so if they land in localStorage the single key blows the ~5MB
   browser quota and `setItem` throws, which used to break registration
   submission. We always trim screenshots, then fall back to progressively
   smaller shapes if a device still reports QuotaExceededError, and never
   throw back to the caller. */
function persistLocal(records) {
  const attempts = [
    () => JSON.stringify(trimStoredScreenshot(records)),
    () =>
      JSON.stringify(
        records.map((r) =>
          r.payment ? { ...r, payment: { ...r.payment, screenshot_path: "" } } : r,
        ),
      ),
    () => JSON.stringify(records.map((r) => ({ ...r, payment: undefined }))),
    () =>
      JSON.stringify(
        records.map((r) => ({ ...r, payment: undefined, events: undefined })),
      ),
  ];

  for (const make of attempts) {
    try {
      localStorage.setItem(REGISTRATIONS_KEY, make());
      return true;
    } catch (err) {
      const quotaExceeded =
        (err && err.name === "QuotaExceededError") ||
        (err && /quota/i.test(String(err.message || "")));
      if (quotaExceeded) continue;
      console.warn("LocalStorage cache write warning:", err);
      return false;
    }
  }
  console.warn("LocalStorage cache write warning: dataset too large to cache");
  return false;
}

export const paymentService = {
  async uploadScreenshot(file, registrationNumber) {
    const ext = file.name.split(".").pop() || "png";
    const path = `screenshots/${`${registrationNumber}_${Date.now()}.${ext}`}`;
    if (isSupabaseEnabled) {
      try {
        const { error } = await supabase.storage
          .from("payment-proofs")
          .upload(path, file, { cacheControl: "3600", upsert: true });
        if (!error) {
          const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
          return data != null && data.publicUrl ? data.publicUrl : path;
        }
      } catch (err) {
        console.warn("Supabase storage upload failed, using base64 fallback:", err);
      }
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  async getSignedUrl(path) {
    if (!path) return "";
    if (path.startsWith("data:image") || path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(path, 3600);
        if (!error && data != null && data.signedUrl) return data.signedUrl;
        const { data: pub } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        if (pub != null && pub.publicUrl) return pub.publicUrl;
      } catch (err) {
        console.warn("Failed to get signed URL:", err);
      }
    }
    return path;
  },

  async verifyPayment(paymentId, adminId) {
    const now = new Date().toISOString();
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from("payments")
          .update({
            payment_status: "verified",
            verified_at: now,
            verified_by: adminId,
            rejection_reason: null,
            updated_at: now,
          })
          .eq("id", paymentId)
          .select()
          .single();
        if (error) throw error;
        if (data != null && data.registration_id) {
          await supabase
            .from("registrations")
            .update({
              payment_status: "verified",
              registration_status: "confirmed",
              updated_at: now,
            })
            .eq("id", data.registration_id);
        }
        await supabase.from("payment_reviews").insert([
          {
            payment_id: paymentId,
            admin_id: adminId,
            action: "verified",
            comments: "Payment transaction verified by administrator",
          },
        ]);
        return data;
      } catch (err) {
        console.warn("Supabase payment verification failed, applying local fallback:", err);
      }
    }

    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (raw) {
      const all = JSON.parse(raw);
      const reg = all.find((r) => r.payment?.id === paymentId || r.id === paymentId);
      if (reg) {
        reg.payment_status = "verified";
        reg.registration_status = "confirmed";
        if (reg.payment) {
          reg.payment.payment_status = "verified";
          reg.payment.rejection_reason = undefined;
          reg.payment.verified_at = now;
        }
        persistLocal(all);
        return (
          reg.payment || {
            id: paymentId,
            registration_id: reg.id,
            amount: 250,
            currency: "INR",
            transaction_id: "LOCAL_TXN",
            screenshot_path: "",
            payment_status: "verified",
            submitted_at: now,
            verified_at: now,
          }
        );
      }
    }

    return {
      id: paymentId,
      registration_id: paymentId,
      amount: 250,
      currency: "INR",
      transaction_id: "VERIFIED",
      screenshot_path: "",
      payment_status: "verified",
      submitted_at: now,
      verified_at: now,
    };
  },

  async rejectPayment(paymentId, reason, adminId) {
    const now = new Date().toISOString();
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from("payments")
          .update({
            payment_status: "rejected",
            rejection_reason: reason,
            updated_at: now,
          })
          .eq("id", paymentId)
          .select()
          .single();
        if (error) throw error;
        if (data != null && data.registration_id) {
          await supabase
            .from("registrations")
            .update({
              payment_status: "rejected",
              registration_status: "payment_rejected",
              updated_at: now,
            })
            .eq("id", data.registration_id);
        }
        await supabase.from("payment_reviews").insert([
          {
            payment_id: paymentId,
            admin_id: adminId,
            action: "rejected",
            comments: `Payment rejected: ${reason}`,
          },
        ]);
        return data;
      } catch (err) {
        console.warn("Supabase payment rejection failed, applying local fallback:", err);
      }
    }

    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (raw) {
      const all = JSON.parse(raw);
      const reg = all.find((r) => r.payment?.id === paymentId || r.id === paymentId);
      if (reg) {
        reg.payment_status = "rejected";
        reg.registration_status = "payment_rejected";
        if (reg.payment) {
          reg.payment.payment_status = "rejected";
          reg.payment.rejection_reason = reason;
        }
        persistLocal(all);
        return (
          reg.payment || {
            id: paymentId,
            registration_id: reg.id,
            amount: 250,
            currency: "INR",
            transaction_id: "LOCAL_TXN",
            screenshot_path: "",
            payment_status: "rejected",
            rejection_reason: reason,
            submitted_at: now,
          }
        );
      }
    }

    return {
      id: paymentId,
      registration_id: paymentId,
      amount: 250,
      currency: "INR",
      transaction_id: "REJECTED",
      screenshot_path: "",
      payment_status: "rejected",
      rejection_reason: reason,
      submitted_at: now,
    };
  },
};

export const registrationService = {
  async getAllRegistrations() {
    let remote = [];
    let local = [];

    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from("registrations")
          .select(
            `
            *,
            payments(*),
            registration_events(*)
          `,
          )
          .order("created_at", { ascending: false });

        if (!error && data) {
          remote = data.map((row) => {
            const eventIds = row.registration_events?.map((e) => e.event_id) || [];
            const events = EVENTS.filter((e) => eventIds.includes(e.id));
            const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
            return {
              ...row,
              registration_number:
                row.registration_number || row.registration_id || "FREQ26-REG",
              full_name: row.full_name || row.name || "Participant",
              payment: payment || null,
              events,
            };
          });
        } else if (error) {
          console.warn("Supabase fetch error:", error);
        }
      } catch (err) {
        console.warn("Failed to fetch registrations from Supabase:", err);
      }
    }

    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (raw) {
      try {
        local = JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to parse local registrations:", err);
      }
    }

    const merged = new Map();
    local.forEach((r) => {
      if (r && r.registration_number) merged.set(r.registration_number, r);
    });
    /* Values the remote row may not carry as columns yet (Food Preference,
       teammate details) are read back from the cached record instead of being
       wiped by the remote overwrite — the CSV export reads this merged list. */
    const CACHED_ONLY_FIELDS = [
      "food_preference",
      "team_member_2_name",
      "team_member_2_phone",
    ];
    remote.forEach((r) => {
      if (!r || !r.registration_number) return;
      const cached = merged.get(r.registration_number) || {};
      const carried = {};
      CACHED_ONLY_FIELDS.forEach((key) => {
        carried[key] = r[key] ?? cached[key] ?? "";
      });
      merged.set(r.registration_number, { ...r, ...carried });
    });

    const filtered = Array.from(merged.values()).filter((r) => !isBlocked(r));
    /* Re-write the cache when the set changed OR when the cached copy still
       holds oversized screenshots (migrates a previously-bloated value down to
       the light format instead of crashing on quota). */
    const needsTrim = local.some(
      (r) => r?.payment?.screenshot_path && r.payment.screenshot_path.length > 200,
    );
    if (local.length !== filtered.length || needsTrim) {
      persistLocal(filtered);
    }

    return filtered.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
    );
  },

  async clearAllRegistrations() {
    if (isSupabaseEnabled) {
      try {
        await supabase
          .from("registrations")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
      } catch (err) {
        console.warn("Failed to clear Supabase registrations:", err);
      }
    }
    [
      "frequenza_registrations_v4",
      "frequenza_registrations_v3",
      "frequenza_registrations_v2",
      "frequenza_registrations",
    ].forEach((key) => localStorage.removeItem(key));
    return true;
  },

  async getRegistrationByNumber(query) {
    const all = await this.getAllRegistrations();
    const needle = query.trim().toLowerCase();
    return (
      all.find(
        (r) =>
          r.registration_number?.toLowerCase() === needle ||
          r.email?.toLowerCase() === needle,
      ) || null
    );
  },

  async submitRegistration(form) {
    const now = new Date().toISOString();
    let registrationNumber = `FREQ26-${Math.floor(10000 + Math.random() * 90000)}`;
    const eventIds = [form.tech_event_id, form.non_tech_event_id].filter(Boolean);
    const events = EVENTS.filter((e) => eventIds.includes(e.id));

    let screenshotPath = "";
    try {
      screenshotPath = await paymentService.uploadScreenshot(
        form.screenshot_file,
        registrationNumber,
      );
    } catch (err) {
      console.warn("Screenshot upload warning, using fallback:", err);
    }

    let remoteResult = null;

    if (isSupabaseEnabled) {
      try {
        try {
          const { data, error } = await supabase.rpc("generate_registration_number");
          if (!error && data) registrationNumber = data;
        } catch {
          /* RPC unavailable - fall back to generated number */
        }

        let inserted = null;
        let insertError = null;

        const payload = {
          registration_number: registrationNumber,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          college_name: form.college_name,
          department: form.department,
          year_of_study: form.year_of_study,
          food_preference: form.food_preference,
          team_member_2_name: form.team_member_2_name || null,
          team_member_2_phone: form.team_member_2_phone || null,
          registration_status: "pending_verification",
          payment_status: "under_review",
        };

        const first = await supabase.from("registrations").insert([payload]).select().single();
        inserted = first.data;
        insertError = first.error;

        if (insertError) {
          /* Column-set resilience: retry with successively smaller payloads so
             an optional column (team member / food preference) missing from the
             table never blocks a registration from being stored. */
          const withoutTeam = { ...payload };
          delete withoutTeam.team_member_2_name;
          delete withoutTeam.team_member_2_phone;

          const withoutOptional = { ...withoutTeam };
          delete withoutOptional.food_preference;

          const attempts = [withoutTeam, withoutOptional];
          for (const candidate of attempts) {
            const retry = await supabase
              .from("registrations")
              .insert([candidate])
              .select()
              .single();
            if (!retry.error && retry.data) {
              inserted = retry.data;
              insertError = null;
              break;
            }
          }
        }

        if (insertError) {
          /* Last resort: legacy column shape (`registration_id` / `name`). */
          const legacy = await supabase
            .from("registrations")
            .insert([
              {
                registration_id: registrationNumber,
                name: form.full_name,
                email: form.email,
                phone: form.phone,
                college_name: form.college_name,
                department: form.department,
                year_of_study: form.year_of_study,
                registration_status: "pending_verification",
                payment_status: "under_review",
              },
            ])
            .select()
            .single();
          inserted = legacy.data;
          insertError = legacy.error;
        }

        if (insertError) {
          console.warn("Supabase registration insert error:", insertError);
        } else if (inserted) {
          try {
            await supabase
              .from("registration_events")
              .insert(eventIds.map((id) => ({ registration_id: inserted.id, event_id: id })));
          } catch {
            /* join table insert is best-effort */
          }

          let payment = null;
          try {
            const { data } = await supabase
              .from("payments")
              .insert([
                {
                  registration_id: inserted.id,
                  amount: 250,
                  currency: "INR",
                  transaction_id: form.transaction_id,
                  screenshot_path: screenshotPath || "uploaded",
                  payment_status: "under_review",
                },
              ])
              .select()
              .single();
            payment = data;
          } catch {
            /* payment insert is best-effort */
          }

          remoteResult = {
            ...inserted,
            /* The `registrations` table may not carry these columns yet; keep
               them on the local record so the admin CSV still exports the
               value the participant actually selected. */
            food_preference: form.food_preference || inserted.food_preference || "",
            team_member_2_name: form.team_member_2_name || "",
            team_member_2_phone: form.team_member_2_phone || "",
            payment: payment || {
              id: `pay-${Date.now()}`,
              registration_id: inserted.id,
              amount: 250,
              currency: "INR",
              transaction_id: form.transaction_id,
              screenshot_path: screenshotPath,
              payment_status: "under_review",
              submitted_at: now,
            },
            events,
          };
        }
      } catch (err) {
        console.warn("Supabase execution error:", err);
      }
    }

    const registration =
      remoteResult || {
        id: `reg-${Date.now()}`,
        registration_number: registrationNumber,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        college_name: form.college_name,
        department: form.department,
        year_of_study: form.year_of_study,
        food_preference: form.food_preference,
        team_member_2_name: form.team_member_2_name || "",
        team_member_2_phone: form.team_member_2_phone || "",
        registration_status: "pending_verification",
        payment_status: "under_review",
        created_at: now,
        updated_at: now,
        events,
        payment: {
          id: `pay-${Date.now()}`,
          registration_id: `reg-${Date.now()}`,
          amount: 250,
          currency: "INR",
          transaction_id: form.transaction_id,
          screenshot_path: screenshotPath,
          payment_status: "under_review",
          submitted_at: now,
        },
      };

    try {
      const all = await this.getAllRegistrations();
      const next = [
        registration,
        ...all
          .filter((r) => r.registration_number !== registration.registration_number)
          .map((r) => r),
      ];
      persistLocal(next);
    } catch (err) {
      console.warn("LocalStorage cache write warning (harmless):", err);
    }

    return registration;
  },

  async reuploadPaymentProof(registrationId, transactionId, file) {
    const all = await this.getAllRegistrations();
    const index = all.findIndex((r) => r.id === registrationId);
    if (index === -1) throw new Error("Registration not found");

    const current = all[index];
    const screenshotPath = await paymentService.uploadScreenshot(
      file,
      current.registration_number,
    );
    const now = new Date().toISOString();

    if (isSupabaseEnabled) {
      try {
        if (current.payment?.id) {
          await supabase
            .from("payments")
            .update({
              transaction_id: transactionId,
              screenshot_path: screenshotPath,
              payment_status: "under_review",
              rejection_reason: null,
              updated_at: now,
            })
            .eq("id", current.payment.id);
        }
        await supabase
          .from("registrations")
          .update({
            payment_status: "under_review",
            registration_status: "pending_verification",
            updated_at: now,
          })
          .eq("id", current.id);
      } catch (err) {
        console.warn("Failed to update reuploaded payment proof in Supabase:", err);
      }
    }

    const updated = {
      ...current,
      payment_status: "under_review",
      registration_status: "pending_verification",
      payment: current.payment
        ? {
            ...current.payment,
            transaction_id: transactionId,
            screenshot_path: screenshotPath,
            payment_status: "under_review",
            rejection_reason: undefined,
          }
        : undefined,
    };

    all[index] = updated;
    persistLocal(all);
    return updated;
  },

  async deleteRegistration(id) {
    if (isSupabaseEnabled) {
      try {
        await supabase
          .from("registrations")
          .delete()
          .or(`id.eq.${id},registration_number.eq.${id}`);
      } catch (err) {
        console.warn("Failed to delete registration from Supabase:", err);
      }
    }

    [
      "frequenza_registrations_v4",
      "frequenza_registrations_v3",
      "frequenza_registrations_v2",
      "frequenza_registrations",
    ].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      try {
        const next = JSON.parse(raw).filter((r) => r.id !== id && r.registration_number !== id);
        if (key === REGISTRATIONS_KEY) {
          persistLocal(next);
        } else {
          localStorage.setItem(key, JSON.stringify(next));
        }
      } catch {
        /* ignore malformed cache */
      }
    });

    return true;
  },
};
