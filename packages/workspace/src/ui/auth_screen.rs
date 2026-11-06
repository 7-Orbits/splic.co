//! The first-launch sign-in screen: the Splic mark, the headline, the Google
//! button and an honest status area underneath it.
//!
//! The screen is a pure function of [`AuthController`]'s state — it never
//! starts work itself, it reports an [`Action`] back and the app performs it.

use egui::{Color32, Rect, Ui, Vec2};

use super::components::{self};
use super::Action;
use crate::auth::{AuthController, Phase, Step};
use crate::theme::{self, BrandAssets};

/// Width of the sign-in card, from the reference design.
const CARD_WIDTH: f32 = 400.0;
/// Headline copied verbatim from the reference design.
const HEADLINE: &str = "Looks like you're not signed in.";
const SUBHEAD: &str = "";
/// Height reserved for the status row so the card does not reflow when a
/// spinner or a success tick takes the place of the empty state.
const STATUS_HEIGHT: f32 = 20.0;

pub(crate) struct AuthScreen;

impl AuthScreen {
    /// Draw the screen and report what the user asked for, if anything.
    pub(crate) fn show(ui: &mut Ui, assets: &BrandAssets, auth: &AuthController) -> Option<Action> {
        let bounds = ui.available_rect_before_wrap();
        let width = layer_width(bounds, CARD_WIDTH);
        let (footer, footer_color) = gateway_status(auth);
        let mut action = None;

        components::centered_layer(ui, egui::Id::new("splic.sign-in"), bounds, width, |ui| {
            if auth.config().is_mock() {
                components::chip(ui, "DEV MOCK", theme::WARNING);
                ui.add_space(4.0);
            }

            components::card(ui, |ui| {
                components::logo(ui, assets, 56.0);
                ui.add_space(10.0);
                components::heading(ui, HEADLINE, 20.0, theme::TEXT_PRIMARY);
                ui.add_space(2.0);
                components::body(ui, SUBHEAD, 13.0, theme::TEXT_SECONDARY);
                ui.add_space(14.0);

                let busy = auth.busy();
                let label = if busy {
                    "Opening Google…"
                } else {
                    "Continue with Google"
                };
                if components::google_button(ui, assets, label, !busy).clicked() {
                    action = Some(Action::SignIn);
                }

                ui.add_space(6.0);
                status_slot(ui, |ui| render_status(ui, auth));

                if let Some(warning) = auth.warning() {
                    ui.add_space(4.0);
                    components::notice(ui, warning.copy().description);
                }

                ui.add_space(6.0);
                components::status_line(ui, &footer, footer_color);
            });
        });

        action
    }
}

/// Width of a centred layer: the design width, capped so it still fits with
/// a margin on either side, and never so small that the text collapses.
fn layer_width(bounds: Rect, design: f32) -> f32 {
    design.min(bounds.width() - 24.0).max(160.0)
}

/// Reserve a stable slot for the status row.
///
/// The card keeps its height while a spinner or a success tick is shown and
/// only grows when a taller error panel needs the room, so nothing above the
/// slot jumps when sign-in starts.
fn status_slot(ui: &mut Ui, add_contents: impl FnOnce(&mut Ui)) {
    let slot = Rect::from_min_size(
        ui.cursor().left_top(),
        Vec2::new(ui.available_width(), STATUS_HEIGHT),
    );
    let mut child = ui.new_child(
        egui::UiBuilder::new()
            .max_rect(slot)
            .layout(egui::Layout::top_down(egui::Align::Center)),
    );
    add_contents(&mut child);
    ui.advance_cursor_after_rect(child.min_rect().union(slot));
}

/// Whatever the current phase has to say about itself.
fn render_status(ui: &mut Ui, auth: &AuthController) {
    match auth.phase() {
        Phase::Working(step) => components::progress_row(ui, step_label(*step)),
        Phase::Success => components::success_row(ui, "Signed in"),
        Phase::Error(error) => components::error_panel(ui, &error.copy()),
        Phase::Idle => {}
    }
}

/// The sentence shown next to the spinner for each step of the flow.
fn step_label(step: Step) -> &'static str {
    match step {
        Step::Beginning => "Preparing a secure sign-in…",
        Step::AwaitingBrowser => "Waiting for you to finish in the browser…",
        Step::Exchanging => "Completing sign-in…",
    }
}

/// One honest line about the Gateway: what the last provider lookup found,
/// and which Gateway it asked. Never claims more than the lookup proved.
fn gateway_status(auth: &AuthController) -> (String, Color32) {
    let url = auth.config().gateway_url.as_str();
    let (state, color) = match auth.providers() {
        None => ("Status unknown", theme::TEXT_TERTIARY),
        Some(providers) if providers.iter().any(|p| p.id == "google" && p.configured) => {
            ("Google configured", theme::SUCCESS)
        }
        Some(providers) if providers.iter().any(|p| p.id == "google") => {
            ("Google not configured", theme::WARNING)
        }
        Some(_) => ("No Google provider", theme::WARNING),
    };
    (format!("{state} · {url}"), color)
}
