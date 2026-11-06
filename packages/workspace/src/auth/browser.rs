//! Opening the system browser.

use super::error::AuthError;

/// Hand `url` to the operating system's default browser.
///
/// Success here only means the request was handed over; whether the user
/// completes sign-in is decided by the callback listener.
pub(crate) fn open(url: &str) -> Result<(), AuthError> {
    webbrowser::open(url).map_err(|error| {
        log::error!("could not open the browser: {error}");
        AuthError::BrowserUnavailable
    })
}
