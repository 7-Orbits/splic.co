//! The signed-in shell: a top bar with the account and an honest placeholder
//! body until the workspace itself lands.

use egui::{Stroke, Ui, Vec2};

use super::components::{self};
use super::Action;
use crate::auth::AuthController;
use crate::theme::{self, BrandAssets, Weight};

const TOP_BAR_HEIGHT: f32 = 52.0;
const BODY_WIDTH: f32 = 460.0;
const BODY_HEADLINE: &str = "Your workspace is almost here";
const BODY_COPY: &str = "Projects, renders and collaboration will live here. \
                         For now this shell only does one thing: keep you \
                         signed in.";

pub(crate) struct WorkspaceScreen;

impl WorkspaceScreen {
    /// Draw the screen and report what the user asked for, if anything.
    pub(crate) fn show(
        ui: &mut Ui,
        assets: &BrandAssets,
        auth: &AuthController,
    ) -> Option<Action> {
        let mut action = None;
        top_bar(ui, assets, auth, &mut action);

        let bounds = ui.available_rect_before_wrap();
        let width = BODY_WIDTH.min(bounds.width() - 24.0).max(160.0);
        components::centered_layer(
            ui,
            egui::Id::new("splic.workspace"),
            bounds,
            width,
            |ui| {
                components::heading(ui, BODY_HEADLINE, 22.0, theme::TEXT_PRIMARY);
                ui.add_space(4.0);
                components::body(ui, BODY_COPY, 13.0, theme::TEXT_SECONDARY);
                ui.add_space(18.0);
                if components::primary_button(ui, "Open FilmCraft").clicked() {
                    action = Some(Action::OpenEditor);
                }
            },
        );

        action
    }
}

/// The full-width bar: mark and wordmark on the left, the account and the
/// sign-out control on the right, closed off by a hairline.
fn top_bar(ui: &mut Ui, assets: &BrandAssets, auth: &AuthController, action: &mut Option<Action>) {
    let (_id, rect) = ui.allocate_space(Vec2::new(ui.available_width(), TOP_BAR_HEIGHT));
    let mut bar = ui.new_child(
        egui::UiBuilder::new()
            .max_rect(rect)
            .layout(egui::Layout::left_to_right(egui::Align::Center)),
    );

    components::icon(&mut bar, &assets.logo, 24.0);
    bar.add_space(10.0);
    bar.label(
        egui::RichText::new("Splic")
            .font(theme::font(Weight::SemiBold, 15.0))
            .color(theme::TEXT_PRIMARY),
    );

    bar.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
        if components::quiet_button(ui, "Sign out").clicked() {
            *action = Some(Action::SignOut);
        }
        if auth.config().is_mock() {
            ui.add_space(10.0);
            components::chip(ui, "DEV MOCK", theme::WARNING);
        }
        if let Some(session) = auth.session() {
            ui.add_space(10.0);
            components::user_pill(ui, session.display_name(), session.email());
        }
    });

    ui.painter().line_segment(
        [rect.left_bottom(), rect.right_bottom()],
        Stroke::new(1.0, theme::BORDER_SUBTLE),
    );
}
