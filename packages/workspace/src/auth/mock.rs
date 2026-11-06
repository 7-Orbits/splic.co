//! Development-only stand-in for Google and the token exchange.
//!
//! Enabled with `SPLIC_AUTH_MOCK=1` in a debug build. It never reaches the
//! network: it plays the browser against the *real* loopback listener (so the
//! callback path and `state` validation are genuinely exercised), verifies the
//! PKCE challenge the flow generated, and mints a session that is flagged
//! `mock` everywhere it appears — in the UI badge, in the stored flag, and in
//! the log.
//!
//! Mock sessions are never written to the keychain, so every launch starts on
//! the sign-in screen.

use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;

use super::backend::{Backend, BeginRequest, ExchangeRequest};
use crate::config::MockOutcome;
use super::error::AuthError;
use super::model::{AuthUser, ProviderStatus, Session};
use super::pkce;

/// How long the simulated browser "takes" before answering.
const BROWSER_DELAY: Duration = Duration::from_millis(900);

/// Timeout for the simulated browser's request to the loopback listener.
const REQUEST_TIMEOUT: Duration = Duration::from_secs(5);

/// Lifetime of a mock session.
const SESSION_TTL_SECS: u64 = 8 * 60 * 60;

/// The session a successful mock sign-in produces.
const MOCK_TOKEN: &str = "splic-mock-session";

/// A backend that fabricates the browser leg instead of talking to Google.
pub(crate) struct MockBackend {
    outcome: MockOutcome,
}

impl MockBackend {
    pub(crate) fn new(outcome: MockOutcome) -> Self {
        Self { outcome }
    }
}

impl Backend for MockBackend {
    fn begin(&self, request: &BeginRequest) -> Result<String, AuthError> {
        // A realistic-looking authorization URL. The flow never opens it in
        // mock mode, but building it proves the request was assembled.
        Ok(format!(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=splic-dev-mock\
             &redirect_uri={}&state={}&code_challenge={}&code_challenge_method=S256&scope={}",
            encode(&request.redirect_uri),
            encode(&request.state),
            encode(&request.code_challenge),
            encode(&request.scope),
        ))
    }

    fn exchange(&self, request: &ExchangeRequest) -> Result<Session, AuthError> {
        if self.outcome == MockOutcome::ExchangeFails {
            return Err(AuthError::GatewayUnreachable);
        }
        let issued = URL_SAFE_NO_PAD
            .decode(request.code.as_bytes())
            .map_err(|error| {
                log::error!("the mock callback carried an unreadable code: {error}");
                AuthError::CallbackRejected
            })?;
        let issued = String::from_utf8_lossy(&issued);
        let (redirect_uri, challenge) = issued
            .split_once('\n')
            .ok_or(AuthError::CallbackRejected)?;
        if redirect_uri != request.redirect_uri {
            log::error!("the mock code was issued for a different redirect URI");
            return Err(AuthError::StateMismatch);
        }
        let expected = pkce::challenge(&request.code_verifier);
        if challenge != expected {
            log::error!("the mock code does not match the PKCE challenge");
            return Err(AuthError::PkceMismatch);
        }
        Ok(mock_session())
    }

    fn me(&self, token: &str) -> Result<AuthUser, AuthError> {
        if token == MOCK_TOKEN {
            Ok(mock_user())
        } else {
            Err(AuthError::SessionInvalid)
        }
    }

    fn logout(&self, token: &str) -> Result<(), AuthError> {
        if token == MOCK_TOKEN {
            Ok(())
        } else {
            Err(AuthError::SessionInvalid)
        }
    }

    fn providers(&self) -> Result<Vec<ProviderStatus>, AuthError> {
        Ok(vec![ProviderStatus {
            id: "google".to_owned(),
            name: "Google".to_owned(),
            configured: true,
        }])
    }
}

/// Act as the user's browser: hit the loopback redirect after a short delay.
///
/// The request goes to the real [`CallbackServer`](super::callback::CallbackServer)
/// started by the flow, so `state` and the callback parsing are exercised
/// exactly as they would be with Google.
pub(crate) fn simulate_browser(
    outcome: MockOutcome,
    redirect_uri: &str,
    state: &str,
    code_challenge: &str,
) {
    let redirect_uri = redirect_uri.to_owned();
    let state = state.to_owned();
    let code_challenge = code_challenge.to_owned();
    thread::spawn(move || {
        thread::sleep(BROWSER_DELAY);
        let target = match outcome {
            MockOutcome::NoCallback => {
                log::debug!("mock browser: not answering, the flow will time out");
                return;
            }
            MockOutcome::Denied => format!("{redirect_uri}?error=access_denied&state={state}"),
            MockOutcome::Success | MockOutcome::ExchangeFails => format!(
                "{redirect_uri}?code={}&state={state}",
                issue_code(&redirect_uri, &code_challenge)
            ),
        };
        let agent = ureq::Agent::new_with_config(
            ureq::Agent::config_builder()
                .timeout_global(Some(REQUEST_TIMEOUT))
                .build(),
        );
        match agent.get(&target).call() {
            Ok(response) => log::debug!("mock browser answered with status {}", response.status()),
            Err(error) => log::warn!("mock browser could not reach the callback: {error}"),
        }
    });
}

/// Encode the mock authorization code: the redirect URI and the challenge it
/// was issued for, so the exchange can verify both.
fn issue_code(redirect_uri: &str, code_challenge: &str) -> String {
    URL_SAFE_NO_PAD.encode(format!("{redirect_uri}\n{code_challenge}"))
}

fn mock_session() -> Session {
    let expires_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .ok()
        .map(|elapsed| elapsed.as_secs() + SESSION_TTL_SECS);
    Session {
        token: MOCK_TOKEN.to_owned(),
        expires_at,
        user: Some(mock_user()),
        mock: true,
    }
}

fn mock_user() -> AuthUser {
    AuthUser {
        id: "mock-user".to_owned(),
        email: "dev@splic.local".to_owned(),
        name: Some("Dev Mock".to_owned()),
        avatar_url: None,
    }
}

/// Percent-encode a query parameter value.
fn encode(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(char::from(byte));
            }
            b' ' => out.push('+'),
            other => out.push_str(&format!("%{other:02X}")),
        }
    }
    out
}
