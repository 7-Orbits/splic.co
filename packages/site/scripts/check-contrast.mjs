#!/usr/bin/env node
/**
 * Contrast checker for design tokens.
 *
 * Parses the `@theme` block in app/globals.css, resolves hex/rgba colours,
 * and asserts every required foreground/background pair meets WCAG 2.2 AA.
 * Exits non-zero when any pair fails so CI and local checks can gate on it.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(root, "app", "globals.css");

/** @type {Record<string, string>} */
const tokens = {};

const css = readFileSync(cssPath, "utf8");
const themeBlock = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
if (!themeBlock) {
  console.error("Could not find @theme block in app/globals.css");
  process.exit(1);
}

for (const line of themeBlock[1].split("\n")) {
  const match = line.match(/^\s*--([\w-]+):\s*(.+?);?\s*$/);
  if (!match) continue;
  tokens[match[1]] = match[2].trim().replace(/;$/, "");
}

/**
 * @param {string} input
 * @returns {[number, number, number, number]}
 */
function parseColor(input) {
  const value = input.trim();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      1,
    ];
  }

  const rgba = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i,
  );
  if (rgba) {
    let a = 1;
    if (rgba[4] !== undefined) {
      a = rgba[4].endsWith("%")
        ? Number.parseFloat(rgba[4]) / 100
        : Number.parseFloat(rgba[4]);
    }
    return [
      Number.parseFloat(rgba[1]),
      Number.parseFloat(rgba[2]),
      Number.parseFloat(rgba[3]),
      a,
    ];
  }

  throw new Error(`Unsupported colour value: ${input}`);
}

/**
 * Composite a possibly translucent colour over an opaque backdrop.
 * @param {[number, number, number, number]} fg
 * @param {[number, number, number, number]} bg
 */
function flatten(fg, bg) {
  const a = fg[3];
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
    1,
  ];
}

/** @param {[number, number, number, number]} color */
function relativeLuminance([r, g, b]) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * @param {[number, number, number, number]} fgRaw
 * @param {[number, number, number, number]} bgRaw
 */
function contrastRatio(fgRaw, bgRaw) {
  const fg = flatten(fgRaw, bgRaw);
  const bg = bgRaw;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Required pairs from the design system document.
 * minRatio follows WCAG AA: 4.5 for body text, 3 for large text and UI.
 * @type {Array<{ fg: string, bg: string, minRatio: number, label: string }>}
 */
const pairs = [
  /* Text on dark surfaces */
  { fg: "color-text-primary", bg: "color-surface-base", minRatio: 4.5, label: "Primary text on base" },
  { fg: "color-text-primary", bg: "color-surface-raised", minRatio: 4.5, label: "Primary text on raised" },
  { fg: "color-text-primary", bg: "color-surface-elevated", minRatio: 4.5, label: "Primary text on elevated" },
  { fg: "color-text-secondary", bg: "color-surface-base", minRatio: 4.5, label: "Secondary text on base" },
  { fg: "color-text-secondary", bg: "color-surface-raised", minRatio: 4.5, label: "Secondary text on raised" },
  { fg: "color-text-secondary", bg: "color-surface-interactive", minRatio: 4.5, label: "Secondary text on interactive (disabled btn)" },
  { fg: "color-text-tertiary", bg: "color-surface-base", minRatio: 4.5, label: "Tertiary text on base" },
  { fg: "color-text-tertiary", bg: "color-surface-raised", minRatio: 4.5, label: "Tertiary text on raised" },
  { fg: "color-text-link", bg: "color-surface-base", minRatio: 4.5, label: "Link text on base" },
  { fg: "color-text-link", bg: "color-surface-raised", minRatio: 4.5, label: "Link text on raised" },
  { fg: "color-text-link", bg: "color-surface-elevated", minRatio: 4.5, label: "Link text on elevated" },

  /* Inverse (primary button) */
  { fg: "color-text-inverse", bg: "color-surface-inverse", minRatio: 4.5, label: "Inverse text on inverse surface" },

  /* UI borders >= 3:1 (1.4.11) */
  { fg: "color-border-interactive", bg: "color-surface-base", minRatio: 3, label: "Interactive border on base" },
  { fg: "color-border-interactive", bg: "color-surface-raised", minRatio: 3, label: "Interactive border on raised" },
  { fg: "color-border-focus", bg: "color-surface-base", minRatio: 3, label: "Focus ring on base" },
  { fg: "color-border-focus", bg: "color-surface-raised", minRatio: 3, label: "Focus ring on raised" },

  /* Accents used as UI/text */
  { fg: "color-accent-primary", bg: "color-surface-base", minRatio: 3, label: "Accent primary on base" },
  { fg: "color-accent-primary", bg: "color-surface-raised", minRatio: 3, label: "Accent primary on raised" },
  { fg: "color-accent-primary-hover", bg: "color-surface-base", minRatio: 3, label: "Accent hover on base" },
  { fg: "color-accent-primary-active", bg: "color-surface-base", minRatio: 3, label: "Accent active on base" },
  { fg: "color-accent-secondary", bg: "color-surface-base", minRatio: 3, label: "Accent secondary on base" },
  { fg: "color-accent-secondary", bg: "color-surface-raised", minRatio: 3, label: "Accent secondary on raised" },

  /* Semantic status on dark surfaces */
  { fg: "color-accent-success", bg: "color-surface-base", minRatio: 3, label: "Success on base" },
  { fg: "color-accent-success", bg: "color-surface-raised", minRatio: 3, label: "Success on raised" },
  { fg: "color-accent-warning", bg: "color-surface-base", minRatio: 3, label: "Warning on base" },
  { fg: "color-accent-warning", bg: "color-surface-raised", minRatio: 3, label: "Warning on raised" },
  { fg: "color-accent-error", bg: "color-surface-base", minRatio: 3, label: "Error on base" },
  { fg: "color-accent-error", bg: "color-surface-raised", minRatio: 3, label: "Error on raised" },
];

let failed = 0;
let checked = 0;

for (const pair of pairs) {
  const fgToken = tokens[pair.fg];
  const bgToken = tokens[pair.bg];

  if (!fgToken || !bgToken) {
    console.error(
      `MISSING TOKEN  ${pair.label}: --${pair.fg}=${fgToken ?? "undefined"} --${pair.bg}=${bgToken ?? "undefined"}`,
    );
    failed += 1;
    continue;
  }

  try {
    const ratio = contrastRatio(parseColor(fgToken), parseColor(bgToken));
    checked += 1;
    const pass = ratio >= pair.minRatio;
    if (!pass) failed += 1;
    const status = pass ? "PASS" : "FAIL";
    console.log(
      `${status.padEnd(4)}  ${ratio.toFixed(2).padStart(6)}:1 (min ${pair.minRatio})  ${pair.label}`,
    );
  } catch (error) {
    console.error(`ERROR ${pair.label}: ${error.message}`);
    failed += 1;
  }
}

console.log(`\n${checked} pairs checked, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
