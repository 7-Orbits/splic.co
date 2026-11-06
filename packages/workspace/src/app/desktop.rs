//! The native application: screen selection, session transitions and the
//! frame loop.
//!
//! Rendering happens in [`crate::ui`]; this module only decides which screen
//! is up, when a completed sign-in may move on, and how the window fades
//! between screens.

use std::sync::Arc;
use std::time::{Duration, Instant};

use eframe::egui;

use crate::auth::{AuthController, Phase};
use crate::config::Config;
use crate::theme::{self, BrandAssets};
use crate::ui::{Action, AuthScreen, EditorScreen, WorkspaceScreen};

/// How long the success row stays readable before the workspace appears.
const SUCCESS_HOLD: Duration = Duration::from_millis(900);
/// Length of the cross-fade between two screens.
const TRANSITION: Duration = Duration::from_millis(300);
/// How often an idle sign-in screen wakes up to drain background events.
const IDLE_POLL: Duration = Duration::from_millis(100);

/// Which screen the single window is showing.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Screen {
    Auth,
    Workspace,
    Editor,
}

pub struct SplicApp {
    auth: AuthController,
    assets: BrandAssets,
    screen: Screen,
    /// When the current screen appeared, so the cross-fade can run.
    transition: Option<Instant>,
    /// When the current sign-in reported success, so the confirmation can be
    /// read before the workspace takes over.
    success_since: Option<Instant>,
    /// `true` once a sign-in attempt has been seen. A session restored on
    /// startup must not pause on the success row.
    attempted: bool,
}

impl SplicApp {
    /// Install the theme, decode the brand assets and start the auth controller.
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        theme::install(&cc.egui_ctx);
        Self {
            auth: AuthController::new(Arc::new(Config::from_env())),
            assets: BrandAssets::new(&cc.egui_ctx),
            screen: Screen::Auth,
            transition: Some(Instant::now()),
            success_since: None,
            attempted: false,
        }
    }

    /// Move to `screen`, starting a cross-fade when it actually changes.
    fn goto(&mut self, screen: Screen) {
        if self.screen != screen {
            self.screen = screen;
            self.transition = Some(Instant::now());
        }
    }

    /// Drain background events and advance the screen the state implies.
    fn advance(&mut self, ctx: &egui::Context) {
        if matches!(self.auth.phase(), Phase::Working(_)) {
            self.attempted = true;
        }

        if self.screen == Screen::Auth {
            self.advance_auth(ctx);
        } else if self.auth.session().is_none() {
            // Signed out, or the session was rejected behind our back.
            self.attempted = false;
            self.goto(Screen::Auth);
        }
    }

    /// Sit on the success row long enough to be read, then move on. A
    /// restored session never attempted anything, so it moves at once.
    fn advance_auth(&mut self, ctx: &egui::Context) {
        if !matches!(self.auth.phase(), Phase::Success) {
            self.success_since = None;
            return;
        }

        let hold = if self.attempted {
            SUCCESS_HOLD
        } else {
            Duration::ZERO
        };
        match self.success_since {
            None => self.success_since = Some(Instant::now()),
            Some(since) if since.elapsed() >= hold => {
                self.success_since = None;
                self.attempted = false;
                self.goto(Screen::Workspace);
            }
            Some(since) => {
                let remaining = hold.saturating_sub(since.elapsed());
                ctx.request_repaint_after(remaining);
            }
        }
    }

    fn apply(&mut self, action: Option<Action>) {
        match action {
            Some(Action::SignIn) => self.auth.begin_sign_in(),
            Some(Action::SignOut) => {
                self.attempted = false;
                self.auth.sign_out();
            }
            Some(Action::OpenEditor) => self.goto(Screen::Editor),
            Some(Action::BackToWorkspace) => self.goto(Screen::Workspace),
            None => {}
        }
    }

    /// Fade in the new screen over `TRANSITION`.
    fn paint_transition(&mut self, ctx: &egui::Context) {
        if let Some(since) = self.transition {
            let elapsed = since.elapsed();
            if elapsed < TRANSITION {
                let progress = elapsed.as_secs_f32() / TRANSITION.as_secs_f32();
                let alpha = (1.0 - progress).clamp(0.0, 1.0);
                let color = theme::fade(theme::BG, alpha);
                let painter = ctx.layer_painter(egui::LayerId::new(
                    egui::Order::Foreground,
                    egui::Id::new("screen_transition"),
                ));
                painter.rect_filled(ctx.viewport_rect(), 0.0, color);
            } else {
                self.transition = None;
            }
        }
    }

    /// Wake up often enough to handle background auth events while on the auth screen.
    fn keep_awake(&self, ctx: &egui::Context) {
        if self.auth.busy() || self.screen == Screen::Auth {
            ctx.request_repaint_after(IDLE_POLL);
        }
    }
}

impl eframe::App for SplicApp {
    fn ui(&mut self, ui: &mut egui::Ui, _frame: &mut eframe::Frame) {
        let ctx = ui.ctx().clone();
        self.auth.poll();
        self.advance(&ctx);

        let screen = self.screen;
        let action = egui::CentralPanel::default()
            .frame(egui::Frame::NONE.fill(theme::BG))
            .show(ui, |ui| match screen {
                Screen::Auth => AuthScreen::show(ui, &self.assets, &self.auth),
                Screen::Workspace => WorkspaceScreen::show(ui, &self.assets, &self.auth),
                Screen::Editor => EditorScreen::show(ui, &self.assets),
            })
            .inner;

        self.apply(action);
        self.paint_transition(&ctx);
        self.keep_awake(&ctx);
    }
}
