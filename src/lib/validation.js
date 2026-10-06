import { z } from "zod";

export const PHONE_REGEX = /^[6-9]\d{9}$/;

export const registrationSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters long")
    .max(100, "Full name must not exceed 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(
      PHONE_REGEX,
      "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9",
    ),
  college_name: z.string().min(2, "College name is required"),
  department: z.string().min(1, "Department is required"),
  year_of_study: z.string().min(1, "Year of study is required"),
  food_preference: z.enum(["Veg", "Non-Veg"], {
    required_error: "Please select your food preference",
  }),
  tech_event_id: z
    .string()
    .min(
      1,
      "A Technical Event registration is COMPULSORY. Please select 1 Technical Event.",
    ),
  non_tech_event_id: z.string().optional(),

  /* ── Fixed-size team events (Tech Quest = exactly 2 members) ─────────────
     `requires_teammate` is set by the form from the selected event's slug, so
     this stays event-agnostic. The second participant is only mandatory when
     the chosen technical event publishes a fixed 2-member team size. */
  requires_teammate: z.boolean().optional(),
  team_member_2_name: z.string().optional(),
  team_member_2_phone: z.string().optional(),

  transaction_id: z
    .string()
    .min(6, "Please enter a valid UPI Transaction ID / Reference Number (min 6 characters)"),
}).superRefine((values, ctx) => {
  if (!values.requires_teammate) return;

  const name = (values.team_member_2_name || "").trim();
  if (name.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["team_member_2_name"],
      message:
        "This event needs exactly 2 team members. Enter your second team member's name.",
    });
  }

  const phone = (values.team_member_2_phone || "").trim();
  if (!PHONE_REGEX.test(phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["team_member_2_phone"],
      message:
        "Enter your second team member's 10-digit mobile number (starting 6, 7, 8 or 9).",
    });
  }
});

export function validateScreenshotFile(file) {
  if (!file) return { valid: false, error: "Payment screenshot is required." };

  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowed.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: "Invalid file format. Please upload a PNG, JPG, JPEG, or WEBP image.",
    };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size exceeds 5MB limit. Please compress or choose a smaller image.",
    };
  }

  return { valid: true };
}
