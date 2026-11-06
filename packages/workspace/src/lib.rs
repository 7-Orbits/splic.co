//! Splic Desktop — the native egui client.
//!
//! The crate is split so that rendering never owns authentication logic:
//!
//! * [`config`] reads the environment once at startup,
//! * [`auth`] owns the sign-in flow, the Gateway client and the session,
//! * [`theme`] owns colours, typography and motion,
//! * [`ui`] only ever renders the state the rest of the crate hands it,
//! * [`app`] wires the screens together (`app::Screen`).
//!
//! FilmCraft will be embedded in the same window later; the screen
//! architecture in [`app`] exists so the editor can be added as another
//! screen without touching authentication.

#![warn(clippy::all, rust_2018_idioms)]

pub mod app;
#[cfg(not(target_arch = "wasm32"))]
pub mod auth;
#[cfg(not(target_arch = "wasm32"))]
pub mod config;
pub mod theme;
pub mod ui;

pub use app::SplicApp;
