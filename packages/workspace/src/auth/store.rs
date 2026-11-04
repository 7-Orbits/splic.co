//! Session persistence in the OS credential store.
//!
//! The session token is written to the platform keychain (Keychain on macOS,
//! Credential Manager on Windows, Secret Service on Linux) as JSON. There is
//! deliberately no plaintext fallback: if the store is unavailable the app
//! keeps working, the user simply has to sign in again next launch, and the
//! failure is reported instead of hidden.

use super::error::AuthError;
use super::model::Session;

/// Service name shown in the keychain entry.
const SERVICE: &str = "com.splic.desktop";
/// Account name of the single credential this app stores.
const ACCOUNT: &str = "session";

/// Persist a session so the next launch starts signed in.
pub(crate) fn save(session: &Session) -> Result<(), AuthError> {
    let json = serde_json::to_string(session).map_err(|error| {
        log::error!("could not serialise the session: {error}");
        AuthError::Storage(format!("serialisation failed: {error}"))
    })?;
    entry()?
        .set_password(&json)
        .map_err(|error| {
            log::error!("could not write the session to the keychain: {error}");
            AuthError::Storage(format!("write failed: {error}"))
        })
}

/// Read the stored session, if there is a readable one.
pub(crate) fn load() -> Result<Option<Session>, AuthError> {
    match entry()?.get_password() {
        Ok(json) => {
            let session = serde_json::from_str::<Session>(&json).map_err(|error| {
                log::error!("the stored session is unreadable: {error}");
                AuthError::Storage(format!("read failed: {error}"))
            })?;
            Ok(Some(session))
        }
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => {
            log::error!("could not read the session from the keychain: {error}");
            Err(AuthError::Storage(format!("read failed: {error}")))
        }
    }
}

/// Forget the stored session. Missing entries are not an error.
pub(crate) fn clear() -> Result<(), AuthError> {
    let entry = entry()?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(error) => {
            log::error!("could not delete the session from the keychain: {error}");
            Err(AuthError::Storage(format!("delete failed: {error}")))
        }
    }
}

fn entry() -> Result<keyring::Entry, AuthError> {
    keyring::Entry::new(SERVICE, ACCOUNT).map_err(|error| {
        log::error!("the credential store is unavailable: {error}");
        AuthError::Storage(format!("store unavailable: {error}"))
    })
}
