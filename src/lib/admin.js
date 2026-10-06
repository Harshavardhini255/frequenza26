import { registrationService } from "./registrations";

export const adminService = {
  async getDashboardStats() {
    const all = await registrationService.getAllRegistrations();
    const verified = all.filter((r) => r.payment_status === "verified");
    const pending = all.filter((r) => r.payment_status === "under_review");
    const rejected = all.filter((r) => r.payment_status === "rejected");

    const revenue = verified.reduce((sum, r) => sum + (r.payment?.amount || 250), 0);

    let tech = 0;
    let nonTech = 0;
    all.forEach((r) => {
      r.events?.forEach((e) => {
        if (e.category === "technical") tech++;
        else nonTech++;
      });
    });

    return {
      totalRegistrations: all.length,
      verifiedPayments: verified.length,
      pendingPayments: pending.length,
      rejectedPayments: rejected.length,
      totalRevenue: revenue,
      techEventRegistrations: tech,
      nonTechEventRegistrations: nonTech,
    };
  },

  exportToCSV(registrations) {
    const headers = [
      "Registration ID",
      "Full Name",
      "Email",
      "Phone",
      "College Name",
      "Department",
      "Year of Study",
      "Registered Events",
      "Payment Status",
      "UPI Transaction ID",
      "Submitted Date",
      "Food Preference",
      "Team Member 2 Name",
      "Team Member 2 Phone",
    ];

    /* `food_preference` is validated as the enum "Veg" | "Non-Veg" at
       registration time (lib/validation.js), so it is passed straight
       through. Normalising only covers casing/whitespace drift from older
       rows — it never invents a value, and an absent field stays blank. */
    const foodPreference = (r) => {
      const raw = r?.food_preference;
      if (typeof raw !== "string") return "";
      const v = raw.trim();
      if (!v) return "";
      if (/^veg$/i.test(v)) return "Veg";
      if (/^non[-\s]?veg$/i.test(v)) return "Non-Veg";
      return v;
    };

    const rows = registrations.map((r) => [
      `"${r.registration_number}"`,
      `"${(r.full_name || "").replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${(r.college_name || "").replace(/"/g, '""')}"`,
      `"${r.department}"`,
      `"${r.year_of_study}"`,
      `"${r.events?.map((e) => e.name).join("; ") || ""}"`,
      `"${r.payment_status}"`,
      `"${r.payment?.transaction_id || ""}"`,
      `"${new Date(r.created_at).toLocaleDateString("en-IN")}"`,
      `"${foodPreference(r)}"`,
      `"${(r.team_member_2_name || "").replace(/"/g, '""')}"`,
      `"${r.team_member_2_phone || ""}"`,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute(
      "download",
      `FREQUENZA26_Registrations_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
