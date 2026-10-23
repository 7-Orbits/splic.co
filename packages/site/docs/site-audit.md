# Site Audit — splic.co marketing website

Recorded during the 2026-10 redesign planning pass. Source of truth for the
redesign implementation. Nothing outside `packages/site` was modified.

## Stack

| Item | Value |
|---|---|
| Framework | Next.js 16.4.0, App Router |
| React | 19.3.0 |
| Language | TypeScript 5.9.3 (`strict`, no `noEmit` script before redesign) |
| CSS | Tailwind CSS 4.3.3, CSS-first `@theme` (no `tailwind.config.*`), `@tailwindcss/turbopack` loader |
| Lint | ESLint 9, `eslint-config-next` 16.4.0 (`eslint.config.mjs`) |
| Package manager | pnpm 11.20.0, site-local lockfile (`packages/site/pnpm-lock.yaml`) |
| Monorepo note | No root `pnpm-workspace.yaml`; each package has its own lockfile/node_modules. Run all site commands from `packages/site`. |

### Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` (added in redesign) |
| `pnpm check:contrast` | Token contrast checker (added in redesign) |

## Route inventory (before redesign)

- `/` — single marketing page, anchor sections: `#top`, `#main`, `#features`,
  `#how-it-works`, `#built-differently`, `#pricing`, `#faq`, `#download`.
- Implicit Next fallbacks only (`_not-found`). No `app/api/`, no auth, console,
  checkout, docs, privacy, terms or support routes.

## Token inventory (before redesign)

All in `app/globals.css` `@theme`:
`--color-text-primary #f2f2f0`, `--color-text-secondary #8d8d8d`,
`--color-text-tertiary #888888`, `--color-text-inverse #b8b8b8`,
`--color-surface-base #000000`, `--color-surface-muted #0a0a0a`,
`--color-surface-raised #eeeeee`, `--color-surface-strong #111111`,
`--color-line` / `--color-line-strong` (color-mix), `--font-sans` (Arial stack),
`--font-mono`, text scale `--text-xs` 10px → `--text-4xl` 18px,
spacing `--spacing-1` 3px → `--spacing-8` 14px, `--radius-xs: 50px`.
`color-scheme: dark` already set. Replaced by redesign token set (plan §5).

### Contrast results (redesign token set)

`pnpm check:contrast` — 17 pairs checked, 0 failed. One adjustment vs the
plan draft: `--color-border-strong` raised from `rgba(244,243,240,0.20)`
(1.69:1 on canvas, below the 3:1 UI minimum) to `rgba(244,243,240,0.40)`
(3.50:1 on canvas, 3.57:1 on surface). All other pairs pass unchanged; the
lowest text pair is tertiary-on-surface at 4.53:1.

## Asset inventory (before redesign)

| Asset | Path | Disposition |
|---|---|---|
| Logo (PNG) | `public/splic.png`, repo-root `public/splic.png` | Kept |
| Logo mark (PNG) | `public/splic-mark.png` (used by `components/wordmark.tsx`) | Kept |
| Favicon | `app/icon.png` | Kept |
| Boilerplate SVGs | `public/{next,vercel,globe,file,window}.svg` | **Deleted** (unused create-next-app leftovers) |
| Fonts | none (Arial system stack) | Replaced with `geist` package (self-hosted Geist + Geist Mono via `next/font/local`) |

## Dead or misleading links (before redesign)

- Footer Privacy / Terms rendered as disabled "Coming soon" spans — no pages;
  redesign omits them until pages exist (plan §7).
- Footer Resources linked `NEXT_PUBLIC_DOCS_URL` (unset → no link) — column
  omitted entirely in redesign because no resource pages exist.
- Header/nav and section CTAs were anchor links (`#pricing`, `#download`) with
  no real destination; download CTA fell back to `#download` when
  `NEXT_PUBLIC_DOWNLOAD_URL` unset. Redesign routes everything to real pages.
- GitHub links only to `https://github.com/7-Orbits` / repo — real, kept.

## Environment variables

Defined in `packages/site/.env.example` (all optional, all unset in root `.env`):
`NEXT_PUBLIC_DOWNLOAD_URL`, `NEXT_PUBLIC_WAITLIST_URL`,
`NEXT_PUBLIC_DOCS_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`. Consumed by
`lib/site-config.ts`. Root `.env`/`.env.example` are empty; `DATABASE_URL` is
referenced only by `platform/drizzle/drizzle.config.ts` (out of scope).

## Backend / integration reality

Verified across the monorepo: `packages/gateway/src/index.ts` is empty,
`platform/drizzle/src/schema.ts` is empty, docker-compose/infra/CI files are
0-byte placeholders, `packages/desktop` is an unmodified Tauri 2 starter
(v0.1.0, greet command only). **No auth, Console, checkout, waitlist backend,
release process, or plugin catalogue exists.** Consequences encoded in the
redesign:

- `releaseStage: "early-access"`; no installer buttons anywhere.
- All pricing values `confirmed: false` → "Announced at launch".
- All plugins `verified: false` → "Planned workflows" cards.
- No Sign in / Console / Manage subscription links rendered (plan §14).
- Waitlist remains an env-driven outbound link (`NEXT_PUBLIC_WAITLIST_URL`),
  not a form.

## Open decisions (plan §21) — status vs. repo

| ID | Status | Note |
|---|---|---|
| D1 Release stage | Resolved for now: `early-access` | No releases or waitlist backend exist |
| D2 Storage model | Open | Quotas render "Announced at launch"; additive-copy withheld |
| D3 Recommended plan | Open | No plan highlighted |
| D4 Usage units | Open | Draft token numbers behind `confirmed: false` |
| D5 Plugin allowance | Open | Draft wording behind `confirmed: false` |
| D6 Plugin catalogue | Open | Planned-only: gaming, podcast, cinematic |
| D7 Plugin install | Open | No Access section published for planned plugins |
| D8 Data/privacy | Open | No encryption/sync/retention claims shipped |
| D9 Bundle | Open | Bundle omitted from pricing page |
| D10 App flow | Open | Sign-in step omitted from how-it-works; supported-actions lists kept generic |
| D11 Sales/notifications | Partially open | `Contact sales` only when `NEXT_PUBLIC_CONTACT_EMAIL` set |
| D12 Domain/legal | Partially open | Canonical `https://splic.co`; Privacy/Terms/Support/Docs pages omitted |
| D13 Platforms | Open | All three platforms `coming-soon`, no URLs/versions invented |
| D14 Reference images | **Not reviewed** | Images were unavailable to this pass; plan document treated as authoritative |

## Restyle pass (Splic Marketing Website Design System)

Second visual pass applying the design-system document on top of the redesign.
Routes, content config, and release-stage logic unchanged. Decisions:

- **Font: Geist kept.** Design system permits a configured existing family;
  `next/font/local` Geist Sans/Mono retained.
- **`border-interactive` token added** (`#6A7080`, 4.02:1 on base / 3.72:1 on
  raised). Doc `border.default #30343D` / `border.strong #454A55` remain
  decorative-only; interactive controls (secondary buttons, platform tiles,
  plugin cards, menu button) use `border-interactive` to hold 1.4.11 3:1.
- **`text.tertiary` lightened** `#797D87` → `#7E828C`: doc value measured
  4.47:1 on `surface.raised` (AA text needs 4.5); new value passes.
- Primary buttons now `surface.inverse #F2F2EF` fill / `text.inverse` label;
  violet demoted to links, focus rings, active nav underline, accents.
- Token renames applied repo-wide (e.g. `bg-bg-canvas` → `bg-surface-base`,
  `bg-bg-surface` → `bg-surface-raised`, `bg-bg-inset` → `bg-surface-primary`,
  `bg-bg-surface-2` → `bg-surface-elevated`, `status-*` → `accent-*`,
  `rounded-control/panel/frame` → `sm/lg/xl`, `shadow-frame` → `shadow-product`,
  `text-meta/supporting` → `text-md`, `text-subheading` → `text-2xl`).
- Layout: navbar 64→72px (mobile sheet `top-[72px]`), section rhythm
  56/80/112px, `.container-page` padding 20/28/40px, hero top padding reduced
  (64/96px) so the preview enters the first viewport.
- `StatusBadge` gained an `info` tone (`accent-secondary` blue); plugin
  `premium` status remapped `warn` → `info`.
- Unconfirmed plan entitlements now render "Announced at launch" in
  `PlanCard` and `ComparisonTable` (draft values stay in `content/pricing.ts`).
- Contrast gate: `scripts/check-contrast.mjs` retokenized; 28 pairs, 0 failed
  (text 4.5:1, UI/borders 3:1).

## Linear / Screen Studio / Rive redesign pass

Third pass (2026-10): Linear-inspired navbar + hero, Screen Studio-style
sticky workflow showcase, Rive-influenced plugin motifs. Decisions:

- **Navbar** follows Linear's composition: Features, Plugins, Pricing, How
  it works, **Contact** (new route) — right side **Console** + one
  **Download** pill. `NEXT_PUBLIC_CONSOLE_URL` added to `.env.example`;
  unset renders a non-interactive "Console · soon" label (no dead link, no
  invented route — no console/sign-in exists in the monorepo).
- **`/contact`** page added (honest "announced at launch" + GitHub repo;
  `mailto:` only when `NEXT_PUBLIC_CONTACT_EMAIL` set). Wired into navbar,
  footer Company column, sitemap.
- **Hero** is left-aligned to the same container boundary as navbar and
  preview (was centered); exact two-line headline, no eyebrow, no italic
  emphasis; primary CTA labeled "Download Splic" per brief (routes to the
  honest `/download` early-access page); stage-aware `ctaLabel` remains on
  the final CTA and `/download`.
- **Workspace mock** upgraded: coastal scene in the program monitor, clip
  thumbnail strips, transport glyph set, lock/mute track glyphs, timeline
  visible on all viewports (scrollable). `WorkspaceMock` gained `stage`
  (`describe | interpret | act | review`) + `compact` (drops media pool in
  narrower containers); hero uses review stage with callouts.
- **WorkflowShowcase** replaces `WorkflowTabs` on the homepage: sticky
  preview (desktop ≥1024 `lg:`), IntersectionObserver stage changes,
  natural stacked list on mobile, no scroll hijacking. Sticky required two
  fixes: inner wrapper (sticky-on-grid-item constrained by grid area) and
  `min-h-60vh` steps (42vh left the container too short — mock unpinned
  mid-reading-zone). `/how-it-works` unchanged.
- **Plugins section**: per-plugin CSS motifs (gaming stepped frames,
  podcast waveform bars, cinematic letterbox/perforations) with
  `prefers-reduced-motion` disabling animations globally.
- Homepage order: Hero → WorkflowShowcase → Plugins → ValueComparison →
  LocalCloud → PricingTeaser → FAQ → FinalCta. ValueComparison de-centered;
  fixed dead `border-t-accent` class (missing token since restyle).
- **Fonts**: Geist kept. No new npm dependencies added (Chrome used as a
  system binary for screenshot QA only).
- QA: lint/typecheck/build/contrast green; 13 page routes + contact;
  screenshot QA at 1440/768/390 via headless Chrome + CDP scroll captures.

## Linear fidelity pass (2026-10)

Fourth pass tightening the marketing site against the Linear reference
(`DESIGN.md` → linear.app). Scope: navbar, hero, product showcase, tokens,
and Console wiring. Decisions:

- **Font: Geist Sans → Inter Variable.** `layout.tsx` loads `Inter`
  (`next/font/google`, `--font-inter`); `--font-sans` now uses the Linear
  stack (`Inter, "SF Pro Display", -apple-system, …`). Geist Mono stays as
  `--font-mono` for the workspace mock chrome. Build fetches the font at
  compile time (verified green).
- **Palette → Linear values**: `text.primary #F2F2EF → #F7F8F8`,
  `text.secondary #A5A7B0 → #8A8F98`, `surface.base #08090B → #08090A`.
  `text.tertiary #7E828C` and all accents unchanged. `check:contrast` re-run:
  28 pairs, 0 failed.
- **Buttons**: default radius `sm → md (8px)`; new `size="sm"` (`btn-sm`,
  32px, pill) used by the navbar Download CTA. Hero/section CTAs keep the
  `md`/`lg` rectangular shapes.
- **Navbar** tightened to Linear density (gap-6/8, gap-5/6 links, gap-4/5
  actions).
- **Hero**: copy column widened to 800px so the two-line headline holds on
  desktop (was wrapping to three lines at 1440px); tracking −0.032em; tighter
  copy→showcase spacing; metadata line drops to `text-sm`.
- **Showcase frame**: `AgentDemo` wraps `WorkspaceMock` in a Linear-style
  frame — stronger `border-default` edge, inset top highlight
  (`rgba(255,255,255,0.06)`), and an ambient violet glow behind the frame.
- **Console fixed**: `lib/site-config.ts` defaults `console` to the
  documented sign-in URL `https://app.splic.co/signin` (env
  `NEXT_PUBLIC_CONSOLE_URL` still overrides). `ConsoleAction` in
  `site-header.tsx` now always renders a real `<a>`; the "soon" placeholder
  is deleted. No auth flow exists in the monorepo, so this is an outbound
  link — the domain does not resolve yet (flagged, not blocking).
- QA: lint/typecheck/build/contrast green; screenshot QA at 1440/390 via
  headless Chrome.
