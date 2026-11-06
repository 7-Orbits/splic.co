---
name: design-system-linear-the-system-for-product-development
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Linear – The system for product development

## Mission
Deliver implementation-ready design-system guidance for Linear – The system for product development that can be applied consistently across marketing site interfaces.

## Brand
- Product/brand: Linear – The system for product development
- URL: https://linear.app/?utm_source=chatgpt.com
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Inter Variable`, `font.family.stack=Inter Variable, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=13px`, `font.size.md=13.33px`, `font.size.lg=14px`, `font.size.xl=15px`, `font.size.2xl=16px`, `font.size.3xl=20px`, `font.size.4xl=24px`
- Color palette: `color.text.primary=#f7f8f8`, `color.text.secondary=#8a8f98`, `color.border.muted=#ffffff`, `color.text.inverse=#d0d6e0`, `color.focus.ring=#000000`, `color.surface.muted=#0f1011`, `color.surface.strong=#08090a`
- Spacing scale: `space.1=1px`, `space.2=3px`, `space.3=4px`, `space.4=6px`, `space.5=7px`, `space.6=8px`, `space.7=10px`, `space.8=11px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=6px`, `radius.md=8px`, `radius.lg=9px`, `radius.xl=16px`, `radius.2xl=50px`, `radius.step7=9999px` | `shadow.1=rgba(0, 0, 0, 0.2) 0px 0px 0px 1px`, `shadow.2=rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset`, `shadow.3=rgba(0, 0, 0, 0) 0px 8px 2px 0px, rgba(0, 0, 0, 0.01) 0px 5px 2px 0px, rgba(0, 0, 0, 0.04) 0px 3px 2px 0px, rgba(0, 0, 0, 0.07) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 1px 0px`, `shadow.4=rgba(255, 255, 255, 0.03) 0px 0px 0px 1px inset, rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.6) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 4px 4px 0px` | `motion.duration.instant=100ms`, `motion.duration.fast=160ms`, `motion.duration.normal=200ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
