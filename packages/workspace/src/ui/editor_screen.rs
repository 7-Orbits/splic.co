//! Placeholder for the FilmCraft editor screen.
//!
//! FilmCraft is not embedded yet. The screen exists so the editor can be
//! dropped in later as another case of the same screen enum — same window,
//! same event loop, no second surface.

use egui::Ui;

use super::components::{self};
use super::Action;
use crate::theme::{self, BrandAssets};

const BODY_WIDTH: f32 = 460.0;
const HEADLINE: &str = "FilmCraft isn't embedded yet";
const BODY_COPY: &str = "The editor will be added to this window as another \
                         screen, without a second window or event loop. \
                         Sign-in is already wired up, so the session will \
                         still be here when it lands.";

pub(crate) struct EditorScreen;

impl EditorScreen {
    /// Draw the screen and report what the user asked for, if anything.
    pub(crate) fn show(ui: &mut Ui, assets: &BrandAssets) -> Option<Action> {
        let bounds = ui.available_rect_before_wrap();
        let width = BODY_WIDTH.min(bounds.width() - 24.0).max(160.0);
        let mut action = None;

        components::centered_layer(ui, egui::Id::new("splic.editor"), bounds, width, |ui| {
            components::logo(ui, assets, 48.0);
            ui.add_space(14.0);
            components::heading(ui, HEADLINE, 20.0, theme::TEXT_PRIMARY);
            ui.add_space(4.0);
            components::body(ui, BODY_COPY, 13.0, theme::TEXT_SECONDARY);
            ui.add_space(18.0);
            if components::quiet_button(ui, "Back to workspace").clicked() {
                action = Some(Action::BackToWorkspace);
            }
        });

        action
    }
}
