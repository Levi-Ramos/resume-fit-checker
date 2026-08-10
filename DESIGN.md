---
name: Groundtruth
description: Grounded, citation-backed resume-to-job-description fit checking with Gemini.
colors:
  background: "#0b0f0d"
  panel: "#121815"
  well: "#151d19"
  border: "rgba(255,255,255,0.08)"
  fog: "#eef1ef"
  muted-slate: "#8a9992"
  primary: "#34d399"
  primary-ink: "#06140d"
  accent: "#1f9d6f"
  accent-ink: "#06140d"
  alert-red: "#e0685f"
  amber-partial: "#eab86e"
typography:
  display:
    fontFamily: "var(--font-geist-sans), Geist, ui-sans-serif, system-ui"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "var(--font-geist-sans), Geist, ui-sans-serif, system-ui"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "var(--font-geist-sans), Geist, ui-sans-serif, system-ui"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  readout:
    fontFamily: "var(--font-geist-mono), Geist Mono, ui-monospace, monospace"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1
  label:
    fontFamily: "var(--font-geist-mono), Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.02em"
rounded:
  sm: "0.45rem"
  md: "0.6rem"
  lg: "0.75rem"
  xl: "1.05rem"
  pill: "9999px"
spacing:
  sm: "0.75rem"
  md: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.lg}"
    padding: "8px 10px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, {colors.primary} 80%, transparent)"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.fog}"
    rounded: "{rounded.lg}"
    padding: "8px 10px"
  button-outline-hover:
    backgroundColor: "{colors.well}"
  badge-verdict:
    backgroundColor: "transparent"
    textColor: "{colors.fog}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.fog}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.fog}"
    rounded: "{rounded.lg}"
    padding: "8px 10px"
---

# Design System: Groundtruth

## Overview

**Creative North Star: "The Diagnostic Readout"**

Groundtruth reads like an instrument panel, not a marketing page: a near-black emerald-tinted canvas, monospace numerals for anything measured, and one saturated color family — signal emerald — spent with intent rather than sprinkled for decoration. The system exists to deliver a verdict the user can trust (match / partial / gap, each with a citation), so the interface stays clinical and calm where it reports data, and reserves warmth for the moment it delivers good news.

Color is quiet and restrained by design: the panel/well/border layers of near-black do almost all the visual work, and saturated color is spent only on the primary action and the three verdict states (green = match, amber = partial, red = gap). Nothing else on screen competes with those signals for attention.

The codebase also defines a light palette (`:root`, un-namespaced), but `<html>` hardcodes `className="dark"` unconditionally — there is currently no code path that renders it. This document treats the `.dark` palette as the sole canonical, shipped visual system; the light tokens are dormant and should not be trusted as a secondary theme until something actually toggles them. (A same-system light variant was explored during the Aug 2026 redesign but not wired up — see Layout.)

**Key Characteristics:**
- Forced dark, near-black base with an emerald tint — not a "dark mode option," the only mode.
- Monospace reserved for measured/technical content (scores, badges, the nav wordmark, form inputs, the primary CTA); sans-serif carries all prose.
- Flat by construction: depth comes from tonal layering and hairline rings, never drop shadows.
- One saturated brand hue (signal emerald, in two shades) plus three status colors that double as the verdict vocabulary.

## Colors

The palette is almost monochrome near-black at rest; color appears only to mean something.

### Primary
- **Signal Emerald** (`#34d399`): the primary action color — the "Check fit" button, focus rings, the nav accent — and, not coincidentally, the same value as the "match" verdict. Emerald means both "go" and "good."

### Secondary
- **Deep Emerald** (`#1f9d6f`): a darker shade of the same hue, carried in the token set (`--accent`) as the shadcn-standard accent slot for future components (hover states on menus/selects, etc.) — nothing in the current UI renders it yet. The hero previously had an aurora glow using this + Signal Emerald; it was cut (Aug 2026) for reading as unintentional light on the form card once the hero widened to full-bleed.

### Neutral
- **Deep Space** (`#0b0f0d`): page background — near-black with a faint green tint rather than the old blue-black.
- **Panel** (`#121815`): card, popover, and modal surfaces — one step lighter than the page so containers read as raised without a shadow.
- **Well** (`#151d19`): secondary/muted surface — secondary buttons, muted chips, disabled input fill, hover rows.
- **Hairline** (`rgba(255,255,255,0.08)`, translucent): all borders and input strokes — translucent-on-dark rather than a flat hex, so it reads correctly against both Panel and Well.
- **Fog White** (`#eef1ef`): primary text.
- **Muted Slate** (`#8a9992`): secondary/caption text (descriptions, timestamps, rationale copy).

### Status (the verdict vocabulary)
- **Signal Emerald** (`#34d399` — same token as Primary): "match."
- **Amber Partial** (`#eab86e`): "partial" — the one hue that exists solely for this state; don't reuse it elsewhere.
- **Alert Red** (`#e0685f` — same token as Destructive): "gap" / destructive action / form error.

### Named Rules
**The Verdict-Only Color Rule.** Outside the primary CTA, saturated color appears only to report a match/partial/gap verdict or a destructive action. A card, badge, or button that isn't reporting one of those states stays near-black/well/fog.

## Typography

**Display/Body Font:** Geist Sans (`var(--font-geist-sans)`), with system-ui fallback.
**Label/Readout Font:** Geist Mono (`var(--font-geist-mono)`).

**Character:** Geist Sans carries every sentence a human reads (headings, descriptions, rationale); Geist Mono is reserved for anything measured or branded — as if the numbers and labels came off an instrument rather than a copywriter.

### Hierarchy
- **Display** (600, `text-3xl` → `text-4xl` i.e. 1.875rem → 2.25rem, tight tracking): the page's single h1, a task sentence ("Check how well your resume fits the job.") rather than the product name — the wordmark carries branding in the nav instead.
- **Title** (500, 1rem / `leading-snug`): card titles ("Overall fit", "Requirement breakdown", "Job description"). The empty-state form card is titleless by design — it opens straight on the "Resume" field label, mirroring the redesign's flatter hero card.
- **Body** (400, 0.875rem–1rem): form labels, requirement text, rationale paragraphs.
- **Caption** (400, 0.875rem, Muted Slate): descriptions, timestamps, evidence quotes (rendered italic with a left rule).
- **Readout** (600, `text-5xl`/3rem, mono, tabular-nums): the one big number on screen — the overall fit percentage.
- **Label** (500, `text-xs`/0.75rem, mono, slight tracking): verdict badges, table score badges, the nav wordmark.

### Named Rules
**The Instrument-Numerals Rule.** Any number the user is meant to read as a measurement (the fit score, per-row scores, verdict counts) renders in mono with `tabular-nums`. Prose never does.

## Layout

The app shell is a persistent-sidebar layout, not a single centered column: on desktop (`md:` and up) a collapsible History rail sits flush against the left viewport edge, full height, with the nav bar and page content filling the remaining width. Below `md`, the rail becomes an off-canvas overlay drawer (see Components → Sidebar) reached via a trigger in the nav; the page itself reverts to a plain vertical stack.

Inside the content column, pages are full-bleed, not a fixed-width block: `px-6` → `px-14` at `md:` (mirroring the Claude Design mockup's own 56px canvas gutter) with generous vertical rhythm (`py-12` → `py-16` at `md:`, `gap-6`–`gap-10` between blocks), and no `max-w-*` cap — the content fills whatever room the sidebar leaves. (Earlier versions of this doc capped content at `max-w-4xl`; the Aug 2026 redesign dropped that in favor of matching the mockup's fill ratio at real viewport widths — a hard cap left large dead margins on wide monitors that the mockup, drawn full-bleed, never had.) The one two-column moment is the empty-state hero (`md:flex-row`, `items-center`): the task headline and subcopy sit to the left in a fixed `md:w-2/5` column (40%, not content-sized — it stays proportional to the row rather than shrinking to fit the text), the Resume/JD form card fills the rest (`flex-1`, ~60%) — the two fields inside that card stack vertically now (single column), since the side-by-side moment moved up a level to headline-vs-form. Everything else — the checking screen, the score card, the requirement list — stays single-column so it reads top-to-bottom like a report, full width of the content column. Breakpoint behavior is mobile-first with a single `md:` (768px) step-up, stacking the hero into headline-above-form.

### Named Rules
**The Checking Screen.** Submitting the form replaces the hero (headline + form card) with a full-width, vertically-centered takeover: a thin top progress rail plus a 4-step checklist ("Parsing resume" → "Extracting requirements" → "Retrieving evidence" → "Scoring overall fit"). The steps advance on a fixed cosmetic timer, not real backend events — `/api/fit-check` is a single request/response with no intermediate progress to report — so treat the step count as a perceived-progress device, not telemetry. It disappears the moment the request settles, into either the report or an error.

## Elevation & Depth

Flat by construction — there are no `box-shadow` rules anywhere in the component set. Depth comes from tonal layering (Panel sits one step lighter than Deep Space) plus a `ring-1 ring-foreground/10` hairline on cards and dialogs, not from shadow. Focus states use a ring (`ring-3 ring-ring/50`), never a glow-via-shadow.

### Named Rules
**The Flat-By-Default Rule.** Depth is tonal contrast and a hairline ring, never a drop shadow. If a component needs to look "raised," lighten its surface one tone and add the ring — don't reach for `box-shadow`.

## Shapes

Interactive controls (buttons, inputs, textareas) use a 12px radius (`rounded-lg` / `--radius-lg`). Containers (cards, dialogs) use a softer, larger ~16.8px radius (`rounded-xl` / `--radius-xl`) so surfaces read slightly softer than the controls sitting on them. Badges/pills are fully rounded regardless of content length. No borders on cards (the ring substitutes for a border); inputs and buttons keep a 1px hairline border.

## Components

### Buttons
- **Shape:** 12px radius (`rounded-lg`).
- **Primary:** Signal Emerald fill, near-black-emerald text (`#06140d`), `hover:bg-primary/80`. Used for the single primary action per screen (e.g. "Check fit").
- **Outline / Ghost:** transparent/near-background fill, hairline border (outline only), hover fills to Slate Well. Used for secondary actions (sign-in, cancel, delete-row).
- **Destructive:** Alert Red at 10% opacity fill with Alert Red text (not a solid red fill) — a quieter destructive treatment that still reads as dangerous without shouting.
- **Active/Focus:** active state nudges the button down 1px (`translate-y-px`); focus adds a 3px ring at 50% opacity in the current variant's color.

### Badges (verdict pills)
- **Style:** `outline` variant — transparent background, hairline border, mono label — with an icon and text tinted per verdict (`CircleCheck` green / `CircleAlert` amber / `CircleX` red). This is the system's primary data-encoding component: it's how every verdict in the report and history table gets read at a glance.

### Cards / Containers
- **Corner Style:** ~16.8px (`rounded-xl`).
- **Background:** Panel, no border — separated from the page only by tone and the hairline ring.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Footer:** the `CardFooter` primitive (hairline top border + Well background at 50% opacity) still exists in `ui/card.tsx` but nothing currently uses it — the form card's submit button now lives inline in `CardContent`, flush with the rest of the stack, matching the redesign's flatter card (no divider line above the button).

### Inputs / Textareas
- **Style:** transparent fill, hairline border, 12px radius, mono text (`font-mono text-sm`) — the two resume/JD paste fields are the one place body input intentionally borrows the "instrument" mono voice instead of sans.
- **Focus:** border shifts to the ring color plus a 3px ring at 50% opacity, no glow/shadow.
- **Error:** border and ring shift to Alert Red at reduced opacity (`aria-invalid`).
- **Resume field, signed-in only:** the `Label` row grows a small right-aligned caption (`text-xs text-muted-foreground`, sans) — "Auto-filled from your last check" — whenever the field still holds the resume text that was auto-saved from the user's most recent check. It disappears the moment they edit away from that text. No separate save/manage UI exists; the resume that gets used on the next signed-in submission is whatever was typed, silently persisted as a side effect of submitting.

### Navigation
- **Style:** single top bar, hairline bottom border only (no background change from page), fixed `h-14` height regardless of content (see Named Rule below). A mobile-only sidebar-open trigger (`md:hidden`, `PanelLeft` icon) sits before the wordmark; the wordmark is in mono (`font-mono text-sm font-medium`); signed-in state shows Clerk's `UserButton`, signed-out state shows a plain-text "Sign in to save history" trigger. No shadow, no elevation — the nav is flush with the page. History browsing lives entirely in the sidebar now — there is no "History" nav link.

### Named Rules
**The Shared Header-Row Height Rule.** The main nav and the sidebar header sit side-by-side as flex siblings, so their bottom hairlines must land at the same pixel row. Both use a fixed `h-14` on the row itself rather than vertical padding (`py-*`) to size it — padding-based sizing lets each row's actual content (32px icon buttons in the sidebar header vs. plain text or a Clerk avatar in the nav) drive a different total height even with identical padding values, which is what broke the alignment before this rule existed. Any new header-style row that can appear adjacent to another one inherits this: fix the height, center content with `items-center`, don't let content decide it.

### Sidebar (history rail)
- **Character:** the system's one persistent-chrome component — present on every route, not a page.
- **Desktop:** an `<aside>` flush against the left edge, full height, hairline `border-r` only (no background tint, no shadow — same flat/bordered-chrome treatment as the nav). Collapses in-session between 288px (`w-72`) and a 56px (`w-14`) icon-only rail via a header toggle (`PanelLeftClose` / `PanelLeftOpen`); width animates, content swaps instantly rather than cross-fading. The header row is `h-14` (see Named Rule above), matching the main nav's height exactly.
- **Mobile (`<md`):** the identical list renders inside an off-canvas overlay `Drawer` (Base UI) instead — a backdrop dim plus a panel that slides in from the left edge (`slide-in-from-left`/`slide-out-to-left`, 200ms), opened by the nav's trigger via a detached `Drawer.Handle`. Same flat treatment: hairline border, no shadow.
- **Rows:** each past check is a title line — a user-set rename, falling back to a truncated JD-preview when unset (truncated either way, native `title` tooltip for the full line) — plus a score Badge and a short date, wrapped in a `Link` to its detail page; per-row rename (pencil) and delete icons fade in on hover/focus (`opacity-0` → `opacity-100`) as siblings of the `Link` rather than nested inside it. Renaming swaps the title `Link` for a plain bordered `<input>` inline in the row (no modal — a rename doesn't need one); Enter/blur saves, Escape or an empty submission reverts to the prior title without saving.
- **States:** signed-out shows a one-line sign-in prompt in place of the list; signed-in-empty shows "No history yet"; a header "Clear all" icon action appears only when there's history to clear.

## Do's and Don'ts

### Do:
- **Do** reserve saturated color (emerald/amber/red) for the primary action and verdict states — nothing else.
- **Do** render any measured number (scores, counts) in mono with `tabular-nums`.
- **Do** build depth with tonal layering + a `ring-foreground/10` hairline, never a `box-shadow`.
- **Do** keep the destructive button's fill translucent (Alert Red at 10-20% opacity), not a solid red block.
- **Do** use the `icon` button size (32px) for any tappable icon control, even in dense contexts like the sidebar — smaller sizes (`icon-xs`/`icon-sm`) read fine visually but fall below a comfortable touch target on the mobile drawer.

### Don't:
- **Don't** add drop shadows to cards, popovers, or buttons — it breaks the flat-instrument read established by every existing surface.
- **Don't** introduce a light-mode toggle without first reconciling the dormant `:root` light tokens — they exist in code but have never been visually verified since `<html>` forces `.dark` unconditionally.
- **Don't** fabricate real numbers into the checking screen (e.g. "requirement 7 of 12") — the step list is a cosmetic proxy for an atomic request, not a live progress feed; keep step labels generic.
- **Don't** reintroduce a kicker/eyebrow line above the h1 — it's a banned pattern in this system; let the heading carry its own weight.
- **Don't** apply the mono font to prose (headings, descriptions, rationale text) — mono is earned only by measured numbers, labels, the wordmark, and the paste inputs.
