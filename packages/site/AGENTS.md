# Splic.co — You bring the vision. Splic does the editing.

## Mission
Create implementation-ready, token-driven UI guidance for Splic.co — You bring the vision. Splic does the editing. that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Splic.co — You bring the vision. Splic does the editing.
- URL: https://splic-lemon.vercel.app/
- Audience: video editors, AI-agent tinkerers, and creators who want transparent local/cloud control
- Product surface: marketing site

## Style Foundations
Source of truth: `packages/site/app/globals.css` `@theme` (Splic Marketing Website Design System).

- Visual style: structured, tokenized, content-first dark system; violet is an accent, not the primary button color
- Main font style: Inter Variable (`--font-inter` via `next/font/google`), base 16px, weight 400, line-height 1.65; Geist Mono (`--font-geist-mono`) retained for workspace-mock chrome
- Typography scale: `xs=11px`, `sm=12px`, `md=14px`, `base=16px`, `lg=18px`, `xl=20px`, `2xl=24px`, `3xl=30px`, `4xl=40px`, `5xl=52px`, `6xl=64px`, `hero=clamp(42px, 6vw, 76px)`; heading roles `page=clamp(40px,5vw,52px)`, `section=clamp(30px,3.2vw,40px)`
- Color palette: `text.primary=#F7F8F8` (Linear), `text.secondary=#8A8F98` (Linear), `text.tertiary=#7E828C` (lightened from doc `#797D87` to clear 4.5:1 on raised), `text.inverse=#101115`, `text.link=#C3B8FF`; `surface.base=#08090A` (Linear), `surface.primary=#0C0D10`, `surface.raised=#121419`, `surface.elevated=#181B21`, `surface.interactive=#20242B`, `surface.inverse=#F2F2EF`; `accent.primary=#B9A7FF` (hover `#C9BCFF`, active `#A38BEF`), `accent.secondary=#8CBFCB`, `accent.success=#80C9A0`, `accent.warning=#E7BC78`, `accent.error=#F08A8A`; `border.subtle=#202329`, `border.default=#30343D`, `border.strong=#454A55`, `border.focus=#B9A7FF`, `border.interactive=#6A7080` (derived, >=3:1)
- Spacing scale: Tailwind default spacing; section rhythm 56/80/112px (`py-14 md:py-20 lg:py-28`), page padding 20/28/40px via `.container-page`, navbar height 72px
- Radius tokens: `xs=4px`, `sm=6px`, `md=8px`, `lg=12px`, `xl=16px`, `2xl=20px`, `pill=999px`
- Shadow tokens: `subtle`, `surface`, `product`, `focus`
- Motion: durations 100/150/220/350ms, easing `cubic-bezier(0.2, 0, 0, 1)`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required (2px `#B9A7FF`, 2px offset).
- Contrast constraints required (`pnpm check:contrast` gates 28 pairs).

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.
- Interactive controls (secondary buttons, selectable tiles) must use `border-interactive`.
- Navbar follows the Linear composition: logo left; Features, Plugins, Pricing, How it works, Contact; right side Console + one Download pill (compact `btn-sm` pill). Console links to the in-repo Console preview at `/console`; `NEXT_PUBLIC_CONSOLE_URL` can override it for a hosted Console. Contact routes to the real `/contact` page.
- Homepage hero stays left-aligned to `.container-page` (Linear reference): exact two-line headline, muted support copy, restrained CTAs, full-width product preview.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.
- Do not render unconfirmed pricing/entitlement drafts; show "Announced at launch".
- Do not present the Console preview as a live account surface. `/console` uses clearly labelled sample data, has no authentication or backend, and must remain `noindex`. Replace the sample data module only when a real, server-authorised account API exists.
- Do not add a second Download CTA to the navbar or center the hero headline.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (22), buttons (11), cards (10), navigation (1), lists (1).

## Console Preview (`/console`)

- Lives in `app/(console)/console/` with its own shell; marketing chrome lives in `app/(site)/`.
- Reuses the same tokens, Inter stack, Button, StatusBadge and glass surfaces as the marketing site.
- Sample account data is isolated in `lib/console/preview-data.ts` and always accompanied by the preview banner / `Sample` labels.
- Sidebar order: Overview, Plugins, Usage & Limits, Cloud Storage, Billing & Plans, Orders & Purchases, Security, Settings, Help & Support.
- No real auth, checkout, invoices, uploads, downloads, session revocation, profile persistence or account deletion. Unsupported controls must be disabled with an honest reason, never fake success.
- Keep `/console` out of `sitemap.ts` and disallowed in `robots.ts`.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
