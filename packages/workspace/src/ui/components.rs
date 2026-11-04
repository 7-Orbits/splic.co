//! Small building blocks shared by the screens.

use egui::{
    Align, Align2, Color32, CornerRadius, FontId, Layout, Pos2, Rect, Sense, Stroke, StrokeKind,
    TextureHandle, Ui, Vec2,
};

use crate::auth::{ErrorCopy, Severity};
use crate::theme::{self, BrandAssets, Weight};

/// Radius of the sign-in card.
pub(crate) const CARD_RADIUS: u8 = 14;

/// Radius of controls, matching the site's `.btn-auth`.
pub(crate) const CONTROL_RADIUS: u8 = 8;

/// UV rectangle covering a whole texture.
const FULL_UV: Rect = Rect::from_min_max(Pos2::new(0.0, 0.0), Pos2::new(1.0, 1.0));

/// Render `add_contents` in a layer that sizes itself to its content and
/// stays centred inside `bounds`.
///
/// An [`egui::Area`] runs an invisible sizing pass on its first frame and
/// then re-centres on every frame after that, so the panel keeps its middle
/// position while its content grows — a status row appearing, a longer error
/// message, a narrower window. The width is pinned by the caller so the text
/// wrapping (and therefore the height) cannot oscillate.
pub(crate) fn centered_layer<R>(
    ui: &Ui,
    id: egui::Id,
    bounds: Rect,
    width: f32,
    add_contents: impl FnOnce(&mut Ui) -> R,
) -> egui::InnerResponse<R> {
    egui::Area::new(id)
        .constrain_to(bounds)
        .anchor(Align2::CENTER_CENTER, Vec2::ZERO)
        .layout(Layout::top_down(Align::Center))
        .interactable(false)
        .fade_in(false)
        .show(ui.ctx(), |ui| {
            ui.set_width(width);
            add_contents(ui)
        })
}

/// The near-black card with the coral hairline from the reference design.
pub(crate) fn card(ui: &mut Ui, add_contents: impl FnOnce(&mut Ui)) {
    egui::Frame::NONE
        .fill(theme::SURFACE)
        .stroke(Stroke::new(1.0, theme::CORAL_BORDER))
        .corner_radius(CornerRadius::same(CARD_RADIUS))
        .inner_margin(egui::Margin::symmetric(26, 30))
        .show(ui, add_contents);
}

/// The Splic mark, centred in a box of `size` pixels.
pub(crate) fn logo(ui: &mut Ui, assets: &BrandAssets, size: f32) {
    let width = ui.available_width();
    let (_id, rect) = ui.allocate_space(Vec2::new(width, size));
    let image = Rect::from_center_size(rect.center(), Vec2::splat(size));
    ui.painter()
        .image(assets.logo.id(), image, FULL_UV, Color32::WHITE);
}

/// `texture` drawn in a square of `size` pixels at the cursor.
///
/// Used where a mark sits inline with other content, such as the top bar.
pub(crate) fn icon(ui: &mut Ui, texture: &TextureHandle, size: f32) -> Rect {
    let (_id, rect) = ui.allocate_space(Vec2::splat(size));
    ui.painter()
        .image(texture.id(), rect, FULL_UV, Color32::WHITE);
    rect
}

/// Centred, wrapping headline text.
pub(crate) fn heading(ui: &mut Ui, text: &str, size: f32, color: Color32) {
    let font = theme::font(Weight::SemiBold, size);
    ui.vertical_centered(|ui| {
        ui.add(egui::Label::new(
            egui::RichText::new(text).font(font).color(color),
        ).wrap());
    });
}

/// Centred, wrapping secondary text.
pub(crate) fn body(ui: &mut Ui, text: &str, size: f32, color: Color32) {
    let font = theme::font(Weight::Regular, size);
    ui.vertical_centered(|ui| {
        ui.add(
            egui::Label::new(egui::RichText::new(text).font(font).color(color))
                .wrap(),
        );
    });
}

/// A small pill used for status labels such as `DEV MOCK`.
pub(crate) fn chip(ui: &mut Ui, text: &str, color: Color32) {
    let font = theme::font(Weight::Medium, 10.0);
    let (_id, rect) = ui.allocate_space(Vec2::new(chip_width(ui, text, &font, color), 18.0));
    ui.painter()
        .rect_filled(rect, CornerRadius::same(9), theme::fade(color, 0.12));
    ui.painter().rect_stroke(
        rect,
        CornerRadius::same(9),
        Stroke::new(1.0, theme::fade(color, 0.45)),
        StrokeKind::Inside,
    );
    ui.painter().text(
        rect.center(),
        Align2::CENTER_CENTER,
        text,
        font,
        color,
    );
}

/// The "Continue with Google" control: black glass that inverts to white on
/// hover, exactly like the site's `.btn-auth`.
///
/// The transition is a single animated value, so the fill, border and label
/// all move together. While an attempt is running the control stops
/// responding to clicks instead of spawning a second browser flow.
pub(crate) fn google_button(
    ui: &mut Ui,
    assets: &BrandAssets,
    label: &str,
    enabled: bool,
) -> egui::Response {
    let id = ui.next_auto_id();
    let size = Vec2::new(ui.available_width().min(380.0), 44.0);
    let sense = if enabled { Sense::click() } else { Sense::hover() };
    let (rect, response) = ui.allocate_exact_size(size, sense);

    let (fill, edge, label_color) = if enabled {
        let hovered = response.hovered();
        let target = if hovered { 1.0 } else { 0.0 };
        let t = theme::animate(ui.ctx(), id.with("google-button"), target, theme::MOTION_FAST);
        (
            theme::lerp_color(theme::GLASS, theme::LIGHT, t),
            theme::lerp_color(theme::GLASS_BORDER, theme::LIGHT, t),
            theme::lerp_color(theme::TEXT_PRIMARY, theme::TEXT_INVERSE, t),
        )
    } else {
        (theme::GLASS_DISABLED, theme::GLASS_BORDER, theme::TEXT_DISABLED)
    };

    let radius = CornerRadius::same(CONTROL_RADIUS);
    ui.painter().rect_filled(rect, radius, fill);
    ui.painter().rect_stroke(
        rect,
        radius,
        Stroke::new(1.0, edge),
        StrokeKind::Inside,
    );

    let font = theme::font(Weight::Medium, 15.0);
    let icon_size = 18.0;
    let gap = 10.0;
    let text_width = measure(ui, label, &font, label_color);
    let content_width = icon_size + gap + text_width;
    let left = rect.center().x - content_width * 0.5;
    let icon = Rect::from_center_size(
        Pos2::new(left + icon_size * 0.5, rect.center().y),
        Vec2::splat(icon_size),
    );
    ui.painter()
        .image(assets.google_g.id(), icon, FULL_UV, Color32::WHITE);
    ui.painter().text(
        Pos2::new(left + icon_size + gap, rect.center().y),
        Align2::LEFT_CENTER,
        label,
        font,
        label_color,
    );

    if response.has_focus() {
        ui.painter().rect_stroke(
            rect.expand(3.0),
            radius,
            Stroke::new(2.0, theme::TEXT_PRIMARY),
            StrokeKind::Outside,
        );
    }
    response
}

/// The off-white primary action (`site .btn-primary`): static light fill
/// that warms slightly on hover.
pub(crate) fn primary_button(ui: &mut Ui, label: &str) -> egui::Response {
    let id = ui.next_auto_id();
    let font = theme::font(Weight::Medium, 14.0);
    let text_width = measure(ui, label, &font, theme::TEXT_INVERSE);
    let (rect, response) =
        ui.allocate_exact_size(Vec2::new((text_width + 44.0).max(160.0), 40.0), Sense::click());

    let target = if response.hovered() { 1.0 } else { 0.0 };
    let t = theme::animate(
        ui.ctx(),
        id.with("primary-button"),
        target,
        theme::MOTION_FAST,
    );
    let fill = theme::lerp_color(theme::LIGHT, theme::LIGHT_HOVER, t);

    let radius = CornerRadius::same(CONTROL_RADIUS);
    ui.painter().rect_filled(rect, radius, fill);
    ui.painter().text(
        rect.center(),
        Align2::CENTER_CENTER,
        label,
        font,
        theme::TEXT_INVERSE,
    );

    if response.has_focus() {
        ui.painter().rect_stroke(
            rect.expand(3.0),
            radius,
            Stroke::new(2.0, theme::CORAL),
            StrokeKind::Outside,
        );
    }
    response
}

/// A row with a spinner and a status sentence, used while sign-in runs.
pub(crate) fn progress_row(ui: &mut Ui, text: &str) {
    let color = theme::TEXT_SECONDARY;
    let font = theme::font(Weight::Regular, 13.0);
    let width = measure(ui, text, &font, color) + 26.0;
    let (_id, rect) = ui.allocate_space(Vec2::new(width, 20.0));
    let spinner = egui::Spinner::new().size(14.0).color(theme::CORAL);
    spinner.paint_at(
        ui,
        Rect::from_center_size(
            Pos2::new(rect.left() + 7.0, rect.center().y),
            Vec2::splat(14.0),
        ),
    );
    ui.painter().text(
        Pos2::new(rect.left() + 22.0, rect.center().y),
        Align2::LEFT_CENTER,
        text,
        font,
        color,
    );
}

/// A one-line success confirmation.
pub(crate) fn success_row(ui: &mut Ui, text: &str) {
    let color = theme::SUCCESS;
    let font = theme::font(Weight::Medium, 13.0);
    let width = measure(ui, text, &font, color) + 26.0;
    let (_id, rect) = ui.allocate_space(Vec2::new(width, 20.0));
    let center = Pos2::new(rect.left() + 7.0, rect.center().y);
    ui.painter()
        .circle_filled(center, 6.0, theme::fade(color, 0.18));
    ui.painter().text(
        Pos2::new(rect.left() + 22.0, rect.center().y),
        Align2::LEFT_CENTER,
        text,
        font,
        color,
    );
}

/// A tinted panel describing a failure with the site's wording.
pub(crate) fn error_panel(ui: &mut Ui, copy: &ErrorCopy) {
    let accent = match copy.severity {
        Severity::Error => theme::CORAL,
        Severity::Warning => theme::WARNING,
        Severity::Info => theme::TEXT_SECONDARY,
    };
    egui::Frame::NONE
        .fill(theme::fade(accent, 0.09))
        .corner_radius(CornerRadius::same(CONTROL_RADIUS))
        .inner_margin(egui::Margin::symmetric(12, 10))
        .show(ui, |ui| {
            ui.vertical_centered(|ui| {
                let title = egui::RichText::new(copy.title)
                    .font(theme::font(Weight::Medium, 13.0))
                    .color(accent);
                ui.add(egui::Label::new(title).wrap());
                ui.add_space(3.0);
                let description = egui::RichText::new(copy.description)
                    .font(theme::font(Weight::Regular, 12.0))
                    .color(theme::TEXT_SECONDARY);
                ui.add(egui::Label::new(description).wrap());
            });
        });
}

/// A quiet, single-line notice (keychain trouble, unverified session, …).
pub(crate) fn notice(ui: &mut Ui, text: &str) {
    let color = theme::WARNING;
    let font = theme::font(Weight::Regular, 12.0);
    ui.vertical_centered(|ui| {
        ui.add(
            egui::Label::new(egui::RichText::new(text).font(font).color(color)).wrap(),
        );
    });
}

/// A tiny status line: a dot plus muted text.
pub(crate) fn status_line(ui: &mut Ui, text: &str, color: Color32) {
    let font = theme::font(Weight::Regular, 11.0);
    let dot = 6.0;
    let gap = 7.0;
    let text_width = measure(ui, text, &font, color);
    let (_id, rect) = ui.allocate_space(Vec2::new(dot + gap + text_width, 16.0));
    let center = Pos2::new(rect.left() + dot * 0.5, rect.center().y);
    ui.painter().circle_filled(center, dot * 0.5, color);
    ui.painter().text(
        Pos2::new(rect.left() + dot + gap, rect.center().y),
        Align2::LEFT_CENTER,
        text,
        font,
        color,
    );
}

/// A plain, quiet button for secondary actions (sign out, back).
pub(crate) fn quiet_button(ui: &mut Ui, label: &str) -> egui::Response {
    let id = ui.next_auto_id();
    let font = theme::font(Weight::Medium, 13.0);
    let width = measure(ui, label, &font, theme::TEXT_PRIMARY) + 26.0;
    let (rect, response) = ui.allocate_exact_size(Vec2::new(width, 30.0), Sense::click());

    let target = if response.hovered() { 1.0 } else { 0.0 };
    let t = theme::animate(ui.ctx(), id.with("quiet-button"), target, theme::MOTION_FAST);
    let fill = theme::lerp_color(Color32::TRANSPARENT, theme::SURFACE_ELEVATED, t);
    let edge = theme::lerp_color(theme::BORDER_DEFAULT, theme::BORDER_INTERACTIVE, t);

    let radius = CornerRadius::same(CONTROL_RADIUS);
    ui.painter().rect_filled(rect, radius, fill);
    ui.painter().rect_stroke(
        rect,
        radius,
        Stroke::new(1.0, edge),
        StrokeKind::Inside,
    );
    ui.painter().text(
        rect.center(),
        Align2::CENTER_CENTER,
        label,
        font,
        theme::TEXT_PRIMARY,
    );
    if response.has_focus() {
        ui.painter().rect_stroke(
            rect.expand(3.0),
            radius,
            Stroke::new(2.0, theme::TEXT_PRIMARY),
            StrokeKind::Outside,
        );
    }
    response
}

/// A quiet pill showing which account is signed in: an initial disc plus the
/// name, with the address underneath when we know it.
pub(crate) fn user_pill(ui: &mut Ui, name: &str, email: Option<&str>) {
    let two_lines = email.is_some();
    let height = if two_lines { 36.0 } else { 28.0 };
    let radius = CornerRadius::same(if two_lines { 18 } else { 14 });
    let avatar = height - 8.0;

    let name_font = theme::font(Weight::Medium, 13.0);
    let email_font = theme::font(Weight::Regular, 11.0);
    let text_width = measure(ui, name, &name_font, theme::TEXT_PRIMARY).max(
        email.map_or(0.0, |value| measure(ui, value, &email_font, theme::TEXT_SECONDARY)),
    );
    let (rect, _) = ui.allocate_exact_size(
        Vec2::new(text_width + avatar + 28.0, height),
        Sense::hover(),
    );

    ui.painter()
        .rect_filled(rect, radius, theme::SURFACE_RAISED);
    ui.painter().rect_stroke(
        rect,
        radius,
        Stroke::new(1.0, theme::BORDER_SUBTLE),
        StrokeKind::Inside,
    );

    let disc = Pos2::new(rect.left() + 4.0 + avatar * 0.5, rect.center().y);
    ui.painter()
        .circle_filled(disc, avatar * 0.5, theme::fade(theme::CORAL, 0.18));
    ui.painter().text(
        disc,
        Align2::CENTER_CENTER,
        name.chars().next().unwrap_or('?'),
        theme::font(Weight::SemiBold, 13.0),
        theme::CORAL,
    );

    let text_x = rect.left() + 4.0 + avatar + 10.0;
    if let Some(email) = email {
        ui.painter().text(
            Pos2::new(text_x, rect.center().y - 8.0),
            Align2::LEFT_CENTER,
            name,
            name_font,
            theme::TEXT_PRIMARY,
        );
        ui.painter().text(
            Pos2::new(text_x, rect.center().y + 9.0),
            Align2::LEFT_CENTER,
            email,
            email_font,
            theme::TEXT_SECONDARY,
        );
    } else {
        ui.painter().text(
            Pos2::new(text_x, rect.center().y),
            Align2::LEFT_CENTER,
            name,
            name_font,
            theme::TEXT_PRIMARY,
        );
    }
}

/// Width of a chip's content plus padding.
fn chip_width(ui: &Ui, text: &str, font: &FontId, color: Color32) -> f32 {
    measure(ui, text, font, color) + 14.0
}

/// Width of `text` in `font`, without wrapping.
pub(crate) fn measure(ui: &Ui, text: &str, font: &FontId, color: Color32) -> f32 {
    ui.painter()
        .layout_no_wrap(text.to_owned(), font.clone(), color)
        .size()
        .x
}
