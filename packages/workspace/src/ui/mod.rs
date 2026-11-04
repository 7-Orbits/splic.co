//! Rendering only: screens, components and layout.
//!
//! Nothing in here decides anything — the auth controller owns the state and
//! the screens render it. That keeps the visual layer replaceable and the
//! authentication layer testable. A screen never mutates state either: it
//! hands back an [`Action`] and the app module performs it.

mod auth_screen;
mod components;
mod editor_screen;
mod workspace_screen;

pub(crate) use auth_screen::AuthScreen;
pub(crate) use editor_screen::EditorScreen;
pub(crate) use workspace_screen::WorkspaceScreen;

/// Something the user asked for while a screen was being drawn.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Action {
    /// Start the Google sign-in flow.
    SignIn,
    /// Forget the local session and revoke it on the Gateway.
    SignOut,
    /// Open the FilmCraft screen (a placeholder until the editor lands).
    OpenEditor,
    /// Leave the editor placeholder.
    BackToWorkspace,
}
