//! The seam between the sign-in flow and whatever performs the exchange.
//!
//! Two implementations exist: [`Gateway`](super::gateway), which talks to the
//! real Splic Gateway, and the development mock. Both are behind this trait so
//! the flow, the controller and the UI never care which one is installed.

use std::sync::Arc;

use crate::config::{BackendMode, Config};
use super::error::AuthError;
use super::gateway::Gateway;
use super::mock::MockBackend;
use super::model::{AuthUser, ProviderStatus, Session};

/// Everything the authorization step needs to build a request.
pub(crate) struct BeginRequest {
    /// Loopback URI the browser must return to.
    pub(crate) redirect_uri: String,
    /// Opaque value that must come back unchanged on the callback.
    pub(crate) state: String,
    /// S256 challenge of the code verifier.
    pub(crate) code_challenge: String,
    /// Scopes being requested.
    pub(crate) scope: String,
}

/// Everything the token exchange needs.
pub(crate) struct ExchangeRequest {
    /// The authorization code from the callback.
    pub(crate) code: String,
    /// Must equal the redirect URI the code was issued for.
    pub(crate) redirect_uri: String,
    /// The verifier whose hash became the challenge.
    pub(crate) code_verifier: String,
}

/// Performs the steps of a sign-in.
pub(crate) trait Backend: Send + Sync {
    /// The URL the user should visit to approve the request.
    fn begin(&self, request: &BeginRequest) -> Result<String, AuthError>;

    /// Trade the callback code for a session.
    fn exchange(&self, request: &ExchangeRequest) -> Result<Session, AuthError>;

    /// Validate a session token and refresh its profile.
    fn me(&self, token: &str) -> Result<AuthUser, AuthError>;

    /// Revoke a session token server-side.
    fn logout(&self, token: &str) -> Result<(), AuthError>;

    /// Which providers the Gateway has configured.
    fn providers(&self) -> Result<Vec<ProviderStatus>, AuthError>;
}

/// Install the backend the configuration asks for.
pub(crate) fn build(config: &Config) -> Arc<dyn Backend> {
    match config.backend {
        BackendMode::Mock { outcome } => Arc::new(MockBackend::new(outcome)),
        BackendMode::Live => Arc::new(Gateway::new(
            config.gateway_url.clone(),
            config.http_timeout,
        )),
    }
}
