# NextGen: personal data status

Technical implementation is not legal confirmation. Open questions wait for the written answer of the State Agency for Personal Data Protection.

## A. Implemented
- Privacy policy v2026-11-26-v2 (design/privacy.html), placeholders where facts are missing.
- Consent: unchecked checkbox on login; if a signed-in user has no valid consent, a blocking dialog asks for it. Stored in `consent_log` (user, time, consent version, policy version, status, withdrawal date). Admin-only read.
- Profile "My data": view/edit name, download data as JSON, withdraw consent (signs out), deletion request, question. Requests land in `data_requests`, handled in the admin panel.
- Access: roles via RLS; teachers do not read student profiles; no passwords (Google / email link); public certificate lookup removed.
- Migrations: supabase/004_privacy.sql.

## B. Waiting for the Agency
- Registration in the holder/owner registry (Digital Code art. 90).
- Minors: under 14 and independent consent from 14. Table `guardian_consents` exists, unused.
- Certificates: public verification, teacher e-signature.
- Third-party servers (Supabase, Google, GitHub Pages, YouTube, Anthropic).
- Retention periods, response deadlines, server region: placeholders in the policy.

## C. Third-party services that touch personal data
Supabase (database, auth, avatar storage), Google (sign-in), GitHub Pages (hosting, no user data), YouTube (embedded lessons), Anthropic (AI checks of submitted text/screenshots, USA).
