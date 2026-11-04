//! Screen wiring: which screen is showing, and how state moves between them.
//!
//! The app module owns the single window's screen selection. Authentication,
//! the theme and the screens themselves live in their own modules; this file
//! only sequences them, which is what lets the FilmCraft editor be added
//! later as one more screen instead of a second window.

#[cfg(not(target_arch = "wasm32"))]
mod desktop;
#[cfg(target_arch = "wasm32")]
mod web;

#[cfg(not(target_arch = "wasm32"))]
pub use desktop::SplicApp;
#[cfg(target_arch = "wasm32")]
pub use web::SplicApp;
