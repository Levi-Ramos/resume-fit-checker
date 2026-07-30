---
name: Resume Fit Checker
description: Grounded, citation-backed resume-to-job-description fit checking with Gemini.
colors:
  background: "#0a0d14"
  panel: "#12161f"
  well: "#161b26"
  border: "#1f2632"
  fog: "#e8edf4"
  muted-slate: "#93a0b4"
  primary: "#4ade80"
  primary-ink: "#06170e"
  accent: "#22d3ee"
  accent-ink: "#06232a"
  alert-red: "#f87171"
  amber-partial: "#e0af68"
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

# Design System: Resume Fit Checker

## Overview

**Creative North Star: "The Diagnostic Readout"**

Resume Fit Checker reads like an instrument panel, not a marketing page: a near-black navy canvas, monospace numerals for anything measured, and exactly two saturated colors — signal green and cyan — spent with intent rather than sprinkled for decoration. The system exists to deliver a verdict the user can trust (match / partial / gap, each with a citation), so the interface stays clinical and calm where it reports data, and reserves warmth for the moment it delivers good news.

Color is quiet and restrained by design: the panel/well/border layers of navy do almost all the visual work, and saturated color is spent only on the primary action and the three verdict states (green = match, amber = partial, red = gap). Nothing else on screen competes with those signals for attention.

The codebase also defines a light palette (`:root`, un-namespaced), but `<html>` hardcodes `className="dark"` unconditionally — there is currently no code path that renders it. This document treats the `.dark` palette as the sole canonical, shipped visual system; the light tokens are dormant and should not be trusted as a secondary theme until something actually toggles them.

**Key Characteristics:**
- Forced dark, near-black navy base — not a "dark mode option," the only mode.
- Monospace reserved for measured/technical content (scores, badges, the nav wordmark, form inputs, the primary CTA); sans-serif carries all prose.
- Flat by construction: depth comes from tonal layering and hairline rings, never drop shadows.
- Two saturated brand colors (signal green, signal cyan) plus three status colors that double as the verdict vocabulary.

## Colors

The palette is almost monochrome navy at rest; color appears only to mean something.

### Primary
- **Signal Green** (`#4ade80`): the primary action color — the "Check fit" button, focus rings, the nav accent — and, not coincidentally, the same value as the "match" verdict. Green means both "go" and "good."

### Secondary
- **Signal Cyan** (`#22d3ee`): the one decorative flourish — the hero's aurora glow. It never appears on an interactive control; it marks the page as a technical surface, not a status.

### Neutral
- **Deep Space Navy** (`#0a0d14`): page background.
- **Panel Navy** (`#12161f`): card, popover, and modal surfaces — one step lighter than the page so containers read as raised without a shadow.
- **Slate Well** (`#161b26`): secondary/muted surface — secondary buttons, muted chips, disabled input fill.
- **Hairline Slate** (`#1f2632`): all borders and input strokes.
- **Fog White** (`#e8edf4`): primary text.
- **Muted Slate** (`#93a0b4`): secondary/caption text (descriptions, timestamps, rationale copy).

### Status (the verdict vocabulary)
- **Signal Green** (`#4ade80` — same token as Primary): "match."
- **Amber Partial** (`#e0af68`): "partial" — the one hue that exists solely for this state; don't reuse it elsewhere.
- **Alert Red** (`#f87171` — same token as Destructive): "gap" / destructive action / form error.

### Named Rules
**The Verdict-Only Color Rule.** Outside the primary CTA and the header's aurora flourish, saturated color appears only to report a match/partial/gap verdict or a destructive action. A card, badge, or button that isn't reporting one of those states stays navy/slate/fog.

## Typography

**Display/Body Font:** Geist Sans (`var(--font-geist-sans)`), with system-ui fallback.
**Label/Readout Font:** Geist Mono (`var(--font-geist-mono)`).

**Character:** Geist Sans carries every sentence a human reads (headings, descriptions, rationale); Geist Mono is reserved for anything measured or branded — as if the numbers and labels came off an instrument rather than a copywriter.

### Hierarchy
- **Display** (600, `text-3xl` → `text-4xl` i.e. 1.875rem → 2.25rem, tight tracking): the page's single h1 ("Resume Fit Checker").
- **Title** (500, 1rem / `leading-snug`): card titles ("Check a fit", "Overall fit", "Requirement breakdown").
- **Body** (400, 0.875rem–1rem): form labels, requirement text, rationale paragraphs.
- **Caption** (400, 0.875rem, Muted Slate): descriptions, timestamps, evidence quotes (rendered italic with a left rule).
- **Readout** (600, `text-5xl`/3rem, mono, tabular-nums): the one big number on screen — the overall fit percentage.
- **Label** (500, `text-xs`/0.75rem, mono, slight tracking): verdict badges, table score badges, the nav wordmark.

### Named Rules
**The Instrument-Numerals Rule.** Any number the user is meant to read as a measurement (the fit score, per-row scores, verdict counts) renders in mono with `tabular-nums`. Prose never does.

## Layout

The app shell is a persistent-sidebar layout, not a single centered column: on desktop (`md:` and up) a collapsible History rail sits flush against the left viewport edge, full height, with the nav bar and page content filling the remaining width. Below `md`, the rail becomes an off-canvas overlay drawer (see Components → Sidebar) reached via a trigger in the nav; the page itself reverts to a plain vertical stack.

Inside the content column, pages stay single-column, content-first: a `max-w-4xl` block centered with `px-6` and generous vertical rhythm (`py-12` → `py-16` at `md:`, `gap-6`–`gap-10` between blocks). The one two-column moment is the input form (resume vs. job description textareas, `grid-cols-1` → `md:grid-cols-2`); everything else — the score card, the requirement list — stays single-column so it reads top-to-bottom like a report. Breakpoint behavior is mobile-first with a single `md:` (768px) step-up; there is no desktop-specific widening beyond the `max-w-4xl` cap on content.

## Elevation & Depth

Flat by construction — there are no `box-shadow` rules anywhere in the component set. Depth comes from tonal layering (Panel Navy sits one step lighter than Deep Space Navy) plus a `ring-1 ring-foreground/10` hairline on cards and dialogs, not from shadow. Focus states use a ring (`ring-3 ring-ring/50`), never a glow-via-shadow.

### Named Rules
**The Flat-By-Default Rule.** Depth is tonal contrast and a hairline ring, never a drop shadow. If a component needs to look "raised," lighten its surface one tone and add the ring — don't reach for `box-shadow`.

## Shapes

Interactive controls (buttons, inputs, textareas) use a 12px radius (`rounded-lg` / `--radius-lg`). Containers (cards, dialogs) use a softer, larger ~16.8px radius (`rounded-xl` / `--radius-xl`) so surfaces read slightly softer than the controls sitting on them. Badges/pills are fully rounded regardless of content length. No borders on cards (the ring substitutes for a border); inputs and buttons keep a 1px hairline border.

## Components

### Buttons
- **Shape:** 12px radius (`rounded-lg`).
- **Primary:** Signal Green fill, near-black-green text (`#06170e`), `hover:bg-primary/80`. Used for the single primary action per screen (e.g. "Check fit").
- **Outline / Ghost:** transparent/near-background fill, hairline border (outline only), hover fills to Slate Well. Used for secondary actions (sign-in, cancel, delete-row).
- **Destructive:** Alert Red at 10% opacity fill with Alert Red text (not a solid red fill) — a quieter destructive treatment that still reads as dangerous without shouting.
- **Active/Focus:** active state nudges the button down 1px (`translate-y-px`); focus adds a 3px ring at 50% opacity in the current variant's color.

### Badges (verdict pills)
- **Style:** `outline` variant — transparent background, hairline border, mono label — with an icon and text tinted per verdict (`CircleCheck` green / `CircleAlert` amber / `CircleX` red). This is the system's primary data-encoding component: it's how every verdict in the report and history table gets read at a glance.

### Cards / Containers
- **Corner Style:** ~16.8px (`rounded-xl`).
- **Background:** Panel Navy, no border — separated from the page only by tone and the hairline ring.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Footer:** when present, a hairline top border plus Slate Well background at 50% opacity, rounded to match the card's bottom corners.

### Inputs / Textareas
- **Style:** transparent fill, hairline border, 12px radius, mono text (`font-mono text-sm`) — the two resume/JD paste fields are the one place body input intentionally borrows the "instrument" mono voice instead of sans.
- **Focus:** border shifts to the ring color plus a 3px ring at 50% opacity, no glow/shadow.
- **Error:** border and ring shift to Alert Red at reduced opacity (`aria-invalid`).

### Navigation
- **Style:** single top bar, hairline bottom border only (no background change from page). A mobile-only sidebar-open trigger (`md:hidden`, `PanelLeft` icon) sits before the wordmark; the wordmark is in mono (`font-mono text-sm font-medium`); signed-in state shows Clerk's `UserButton`, signed-out state shows a plain-text "Sign in to save history" trigger. No shadow, no elevation — the nav is flush with the page. History browsing lives entirely in the sidebar now — there is no "History" nav link. The `UserButton` carries one custom menu item, `UserButton.Link` — "My resume" (`FileText` icon) — routing to `/profile`, alongside Clerk's default "Manage account" and "Sign out."

### Sidebar (history rail)
- **Character:** the system's one persistent-chrome component — present on every route, not a page.
- **Desktop:** an `<aside>` flush against the left edge, full height, hairline `border-r` only (no background tint, no shadow — same flat/bordered-chrome treatment as the nav). Collapses in-session between 288px (`w-72`) and a 56px (`w-14`) icon-only rail via a header toggle (`PanelLeftClose` / `PanelLeftOpen`); width animates, content swaps instantly rather than cross-fading.
- **Mobile (`<md`):** the identical list renders inside an off-canvas overlay `Drawer` (Base UI) instead — a backdrop dim plus a panel that slides in from the left edge (`slide-in-from-left`/`slide-out-to-left`, 200ms), opened by the nav's trigger via a detached `Drawer.Handle`. Same flat treatment: hairline border, no shadow.
- **Rows:** each past check is a JD-preview line (truncated, native `title` tooltip for the full line) plus a score Badge and a short date, wrapped in a `Link` to its detail page; a per-row delete icon fades in on hover/focus (`opacity-0` → `opacity-100`), sitting as a sibling of the `Link` rather than nested inside it.
- **States:** signed-out shows a one-line sign-in prompt in place of the list; signed-in-empty shows "No history yet"; a header "Clear all" icon action appears only when there's history to clear.

### Profile Page (`/profile`)

A single-column detail page reached from the `UserButton` menu, following the same "Back" link + un-cardded page shell as the History detail page (`ArrowLeft` + "Back" text link above the content, no page heading). One Card ("Your resume") holds a mono textarea (matching the home page's Resume field treatment exactly — `field-sizing-fixed`, `resize-none`, `font-mono text-sm`) plus a footer with Clear (`destructive` button variant — the one place this variant is used, since it's a standalone labeled action rather than a hover-revealed row icon like the sidebar's delete buttons) and Save (primary, mono, disabled until the text differs from what's saved). The card description reports the last-saved timestamp or, when empty, an explanatory prompt. On the home page, the Resume field's `Label` row grows a small right-aligned caption (`text-xs text-muted-foreground`, sans, matching sidebar timestamp styling) for signed-in users only: "Loaded from your profile" (with an underlined link to `/profile`) when the field still matches the saved copy, or "Save to profile" when nothing is saved yet — both disappear once the user edits away from the loaded text.

### Signature Component: The Aurora Backdrop

### Signature Component: The Aurora Backdrop
A soft, blurred radial-gradient glow (cyan + green, `blur(90px)`, ~45% opacity) drifting slowly behind the hero heading only — the one purely decorative, non-data element in the system. It respects `prefers-reduced-motion` (animation disabled). Reserve this for the single hero moment; it is not a general-purpose background treatment.

## Do's and Don'ts

### Do:
- **Do** reserve saturated color (green/cyan/amber/red) for the primary action, the aurora hero flourish, and verdict states — nothing else.
- **Do** render any measured number (scores, counts) in mono with `tabular-nums`.
- **Do** build depth with tonal layering + a `ring-foreground/10` hairline, never a `box-shadow`.
- **Do** keep the destructive button's fill translucent (Alert Red at 10-20% opacity), not a solid red block.
- **Do** use the `icon` button size (32px) for any tappable icon control, even in dense contexts like the sidebar — smaller sizes (`icon-xs`/`icon-sm`) read fine visually but fall below a comfortable touch target on the mobile drawer.

### Don't:
- **Don't** add drop shadows to cards, popovers, or buttons — it breaks the flat-instrument read established by every existing surface.
- **Don't** introduce a light-mode toggle without first reconciling the dormant `:root` light tokens — they exist in code but have never been visually verified since `<html>` forces `.dark` unconditionally.
- **Don't** use Signal Cyan on an interactive control or verdict badge — it's reserved for the single hero decoration, not for buttons, links, or status.
- **Don't** reintroduce a kicker/eyebrow line above the h1 — it's a banned pattern in this system; let the heading carry its own weight.
- **Don't** apply the mono font to prose (headings, descriptions, rationale text) — mono is earned only by measured numbers, labels, the wordmark, and the paste inputs.
