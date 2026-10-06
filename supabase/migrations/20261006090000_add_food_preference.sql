-- Add server-side Food Preference storage to registrations.
--
-- Background:
--   The registration form already validates `food_preference` as "Veg" | "Non-Veg"
--   (src/lib/validation.js) and the insert payload in src/lib/registrations.js
--   already sends it. This column simply lets Supabase persist it server-side so
--   the admin CSV export shows the actual value on EVERY device/browser, instead
--   of relying on the submitting browser's local cache.
--
--   Until this runs, registrations.js keeps the value in the on-device cache and
--   the CSV still shows it for the browser that registered, but the value is NOT
--   stored in the database.
--
-- Migration is idempotent and safe to re-run.

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS food_preference TEXT;