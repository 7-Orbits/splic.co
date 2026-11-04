//! Visual language for Splic Desktop: palette, typography and motion.
//!
//! Colours and radii mirror `packages/site/app/globals.css` (`@theme`) so the
//! desktop app and the website read as one product. The sign-in card adds a
//! single signature detail from the reference design: a thin coral hairline
//! border on a near-black surface.

mod assets;
mod fonts;

pub(crate) use assets::BrandAssets;

use egui::{Color32, FontFamily, FontId, Rgba, Stroke};

// ── surfaces ────────────────────────────────────────────────────────────────
/// Page background (`surface.base`).
pub(crate) const BG: Color32 = Color32::from_rgb(0x08, 0x09, 0x0A);
/// Card / panel surface (`surface.primary`).
pub(crate) const SURFACE: Color32 = Color32::from_rgb(0x0C, 0x0D, 0x10);
/// Raised surface: rows, chips, wells (`surface.raised`).
pub(crate) const SURFACE_RAISED: Color32 = Color32::from_rgb(0x12, 0x14, 0x19);
/// Elevated surface: popovers (`surface.elevated`).
pub(crate) const SURFACE_ELEVATED: Color32 = Color32::from_rgb(0x18, 0x1B, 0x21);

// ── text ────────────────────────────────────────────────────────────────────
pub(crate) const TEXT_PRIMARY: Color32 = Color32::from_rgb(0xF7, 0xF8, 0xF8);
pub(crate) const TEXT_SECONDARY: Color32 = Color32::from_rgb(0x8A, 0x8F, 0x98);
pub(crate) const TEXT_TERTIARY: Color32 = Color32::from_rgb(0x7E, 0x82, 0x8C);
/// Dark label printed on light buttons (`text.inverse`).
pub(crate) const TEXT_INVERSE: Color32 = Color32::from_rgb(0x10, 0x11, 0x15);

// ── accents ─────────────────────────────────────────────────────────────────
/// Coral/pink signature of the sign-in card; also the error colour.
pub(crate) const CORAL: Color32 = Color32::from_rgb(0xF0, 0x8A, 0x8A);
pub(crate) const SUCCESS: Color32 = Color32::from_rgb(0x80, 0xC9, 0xA0);
pub(crate) const WARNING: Color32 = Color32::from_rgb(0xE7, 0xBC, 0x78);

// ── borders ─────────────────────────────────────────────────────────────────
pub(crate) const BORDER_SUBTLE: Color32 = Color32::from_rgb(0x20, 0x23, 0x29);
pub(crate) const BORDER_DEFAULT: Color32 = Color32::from_rgb(0x30, 0x34, 0x3D);
/// Interactive edges, kept at >= 3:1 on dark surfaces (WCAG 2.2 AA 1.4.11).
pub(crate) const BORDER_INTERACTIVE: Color32 = Color32::from_rgb(0x6A, 0x70, 0x80);
/// The coral hairline around the sign-in card (CORAL at 62% coverage).
pub(crate) const CORAL_BORDER: Color32 =
    Color32::from_rgba_premultiplied(149, 86, 86, 158);

// ── controls (site `.btn-auth` / `.btn-primary`) ────────────────────────────
/// Translucent black glass used by the provider button at rest.
pub(crate) const GLASS: Color32 = Color32::from_rgba_premultiplied(0, 0, 0, 140);
/// 1px white border at 14% over black.
pub(crate) const GLASS_BORDER: Color32 =
    Color32::from_rgba_premultiplied(36, 36, 36, 36);
/// Off-white surface for primary buttons.
pub(crate) const LIGHT: Color32 = Color32::from_rgb(0xF2, 0xF2, 0xEF);
pub(crate) const LIGHT_HOVER: Color32 = Color32::from_rgb(0xE4, 0xE4, 0xDF);
/// Disabled glass surface / label.
pub(crate) const GLASS_DISABLED: Color32 =
    Color32::from_rgba_premultiplied(15, 15, 15, 154);
pub(crate) const TEXT_DISABLED: Color32 = Color32::from_rgb(0x9A, 0x9A, 0x9A);

// ── motion (site: 100/150/220/350ms) ────────────────────────────────────────
pub(crate) const MOTION_FAST: f32 = 0.15;
#[allow(dead_code)]
pub(crate) const MOTION_NORMAL: f32 = 0.22;
#[allow(dead_code)]
pub(crate) const MOTION_SLOW: f32 = 0.35;

// ── typography ──────────────────────────────────────────────────────────────

/// Font weight of the bundled Inter faces.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Weight {
    Regular,
    Medium,
    SemiBold,
}

impl Weight {
    /// The egui font family registered for this weight.
    fn family(self) -> FontFamily {
        match self {
            Self::Regular => FontFamily::Name(fonts::FAMILY_REGULAR.into()),
            Self::Medium => FontFamily::Name(fonts::FAMILY_MEDIUM.into()),
            Self::SemiBold => FontFamily::Name(fonts::FAMILY_SEMIBOLD.into()),
        }
    }
}

/// A [`FontId`] for the given weight and pixel size.
pub(crate) fn font(weight: Weight, size: f32) -> FontId {
    FontId::new(size, weight.family())
}

/// Blend two colours; `t` is clamped to `0..=1`.
///
/// Done in [`Rgba`] so the u8 rounding lives in `ecolor` instead of open-coded
/// float→integer casts here.
pub(crate) fn lerp_color(from: Color32, to: Color32, t: f32) -> Color32 {
    let t = t.clamp(0.0, 1.0);
    let (a, b) = (Rgba::from(from), Rgba::from(to));
    Color32::from(Rgba::from_rgba_premultiplied(
        a.r() + (b.r() - a.r()) * t,
        a.g() + (b.g() - a.g()) * t,
        a.b() + (b.b() - a.b()) * t,
        a.a() + (b.a() - a.a()) * t,
    ))
}

/// `color` with its alpha scaled by `factor` (0 keeps the hue, 1 is opaque).
pub(crate) fn fade(color: Color32, factor: f32) -> Color32 {
    let factor = factor.clamp(0.0, 1.0);
    let rgba = Rgba::from(color);
    Color32::from(Rgba::from_rgba_premultiplied(
        rgba.r() * factor,
        rgba.g() * factor,
        rgba.b() * factor,
        rgba.a() * factor,
    ))
}

/// Ease a float towards `target` over `seconds` — the single source of all
/// hover/entrance transitions so the whole UI moves at the same pace.
///
/// egui requests the follow-up repaints itself while the value is moving.
pub(crate) fn animate(ctx: &egui::Context, id: egui::Id, target: f32, seconds: f32) -> f32 {
    ctx.animate_value_with_time(id, target, seconds)
}

/// Install fonts, visuals and spacing. Called once before the first frame.
pub(crate) fn install(ctx: &egui::Context) {
    fonts::install(ctx);

    // The app is dark-only: pin the theme so the system preference cannot
    // swap the palette out from under the sign-in card.
    ctx.set_theme(egui::Theme::Dark);

    let mut style = (*ctx.style_of(egui::Theme::Dark)).clone();
    style.visuals = visuals();
    style.animation_time = MOTION_FAST;
    style.spacing.item_spacing = egui::vec2(8.0, 8.0);
    style.spacing.button_padding = egui::vec2(14.0, 8.0);
    style.spacing.window_margin = egui::Margin::symmetric(16, 12);
    style.spacing.extra_text_line_spacing = 1.0;
    style.text_styles = fonts::text_styles();
    ctx.set_style_of(egui::Theme::Dark, style);
}

fn visuals() -> egui::Visuals {
    let mut v = egui::Visuals::dark();
    v.dark_mode = true;
    v.override_text_color = Some(TEXT_PRIMARY);
    v.panel_fill = BG;
    v.window_fill = SURFACE;
    v.window_stroke = Stroke::new(1.0, BORDER_SUBTLE);
    v.window_corner_radius = egui::CornerRadius::same(12);
    v.menu_corner_radius = egui::CornerRadius::same(8);
    v.hyperlink_color = TEXT_PRIMARY;
    v.faint_bg_color = SURFACE_RAISED;
    v.extreme_bg_color = Color32::from_rgb(0x05, 0x06, 0x07);
    v.code_bg_color = SURFACE_RAISED;
    v.warn_fg_color = WARNING;
    v.error_fg_color = CORAL;
    v.button_frame = true;
    v.selection.bg_fill = CORAL;
    v.selection.stroke = Stroke::new(1.0, TEXT_PRIMARY);

    let stroke = |color: Color32, width: f32| Stroke::new(width, color);
    v.widgets.noninteractive.bg_fill = SURFACE;
    v.widgets.noninteractive.bg_stroke = stroke(BORDER_SUBTLE, 1.0);
    v.widgets.noninteractive.fg_stroke = stroke(TEXT_SECONDARY, 1.0);
    v.widgets.noninteractive.corner_radius = egui::CornerRadius::same(8);

    v.widgets.inactive.bg_fill = SURFACE_RAISED;
    v.widgets.inactive.weak_bg_fill = SURFACE_RAISED;
    v.widgets.inactive.bg_stroke = stroke(BORDER_DEFAULT, 1.0);
    v.widgets.inactive.fg_stroke = stroke(TEXT_PRIMARY, 1.0);
    v.widgets.inactive.corner_radius = egui::CornerRadius::same(8);

    v.widgets.hovered.bg_fill = SURFACE_ELEVATED;
    v.widgets.hovered.weak_bg_fill = SURFACE_ELEVATED;
    v.widgets.hovered.bg_stroke = stroke(BORDER_INTERACTIVE, 1.0);
    v.widgets.hovered.fg_stroke = stroke(TEXT_PRIMARY, 1.0);
    v.widgets.hovered.corner_radius = egui::CornerRadius::same(8);

    v.widgets.active.bg_fill = SURFACE_ELEVATED;
    v.widgets.active.weak_bg_fill = SURFACE_ELEVATED;
    v.widgets.active.bg_stroke = stroke(CORAL, 1.0);
    v.widgets.active.fg_stroke = stroke(TEXT_PRIMARY, 1.0);
    v.widgets.active.corner_radius = egui::CornerRadius::same(8);

    v.widgets.open.bg_fill = SURFACE_RAISED;
    v.widgets.open.weak_bg_fill = SURFACE_RAISED;
    v.widgets.open.bg_stroke = stroke(BORDER_DEFAULT, 1.0);
    v.widgets.open.fg_stroke = stroke(TEXT_PRIMARY, 1.0);
    v.widgets.open.corner_radius = egui::CornerRadius::same(8);

    v
}
