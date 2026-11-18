# Design log

A running record of the design and copy overhaul. Newest phase at the bottom.

## Phase 0: inventory and baseline (18 Nov 2026)

### What was read

Every route under `src/app` (31 pages, 18 API routes), `src/components` (AppShell, tour, Help Center, charts, insights, recap card, logo), `src/lib` (palette, PDF and email branding, tour copy, checks copy, changelog), `src/styles/theme.css`, `src/app/globals.css`, `src/app/landing.css`, the OG image, icons, manifest, `global-error.tsx`, `not-found.tsx`, and the Supabase email templates in `docs/`.

### Tokens in use today

| Role | Light | Dark | Notes |
|---|---|---|---|
| Page | `#FBF9F3` paper | `#000000` | |
| Surface | `#FFFFFF` | `#111111` | |
| Text | `#111111` | `#F5F1E6` | |
| Muted text | `#3A3A3A` | `#B8B2A2` | |
| Subtle text | `#6B6B6B` | `#B8B2A2` | |
| Strong border | `#000000` | `#9E7E38` | used on almost every card, 1px or 2px |
| Accent | `#9E7E38` old gold | same | buttons, chips, tags, charts, scrollbars, progress, sidebar marker, rules |
| Accent text | `#7A5F1E` | `#C9A85C` | |
| Accent tint | `#F3ECDA` | gold at 16% | chips, hover, active nav, banners |
| Danger | `#B3261E` | `#FF8A80` | |
| Charts | black, gold 500, gold 300, gray 500, gray 300 | gold 300, cream, gold 500, gray 400, gold 200 | |
| Radius | 0 everywhere | | Tailwind radius scale collapsed to 0 |
| Fonts | Inter (app), Archivo (landing only), JetBrains Mono (labels, numbers, IDs) | | |
| Type sizes found | 9, 10, 11, 12, 13, 13.5, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 40, 66 px plus Tailwind xs to 4xl | | about 40 distinct sizes |

### Baseline numbers

- Screenshots: `design-audit/before/`, 31 pages at 1440, 1024, 768 and 390 (124 files). Signed-in pages use a local sample-data client that never reaches Supabase.
- Lighthouse, live site, mobile: landing 100/100/100/100, about 100/95/100/100, sign in 99/100/100/100, sign up 100/100/100/100 (performance, accessibility, best practices, SEO).
- axe (WCAG 2 A/AA plus best practice), 30 pages, light and dark, 1440 and 390: 8 critical `label`, 16 critical `select-name`, 4 serious `link-in-text-block`, 16 serious `nested-interactive`, 4 serious `scrollable-region-focusable`, 36 moderate `heading-order`, 16 moderate `landmark-one-main`, 104 moderate `region` (counts are page and viewport combinations).
- Horizontal overflow at 768: dashboard 42px, schools 9px.

### Problems found

| # | Phase | Where | Problem |
|---|---|---|---|
| 1 | 1 | Whole app | The medical-chart costume: corner tick marks on 39 cards, perforated "tear" rules (21), "TAB 01" binder tags, "RECORD NO. 5065" in every header, "EXP-0006" numbers on entries, EKG squiggle dividers and loader, oscilloscope lines in the AMCAS tracker, an Rx mark on the logger, a "signature line", "VITALS NORMAL" and "NO SIGNAL" status marks. One theme pushed into every element reads as generated, and it hides the content. |
| 2 | 1 | Logger and edit form | Field labels abbreviated to codes: TTL, ORG, CAT, DOS START, DOS END, HRS, DESC, REFL. Page called "Experience intake", button "Save to record", "WILL FILE AS EXP-0008". |
| 3 | 1 | Dashboard | Experience insights are three identical bordered cards with an icon on top. |
| 4 | 1 | Dashboard | "Assessment pending / Your Pre-Med Archetype is ready to be revealed / Reveal" teaser. |
| 5 | 1 | Dashboard | "Senior · Apply-cycle territory" pill on the insights header. Pill-style tags above sections. |
| 6 | 1 | Sidebar | Two-letter codes (OV, AR, SC...) beside every nav item. |
| 7 | 1 | Whole app | Gold used for decoration: chip fills, tag borders, progress bars, scrollbars, section rules, sidebar marker, card hover rule, the 404 rule, chart series. |
| 8 | 1 | Whole app | Uppercase tracked micro labels (10px mono or sans, 0.12em) on nearly every heading, label and value. |
| 9 | 1 | 404 | "CHART LOOKUP", "ERR 404 / NO RECORD ON FILE", "That page isn't in the chart." Costume voice. |
| 10 | 1 | Landing | Two primary actions in the hero (Start logging hours and Sign in) plus a third in the header. An illustration where a product screenshot should be. Eyebrow "HOURS, SCHOOLS, STORY" (three part slogan). Numbered 01 to 04 feature rows. |
| 11 | 1 | Copy | Few stock phrases remain. The real problem is themed wording ("intake", "on file", "chart", "record", "revealed") and generic headings ("Good morning, Sample."). |
| 12 | 2 | Type | About 40 font sizes, labels at 9 to 11px, Inter for all app text, Archivo only on the landing page, mono used for dates, hours, IDs and labels alike. |
| 13 | 2 | Tokens | No roles for surface-alt, border (hairline vs strong), text-inverse, action states, success, warning, info. Accent does six jobs. |
| 14 | 2 | Surfaces | 1px and 2px black borders on almost every card make every block equally loud. Square corners everywhere. |
| 15 | 2 | Components | Two button systems (`teal-glow`, `btn-primary`, `btn-ghost`, `tour-btn`), two input styles (`field-input` underline, `input-dark` box), three card classes (`glass-card`, `clinical-card`, `vital-card`), class names left over from an older teal and glass design. |
| 16 | 2 | Motion | Looping animations: EKG loader sweep, blinking cursor loader, a ticker. Count-up numbers. |
| 17 | 2 | Stats | Dashboard stat tiles read "000.0", "00", "00" with reduced motion on: the count-up never reaches the value. |
| 18 | 3 | Dashboard 768 | 42px horizontal overflow. Schools 768: 9px. |
| 19 | 3 | Experience page | Edit button is taller than Export PDF and Delete beside it. |
| 20 | 3 | Sidebar | Nav list is cut off above the account block at 900px tall (Import CSV half hidden). "Help" appears twice (top bar and sidebar). |
| 21 | 3 | Schools | 24,000px tall page of identical cards at 1440. |
| 22 | 3 | Forms | Placeholder text doubles as the label example on every field ("Title, e.g. ..."); underline-only inputs have weak affordance. |
| 23 | 3 | a11y | Unlabelled selects on specialties, schools and post-bacc; unlabelled month input on gap year; a nested interactive SVG on the Your Path panel; a link on About told apart only by colour; a scroll region on the badge page that keyboard users cannot reach; heading levels skip on landing cards; several pages have no `main` landmark. |
| 24 | 4 | Tooling | Colour check exists (`scripts/check-colors.mjs`). Nothing checks gradients, shadows, type scale, emoji, dashes or banned phrases. eslint scans generated folders (`.netlify`, `tmp`, an old `.next` copy), so `npm run lint` reports 43,000 problems. |

## Phases 1 and 2: remove the tells, set one system (18 Nov 2026)

- Removed: EKG dividers and loader, corner tick marks, perforated rules, "RECORD NO." and "TAB 01" markers, EXP numbers, the oscilloscope tracker, Rx and signature marks, coded labels (TTL, ORG, CAT, HRS), zero-padded counts, count-up numbers, three icon-topped insight cards, the archetype teaser, two-letter nav codes, uppercase tracked micro labels, decorative icons in buttons, back links and empty states.
- Gold now marks only primary buttons, links, focus and the logo mark. Badges, charts, rules, meters and nav are neutral.
- Tokens rebuilt as roles in `src/styles/theme.css`; fonts Newsreader and Public Sans; type scale 13 to 84; one overlay shadow; radii 4, 6 and 8; motion 120 to 200ms with no loops.
- One shared button, field, card, badge, table, tabs, modal, toast, tooltip, notice, empty state, skeleton and meter in `globals.css` and `src/components/ui.tsx`, placed in `@layer components` so utilities still apply.
- `DESIGN.md` written, with the voice guide.

## Phase 3: page by page

- Landing: one promise, one action ("Create an account"), two real screenshots of the app with sample data, figures counted from the app's own data, five sections with five different structures.
- Auth pages share one frame; 404, route error and global error pages rewritten.
- Dashboard: a ruled line of numbers, the Your path panel, a 7/5 pair, a prioritized list, a check card, the entry list. Logger and edit share one form with plain labels and a guidance column.
- Schools is a ruled table with right-aligned averages. Specialties became an accessible disclosure list; Resources grouped ruled lists.
- Profile became a settings page. Help Center and tour copy cleaned. Emails, Supabase templates, PDFs, the recap image and the archetype image use the same faces and hairlines.
- Fixes found on the way: a skip link; the closed advisor drawer was focusable; specialty cards were not keyboard reachable; unlabelled selects and fields; labels not tied to inputs; the empty schools message said 149 programs; the Privacy Policy named Vercel as host (now Netlify); a "fordham University" typo.

## Phase 4: guardrails

`npm run design-check` (`scripts/design-check.mjs`) fails on colour literals, gradients, shadows outside the token, off-scale font sizes, emoji, em dashes, banned phrases, exclamation marks and the retired costume classes. It runs in `npm run lint`, before every build (`prebuild`, so Netlify stops on a violation), and in a GitHub workflow on every push and pull request.

## Phase 5: verification

- Typecheck, lint (0 errors), build (with design-check) and design-check pass. Test suites: polish 53 passed, security 15 passed (4 need test accounts), checks 36 passed, tour 16 passed (5 need test accounts).
- axe, same 30 pages, light and dark, 1440 and 390: no violations. Before: 8 critical label, 16 critical select-name, 4 serious link-in-text-block, 16 serious nested-interactive, 4 serious scrollable-region-focusable, 36 heading-order, 16 landmark-one-main, 104 region.
- Lighthouse on a local production build: accessibility, best practices and SEO 100 on landing, About, sign in and sign up. Performance 93 to 95 locally, without Netlify's CDN; the live run after deploy is the comparable number.
- Keyboard only: the first Tab is the skip link, the logger's first field is two Tabs after it, the whole form fills and submits by keyboard, and every stop on the dashboard shows the focus ring.
- No horizontal scroll on any page at 390, 768, 1024 or 1440.
- Screenshots: `design-audit/after/`, the same 31 pages and widths as `before/`. Signed-in pages use the same local sample data as the baseline.
