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
