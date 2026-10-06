-- Allow multiple registrations with the same email and/or phone.
-- Registration ID (registration_number) remains the ONLY unique identifier.
-- Safe to run on any database: each statement is a no-op when the
-- constraint does not exist (verified: live project has none of these).

ALTER TABLE IF EXISTS public.registrations
  DROP CONSTRAINT IF EXISTS registrations_email_key;

ALTER TABLE IF EXISTS public.registrations
  DROP CONSTRAINT IF EXISTS registrations_phone_key;

ALTER TABLE IF EXISTS public.registrations
  DROP CONSTRAINT IF EXISTS registrations_email_phone_key;