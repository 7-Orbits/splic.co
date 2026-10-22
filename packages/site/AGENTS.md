# Splic.co — You bring the vision. Splic does the editing.

## Mission
Create implementation-ready, token-driven UI guidance for Splic.co — You bring the vision. Splic does the editing. that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Splic.co — You bring the vision. Splic does the editing.
- URL: https://splic-lemon.vercel.app/
- Audience: online shoppers and consumers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Arial`, `font.family.stack=Arial, Helvetica, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=11px`, `font.size.md=12px`, `font.size.lg=13px`, `font.size.xl=14px`, `font.size.2xl=15px`, `font.size.3xl=16px`, `font.size.4xl=18px`
- Color palette: `color.text.primary=#f2f2f0`, `color.text.secondary=#8d8d8d`, `color.text.tertiary=#888888`, `color.text.inverse=#b8b8b8`, `color.surface.base=#000000`, `color.surface.muted=#0a0a0a`, `color.surface.raised=#eeeeee`, `color.surface.strong=#111111`
- Spacing scale: `space.1=3px`, `space.2=4px`, `space.3=9px`, `space.4=10px`, `space.5=11px`, `space.6=12px`, `space.7=13px`, `space.8=14px`
- Radius/shadow/motion tokens: `radius.xs=50px` | `motion.duration.instant=200ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

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


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
