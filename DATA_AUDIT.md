# Data audit

What ClinicLog MD actually collects, where it goes, and how long it stays. Written 21 Nov 2026 from the code, the live Supabase schema and RLS policies (project `tsapqeaxqveiwvqxcaap`, region `us-east-2`), the API routes and the third-party terms. The Privacy Policy and Terms may only claim what is in this file.

## 1. Data collected or stored

### Account and identity
| Data | Where | Notes |
|---|---|---|
| Email address, password (hashed by Supabase Auth), email confirmation time, sign-in times | Supabase Auth (`auth.users`) | Sign-up limited to @wfu.edu (`supabase/migrations/20261028030000_wfu_only_signup.sql`). Email and password only; no social sign-in. |
| Full name | `auth.users.user_metadata.full_name` (sign-up form) and `profiles.full_name` | `src/app/auth/signup/page.tsx` |
| Undergraduate school, graduation year, intended specialty, AMCAS target date, theme preference, onboarding status | `profiles` | `src/app/profile/page.tsx` |
| Committee letter status and notes | `profiles` | |
| Referral code, referrals made | `profiles.referral_code`, `referrals` | Referral cookie below |

### What users log
| Data | Table |
|---|---|
| Experiences: title, organization, category, start and end dates, hours, description, reflection | `experiences` |
| School list: school name, Target or Applying, secondary prompt, word limit, status, deadline, fee, fee waiver status, notes | `school_applications` |
| Interviews: school, format, date, status, reflection; waitlist updates with notes | `interviews`, `waitlist_updates` |
| Letters: recommender name, relationship, date requested, status, assigned schools, notes | `recommendations` |
| Fee waivers: name, amount saved, status, deadline, notes | `fee_waivers` |
| Gap year: target cycle, goals, monthly log, milestones | `gap_year_data` |
| Post-bacc: courses (name, semester, credits, grade, BCPM), program type, GPA goals, notes | `postbacc_courses`, `postbacc_profile` |
| Breaks (date ranges) | `user_breaks` |
| Archetype result (id, AI explanation, statement angle) and when generated | `profiles.archetype_id`, `archetype_data`, `archetype_generated_at` |
| Dismissed application checks | `finding_dismissals` |
| Tour progress | `tour_progress` |
| Feedback and problem reports (kind, message, page) | `feedback` |
| First-generation stories (name, schools, background, quote) | `story_submissions`. Not linked to the account (no user id). |

**Not stored:** GPA and MCAT typed on the Schools page stay in the browser for that visit only (`src/app/schools/SchoolList.tsx`, component state). Home state on the Schools page is the same. No file uploads are stored: CSV import is parsed in the browser and only the resulting experiences are saved (`src/app/import`). The AI Advisor conversation is not saved; it exists in the browser until the page is closed (`src/components/AIAdvisorButton.tsx`). Outline and mock interview results are not saved (`src/app/outline`, `src/app/mock-interview`).

### Created automatically
| Data | Where | Notes |
|---|---|---|
| Page views: path visited, user id if signed in, time | `page_visits` via `src/app/api/pageview/route.ts` | Owner-only totals at `/admin/insights`. No IP, no browser details. |
| AI and export usage counters per user per day | `user_rate_limits` | `src/lib/rateLimit.ts` |
| Sign-in and password-reset attempt counters keyed by IP address or by email address | `auth_rate_limits` | Raw IP addresses and email addresses as keys. Rows are reset in place but never deleted (`supabase/migrations/20261028020000_rate_limit_secret_hash.sql`). |
| Email send log: kind, day, status | `notification_log` | |
| Reminder preferences, unsubscribe time | `notification_prefs`, `profiles.digest_opt_out` | |
| Server request logs (IP address, path, user agent, time) | Netlify | Kept by Netlify under its own policy. The app does not read them. |

### Cookies and browser storage
| Name | Type | Purpose |
|---|---|---|
| `sb-<project>-auth-token` (may be split into `.0`, `.1`) | Cookie, set by Supabase | Keeps you signed in |
| `cliniclog_ref` | Cookie, httpOnly, 30 days | Holds a referral code from a sign-up link until the first sign-in (`src/app/auth/signup/page.tsx`, `src/lib/referral.ts`) |
| `cliniclog-theme` | localStorage | Light or dark choice (`src/components/ThemeToggle.tsx`) |

No analytics, advertising or tracking cookies. No third-party scripts: a nonce-based Content Security Policy allows only the app's own scripts (`src/proxy.ts`). Fonts are self-hosted through `next/font`, so no request goes to Google Fonts at runtime.

## 2. Third parties that receive user data

| Provider | What it does | User data it receives |
|---|---|---|
| Supabase (US, region us-east-2) | Database and sign-in | Everything in section 1 except Netlify logs |
| Netlify | Hosting | Every request: IP address, path, user agent, and the content of pages and form posts as they pass through |
| Google, Gemini API (`gemini-2.5-flash`) | AI features | See section 2a. Only when the user uses an AI feature. |
| Resend | Sends reminder and weekly summary emails | Email address; email content (section 2b) |
| Supabase Auth email | Sends confirmation and password reset emails | Email address. Which mail service Supabase uses for this project (Supabase's own or a custom SMTP such as Resend) is not visible in the code. **Ask.** |

### 2a. Exactly what goes to Gemini

Sent only when the user opens or runs the feature. Each route checks a per-user daily limit first (`src/lib/rateLimit.ts`).

| Feature | Route | Sent to Gemini |
|---|---|---|
| AI Advisor | `src/app/api/advisor/route.ts`, `src/lib/aiProfile.ts` | Every message in the conversation so far, plus a profile summary: archetype, intended specialty, graduation year, total hours and hours by category, and for the 12 entries with the most hours: title, organization, category, hours, **description (first 300 characters) and reflection (first 300 characters)** |
| Archetype | `src/app/api/archetype/route.ts` | Graduation year, intended specialty, and **every experience** with title, organization, category, hours, dates, **full description and full reflection** |
| Statement outline | `src/app/api/outline/route.ts` | The same profile summary as the Advisor (archetype, specialty, year, totals, top 12 entries with 300 characters of description and reflection) |
| Mock interview | `src/app/api/mock-interview/route.ts` | The same profile summary |

Archetype results are saved to `profiles.archetype_data`. Advisor, outline and mock interview responses are not saved.

Full name and undergraduate school were removed from every prompt on 21 Nov 2026. The AI Advisor's header and greeting now say it sees descriptions and reflections (they previously said it did not). Archetype runs only when the user clicks Generate.

**Plan and terms.** The project is on the Gemini API free tier (the daily quota error in the dev log on 18 Nov 2026 read "generate_content_free_tier_requests"). Google's Gemini API Additional Terms, effective 23 Mar 2026 (https://aistudio.google.com/docs/terms):
- Unpaid services: Google uses submitted content and responses "to provide, improve, and develop Google products and services and machine learning technologies"; "human reviewers may read, annotate, and process your API input and output" after Google disconnects it from the account.
- Unpaid services: "Do not submit sensitive, confidential, or personal information to the Unpaid Services." The app no longer sends name or school, but entries can hold personal details; the Privacy Policy tells users so.
- Paid services: prompts and responses are not used to improve products; they are logged "for a limited period of time, solely for detecting and preventing violations of the Prohibited Use Policy" (no number of days given).
- Users must be 18 or older, and the API may not be used in a service "likely to be accessed by individuals under the age of 18".
- Only paid services may be offered to users in the EEA, Switzerland or the UK.

### 2b. Email content
- Weekly summary (`src/app/api/cron/weekly-digest/route.ts`): hours and number of entries logged that week. Sent to users who logged in the last 30 days and have not opted out. On by default.
- Gap reminders (`src/lib/checks/reminder.ts`, `src/app/api/cron/gap-reminders/route.ts`): off unless the user turns them on. Content includes entry titles, dates and totals, never descriptions.
- Both carry a one-click unsubscribe (`src/app/api/unsubscribe/route.ts`).
- Both are scheduled in `vercel.json`, which Netlify does not read; whether they are currently sending is unconfirmed (flagged separately).

## 3. Retention and deletion
- **Deleting an entry** deletes the row immediately (`src/app/dashboard/actions.ts`). Other trackers likewise.
- **Deleting the account** (`/profile`, type DELETE; `src/app/api/account/delete/route.ts` calls `public.delete_my_account()`) deletes the `auth.users` row. Every user table has `ON DELETE CASCADE` to `auth.users`, so all rows go at once, except:
  - `page_visits`: `ON DELETE SET NULL`, but `delete_my_account()` now deletes the user's rows first (migration `20261121120000_legal_acceptance.sql`).
  - `story_submissions`: never linked to an account, so a submitted story stays until removed by hand.
  - `auth_rate_limits`: the `email:` row for the user's address is deleted by `delete_my_account()`; rows keyed by IP stay.
- **Backups:** Supabase takes database backups under its plan. The retention period for this project's plan is not visible in the code. **Ask or check the Supabase dashboard.**
- **Export:** `/api/account/export` returns a JSON file of 16 tables (`src/app/api/account/export/route.ts`). It does not include `feedback` (deleted with the account through its cascade) (users cannot read their feedback rows under RLS), `page_visits`, `user_rate_limits` or the sign-in email itself. Experiences can also be exported as a PDF. There is no CSV export; CSV is import only (the template download in `src/app/import/ImportView.tsx`).
- **Theme and other preferences** stay in the browser until cleared.

## 4. Security measures that exist
- Row Level Security on every public table; users can read and change only their own rows (policies listed in the live schema; `supabase/migrations/20261027120000_security_hardening.sql`).
- Passwords handled by Supabase Auth (hashed; the app never sees them).
- HTTPS with HSTS (`max-age=63072000`), a nonce-based Content Security Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (`src/proxy.ts`, `next.config.ts`, checked in `tests/security/public.spec.ts`).
- Same-origin checks on state-changing API routes (`src/lib/http.ts`).
- Rate limits on sign-in, password reset, AI features and exports (`src/lib/rateLimit.ts`, `auth_rate_limits`, `user_rate_limits`).
- Sign-up limited to @wfu.edu, enforced in the database.
- The AI routes treat logged text as untrusted data inside fenced blocks (`src/lib/aiGuard.ts`).
- Server secrets (service role key, Gemini key, Resend key) stay on the server; a test checks the client bundle (`tests/security/public.spec.ts`).

## 5. Questions that block the legal text
1. **Gemini plan.** On the free tier Google may train on and human-review what users send, and its terms forbid sending personal information. Move to the paid tier (a Cloud billing account), or change what is sent, or both?
2. **Name and school in AI prompts.** Remove full name and undergraduate school from what is sent to Gemini? They are not needed for the results.
3. **Minimum age.** Google requires 18 or older for any app using the API. Set the service to 18 and older?
4. **Contact email.** No public contact address exists. Which address should the policies list (for example privacy@cliniclogmd.com, once the mailbox exists)?
5. **Operator name.** Who operates the service in the documents: "Jad Maazouzi" as an individual, or a business name?
6. **Governing law.** North Carolina?
7. **Price.** The service has no paid tier and takes no payments. Confirm the Terms should say there is no charge today and that you would give notice before any paid feature.
8. **Supabase auth emails and backups.** Which mail service sends confirmation and reset emails, and how long does the Supabase plan keep backups?

## 6. Answers (21 Nov 2026)
1. Gemini plan: stay on the unpaid tier. Name and school removed from prompts; the Privacy Policy discloses Google's use and human review, and asks users to leave personal and patient details out of entries they use with AI.
2. Done, see 1.
3. 18 and older. Sign-up and re-acceptance ask users to confirm it.
4. Contact: the Help Center form only (signed in).
5. Operator: Jad Maazouzi, an individual.
6. Governing law: North Carolina.
7. No charge today; notice before any paid feature.
8. Still open: which mail service sends Supabase Auth emails, and the backup retention period. The policy describes both without numbers.

## 7. Consent records
`profiles.legal_version` and `legal_accepted_at`, set by `handle_new_user()` at sign-up and by `accept_legal()` afterwards; users cannot write them directly. The current version is `LEGAL_VERSION` in `src/lib/legal.ts`; the proxy sends anyone with an older version to `/legal/accept`.
