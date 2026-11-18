# ClinicLog MD design

The single source of truth for how ClinicLog MD looks and sounds. Values live in `src/styles/theme.css`; components live in `src/app/globals.css` and `src/components/ui.tsx`. `npm run design-check` enforces the rules marked **(checked)**.

## Point of view

ClinicLog MD is a record a pre-med keeps for three or four years and then hands to AMCAS. It should look like a well-set printed handbook from a good university press, not like an app trying to look medical. That means:

- Words and numbers carry the page. Decoration has to earn its place by explaining something.
- Hairline rules and white space separate things. Boxes are the exception.
- One serif for names of things, one sans for everything else.
- Black and old gold, with gold kept for the one thing you can do next.

We tried the opposite before (EKG dividers, corner tick marks, record numbers, an Rx mark). It made every screen a costume and hid the content. None of it comes back.

## Colour

All colours are roles in `src/styles/theme.css`. **(checked: no colour literal outside the theme and `src/lib/palette.ts`)**

| Role | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#FBF9F3` paper | `#000000` | page |
| `--surface` | `#FFFFFF` | `#121211` | cards, fields, drawers |
| `--surface-alt` | `#F1EEE6` | `#1C1B19` | hover, selected nav, badges, skeletons |
| `--border` | `#DCD6C8` | `#2E2C28` | hairlines, card edges |
| `--border-strong` | `#827C70` | `#77726A` | field outlines, the rule above a list (3:1 or better) |
| `--text` | `#111111` | `#F5F1E6` | body and headings |
| `--text-muted` | `#57534A` | `#B8B2A2` | supporting text (7.3:1 and 8.9:1) |
| `--text-inverse` | `#F5F1E6` | `#F5F1E6` | text on the black band |
| `--action` | `#9E7E38` | `#9E7E38` | primary button fill (black text, 5.5:1) |
| `--action-hover` | `#B39250` | `#B39250` | primary hover (7.1:1) |
| `--action-pressed` | `#8E7032` | `#8E7032` | primary pressed (4.5:1) |
| `--action-text` | `#7A5F1E` | `#C9A85C` | text links (6.0:1 and 8.3:1) |
| `--focus-ring` | `#9E7E38` | `#C9A85C` | keyboard focus |
| `--success` | `#2D6A3E` | `#86C695` | saved, reached |
| `--warning` | `#865A06` | `#E3B356` | heads up |
| `--danger` | `#B3261E` | `#FF8A80` | errors, delete |
| `--info` | `#2F5574` | `#9DBEDB` | neutral notices |
| `--data-1..5` | ink to stone ramp | cream to night ramp | the five categories, by lightness |

Every status colour has a `-tint` background that keeps its text at 5:1 or better.

**Gold has one job.** It marks primary actions, text links, keyboard focus and the logo mark. Badges, tags, chips, status labels, charts, rules, progress bars, scrollbars and backgrounds are neutral. If something gold cannot be clicked, it is wrong.

**Categories** (clinical, shadowing, research, volunteering, other) are told apart by lightness, leaf shape and a direct label, never by hue alone.

**Dark mode**: a stored choice wins; on a first visit the OS setting decides. The landing hero and the Your Path panel are black in both modes.

## Type

Two faces, self-hosted through `next/font`:

- **Newsreader** (display): page titles, section titles, empty-state titles. A text serif with optical sizes, so it stays sharp at 21px and holds together at 84px. Weights 500 (40px and up) and 600 (below). Nothing else.
- **Public Sans** (text): everything else. Plain, sturdy, with tabular figures. 400 for reading, 600 for labels and emphasis.

There is no monospace face. Numbers use Public Sans with `tabular-nums lining-nums` (`.tnum`, tables, `<time>`, stats), so columns of hours line up.

**Scale (checked)**: 13, 15, 16, 17, 21, 28, 40, 60, 84 px, as Tailwind `text-xs` through `text-5xl` or `var(--text-*)`. Nothing smaller than 13px.

| Step | Token | Use |
|---|---|---|
| 13 | `text-xs` | labels, meta, badges, hints |
| 15 | `text-sm` | secondary text, buttons, table cells |
| 16 | `text-base` | app body, form fields |
| 17 | `text-lg` | marketing body |
| 21 | `text-xl` | section titles (display) |
| 28 | `text-2xl` | page titles in the app, stats |
| 40 | `text-3xl` | entry titles, marketing section heads |
| 60 | `text-4xl` | landing headline on tablets |
| 84 | `text-5xl` | landing headline on desktop |

Line height 1.6 for body (1.55 to 1.65 range), 1.1 to 1.3 for headings. Running text stops at 68 characters (`.measure`, `.prose`). Display text at 40px and up is tracked at -0.02em; body text is not tracked. Labels are sentence case, never letter-spaced capitals.

## Layout and spacing

- **Spacing** on a 4px base, used only in these steps: 4, 8, 12, 16, 24, 32, 40, 48, 64, 96 (`--sp-h`, `--sp-1`, `--sp-15`, `--sp-2`, `--sp-3`, `--sp-4`, `--sp-5`, `--sp-6`, `--sp-8`, `--sp-12`).
- **Grid**: 12 columns (`lg:grid-cols-12`) with 24 to 48px gutters. App pages run to 1,120px wide; marketing to 1,200px.
- **Asymmetry on purpose**: forms are 8 columns of fields beside 4 of guidance; the entry page is 8 of writing beside 4 of facts; the dashboard pairs a 7-column panel with a 5-column one. Text is left-aligned everywhere.
- **No two consecutive sections share a layout pattern.** On the dashboard: a ruled line of numbers, a black panel, a 7/5 pair of cards, a ruled list, a card, a sentence, a ruled list.

## Surfaces

Flat, with hairline borders. One radius per kind of thing:

| Token | Value | Use |
|---|---|---|
| `--radius-control` | 4px | buttons, fields, badges |
| `--radius-card` | 6px | cards, notices, panels |
| `--radius-modal` | 8px | dialogs, drawers, popovers |

**One shadow** (`--shadow-overlay`), for things that float over the page: menus, drawers, dialogs, toasts, the advisor button. Nothing that sits in the page has a shadow. **(checked: `box-shadow` only from the token list)** No gradients, glass, blur or glow. **(checked)**

## Components

One version of each, in `src/app/globals.css`. All have visible `:focus-visible` (2px ring, 2px offset), and touch targets of 44px on coarse pointers.

| Component | Class | States |
|---|---|---|
| Button | `.btn` plus `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`; `.btn-sm`, `.btn-block` | hover, active, focus-visible, `:disabled` / `aria-disabled`, loading (`aria-busy="true"`) |
| Text field, select, textarea | `.field` with `.label`, `.hint`, `.field-error` | hover, focus, disabled / readonly, error (`aria-invalid="true"`) |
| Checkbox, radio | native, `accent-color: var(--text)` | focus-visible, disabled |
| Tabs | `.tabs`, `.tab` | hover, selected (`aria-selected`), focus-visible, disabled |
| Card | `.card`; `a.card` for a clickable one | hover border for links only |
| Badge | `.badge`, `.badge-success` / `-warning` / `-danger` / `-info` | static |
| Table | `.table`, `.num` for numeric columns | row hover |
| Modal | `.overlay`, `.modal` | the one overlay shadow |
| Toast | `.toast` | the one overlay shadow |
| Tooltip | `.tooltip` | the one overlay shadow |
| Notice | `<Notice tone>` | info, success, warning, danger |
| Empty state | `<EmptyState title action>` | says what goes here and the one thing to do |
| Loading | `<Loading label>`, `<Skeleton lines>` | static: no spinners, no shimmer |
| Progress | `<Meter value label>` | width eases over 200ms |
| Navigation | `.nav-group`, `.nav-item` with `aria-current="page"` | hover, current |

## Motion

State changes only: 120ms (`--dur-fast`), 160ms (`--dur`) or 200ms (`--dur-slow`), with `--ease-out`. No bounce, parallax, scroll effects, count-up numbers or looping animation. The route progress bar is the one animation longer than 200ms, because it stands for a wait. `prefers-reduced-motion` turns every transition and animation off.

## Details

- **Dates**: "Nov 12, 2026". Times: "Nov 12, 2026, 11:22 AM". Ranges: "Jan 22, 2026 to Nov 12, 2026", or "to now" while ongoing. From `src/lib/format.ts` only.
- **Hours**: "212 hrs", "1 hr", "2.5 hrs". At most one decimal, never zero-padded, always right-aligned in a column.
- **Titles**: every browser tab reads "ClinicLog MD" and nothing else.
- **Empty states** say what will appear and give one action.
- **Errors** say what happened and what to do, in the user's words, never a code.
- **Print and PDF** use the same paper, ink and gold as the screen, with the display face for headings where the format allows.
- **Sample data** is always labelled as sample.

## Voice

**Who we are.** A pre-med student at Wake Forest who built the tracker they wanted, writing for the next person in the same spot. We know the cycle from the inside, and we are not an admissions office.

**How we sound.** Direct, specific and calm. We name the thing, give the number, and stop. Short sentences, with a longer one when the idea needs room. We never hype, and we never scare.

**Words we use.** log, hours, entry, record, school, cycle, AMCAS, secondary, letter, export, check, add, save, edit, delete. Real numbers: "700 characters", "40 hours", "May 1".

**Words we never use (checked).** unlock, supercharge, seamless, elevate, empower, leverage, journey, revolutionize, game-changer, cutting-edge, streamline, "in today's fast-paced world", "take it to the next level", "whether you're", "not just", delve, robust, tapestry, effortless, harness, skyrocket, next-gen. No exclamation marks. No em dashes. **(checked)**

**Sentence rules.**

- Headings say what the thing is or does. No questions as headings, no three-part slogans.
- Buttons name the outcome: "Log hours", "Save entry", "Export PDF", "Delete".
- Sentence case everywhere except proper names and the five AMCAS categories.
- Anything about AI says what it does and that it can be wrong.
- Benchmarks are "common", never "required".

**Examples.**

| Instead of | Write |
|---|---|
| Unlock your med school journey. | Keep your hours ready for AMCAS. |
| Experience intake / Save to record | Log hours / Save entry |
| TTL, ORG, CAT, HRS | What you did, Where, AMCAS category, Total hours |
| Your Pre-Med Archetype is ready to be revealed | You have enough entries for an archetype read. |
| Critical gap: no shadowing hours | No shadowing hours yet |
| That page isn't in the chart. | We could not find that page. |
| AI ASSISTED · SEES YOUR LOGGED TOTALS | Sees your logged totals, not your descriptions |
