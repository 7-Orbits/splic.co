//! Types shared with the Gateway and with the stored session.

use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

/// The safe profile the Gateway returns from `GET /auth/me`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct AuthUser {
    pub(crate) id: String,
    pub(crate) email: String,
    pub(crate) name: Option<String>,
    #[serde(rename = "avatarUrl")]
    pub(crate) avatar_url: Option<String>,
}

/// Body of `GET /auth/me`.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
pub(crate) struct MeResponse {
    pub(crate) authenticated: bool,
    pub(crate) user: Option<AuthUser>,
}

/// Body of `GET /auth/providers`.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
pub(crate) struct ProvidersResponse {
    pub(crate) providers: Vec<ProviderStatus>,
}

/// One sign-in provider advertised by the Gateway.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
pub(crate) struct ProviderStatus {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) configured: bool,
}

/// An error envelope the Gateway may return alongside a failure status.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
pub(crate) struct ErrorBody {
    pub(crate) error: Option<String>,
    pub(crate) code: Option<String>,
    pub(crate) message: Option<String>,
}

impl ErrorBody {
    /// The first error identifier the body carries, if any.
    pub(crate) fn into_code(self) -> Option<String> {
        self.error
            .or(self.code)
            .or(self.message)
            .filter(|value| !value.is_empty())
    }
}

/// A desktop session: the opaque token plus what we know about its owner.
///
/// The token is written to the OS credential store as JSON and is only ever
/// sent back to the Gateway that issued it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct Session {
    pub(crate) token: String,
    /// Expiry as a Unix timestamp in seconds, when the issuer told us one.
    pub(crate) expires_at: Option<u64>,
    pub(crate) user: Option<AuthUser>,
    /// `true` for sessions minted by the development mock backend.
    #[serde(default)]
    pub(crate) mock: bool,
}

impl Session {
    /// `true` when a locally known expiry has passed.
    ///
    /// Real Gateway sessions carry no expiry we can trust, so they are never
    /// "expired" locally — the server decides, on the next `GET /auth/me`.
    pub(crate) fn expired(&self) -> bool {
        match (self.expires_at, unix_now()) {
            (Some(expires_at), Some(now)) => now >= expires_at,
            _ => false,
        }
    }

    /// How the user should be described in the UI.
    pub(crate) fn display_name(&self) -> &str {
        self.user
            .as_ref()
            .and_then(|user| user.name.as_deref())
            .filter(|name| !name.is_empty())
            .unwrap_or(self.user.as_ref().map_or("Signed in", |user| user.email.as_str()))
    }

    /// The account email, when we know it.
    pub(crate) fn email(&self) -> Option<&str> {
        self.user.as_ref().map(|user| user.email.as_str())
    }
}

fn unix_now() -> Option<u64> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .ok()
        .map(|elapsed| elapsed.as_secs())
}
