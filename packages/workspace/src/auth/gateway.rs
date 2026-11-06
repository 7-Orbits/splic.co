//! HTTP client for the endpoints the Gateway already exposes.
//!
//! Only routes that exist in `packages/gateway/src/routes/auth.routes.ts` are
//! used:
//!
//! * `GET  /auth/providers` — which providers are configured,
//! * `GET  /auth/me`        — is this session still valid,
//! * `POST /auth/logout`    — revoke it.
//!
//! There is deliberately **no** token-exchange call here. `auth.service.ts`
//! documents desktop sign-up as "not implemented here"; inventing an endpoint
//! would be a promise the client could not keep, so the exchange step reports
//! `BackendNotReady` instead.
//!
//! The Gateway reads the session from an httpOnly cookie and has no bearer
//! header, so requests carry the stored token in a `Cookie` header — the only
//! transport the current contract supports.

use std::time::Duration;

use serde::de::DeserializeOwned;

use super::backend::{Backend, BeginRequest, ExchangeRequest};
use super::error::AuthError;
use super::model::{
    AuthUser, ErrorBody, MeResponse, ProviderStatus, ProvidersResponse, Session,
};

/// Session cookie name used by `session.service.ts`.
const SESSION_COOKIE: &str = "splic_auth_session";

/// A thin client over the Gateway's auth routes.
pub(crate) struct Gateway {
    base: String,
    agent: ureq::Agent,
}

impl Gateway {
    pub(crate) fn new(base: String, timeout: Duration) -> Self {
        let agent = ureq::Agent::new_with_config(
            ureq::Agent::config_builder()
                .timeout_global(Some(timeout))
                .http_status_as_error(false)
                .build(),
        );
        Self {
            base: base.trim_end_matches('/').to_owned(),
            agent,
        }
    }

    fn get(
        &self,
        path: &str,
        token: Option<&str>,
    ) -> Result<ureq::http::Response<ureq::Body>, AuthError> {
        let mut request = self.agent.get(self.url(path));
        if let Some(token) = token {
            request = request.header("Cookie", cookie(token));
        }
        request.call().map_err(transport_error)
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.base, path)
    }
}

impl Backend for Gateway {
    fn begin(&self, _request: &BeginRequest) -> Result<String, AuthError> {
        // `packages/gateway/src/services/auth.service.ts` documents desktop
        // sign-up as "not implemented here", and no other route issues an
        // authorization request. Inventing one would be a lie, so the flow
        // stops here and the UI says so.
        log::warn!("the Gateway has no desktop authorization endpoint yet");
        Err(AuthError::BackendNotReady)
    }

    fn exchange(&self, _request: &ExchangeRequest) -> Result<Session, AuthError> {
        // Same as `begin`: there is no desktop token endpoint to exchange a
        // code with, and a session must never be fabricated.
        log::warn!("the Gateway has no desktop token endpoint yet");
        Err(AuthError::BackendNotReady)
    }

    /// `GET /auth/providers` — provider availability for the sign-in UI.
    fn providers(&self) -> Result<Vec<ProviderStatus>, AuthError> {
        let mut response = self.get("/auth/providers", None)?;
        let body: ProvidersResponse = read_json(&mut response)?;
        Ok(body.providers)
    }

    /// `GET /auth/me` — validate a stored session and refresh its profile.
    fn me(&self, token: &str) -> Result<AuthUser, AuthError> {
        let mut response = self.get("/auth/me", Some(token))?;
        match read_json::<MeResponse>(&mut response) {
            Ok(body) if body.authenticated => body.user.ok_or(AuthError::MalformedResponse),
            Ok(_) => Err(AuthError::SessionInvalid),
            Err(AuthError::Gateway { status: 401, .. }) => Err(AuthError::SessionInvalid),
            Err(error) => Err(error),
        }
    }

    /// `POST /auth/logout` — revoke the session server-side.
    fn logout(&self, token: &str) -> Result<(), AuthError> {
        let mut response = self
            .agent
            .post(self.url("/auth/logout"))
            .header("Cookie", cookie(token))
            .send_empty()
            .map_err(transport_error)?;
        let status = response.status().as_u16();
        if (200..300).contains(&status) {
            Ok(())
        } else {
            Err(gateway_error(status, &mut response))
        }
    }
}

fn cookie(token: &str) -> String {
    format!("{SESSION_COOKIE}={token}")
}

/// Decode a JSON success body, turning failure statuses into [`AuthError`].
fn read_json<T: DeserializeOwned>(
    response: &mut ureq::http::Response<ureq::Body>,
) -> Result<T, AuthError> {
    let status = response.status().as_u16();
    if (200..300).contains(&status) {
        return response.body_mut().read_json::<T>().map_err(|error| {
            log::error!("the Gateway sent an unreadable body (status {status}): {error}");
            AuthError::MalformedResponse
        });
    }
    Err(gateway_error(status, response))
}

/// Turn a failure status plus its error envelope into a typed failure.
fn gateway_error(status: u16, response: &mut ureq::http::Response<ureq::Body>) -> AuthError {
    let code = response
        .body_mut()
        .read_json::<ErrorBody>()
        .ok()
        .and_then(ErrorBody::into_code)
        .unwrap_or_default();
    let code = if code.is_empty() {
        format!("http_{status}")
    } else {
        code
    };
    log::warn!("the Gateway rejected the request ({status} {code})");
    AuthError::Gateway { status, code }
}

fn transport_error(error: ureq::Error) -> AuthError {
    log::warn!("the Gateway could not be reached: {error}");
    AuthError::GatewayUnreachable
}
