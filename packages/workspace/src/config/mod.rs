//! Runtime configuration, read once from the process environment.
//!
//! Nothing here performs I/O beyond reading variables, so both the shell and
//! the sign-in flow can read it without reaching back into the environment.

use std::time::Duration;

/// Base URL of the Splic Gateway (see `packages/gateway`).
const DEFAULT_GATEWAY_URL: &str = "http://127.0.0.1:3010";

/// How long we wait for the user to finish in the browser.
const DEFAULT_AUTH_TIMEOUT_SECS: u64 = 300;

/// Per-request HTTP timeout for Gateway calls.
const DEFAULT_HTTP_TIMEOUT_SECS: u64 = 10;

/// Which backend performs the sign-in exchange.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum BackendMode {
    /// The real Gateway. It exposes no desktop token endpoint yet, so the
    /// authorization and exchange steps honestly report `BackendNotReady`
    /// instead of inventing an endpoint.
    Live,
    /// Development-only simulation of the browser leg (see `SPLIC_AUTH_MOCK`).
    Mock { outcome: MockOutcome },
}

/// What the simulated browser does in mock mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum MockOutcome {
    /// The simulated browser returns a code and the exchange succeeds.
    Success,
    /// The simulated browser reports that the user cancelled at Google.
    Denied,
    /// The simulated browser never reports back.
    NoCallback,
    /// The exchange fails with a transport error.
    ExchangeFails,
}

/// Everything the app needs at startup.
#[derive(Debug, Clone)]
pub(crate) struct Config {
    /// Gateway base URL, without a trailing slash.
    pub(crate) gateway_url: String,
    pub(crate) backend: BackendMode,
    /// How long the sign-in flow waits for the browser callback.
    pub(crate) auth_timeout: Duration,
    /// Timeout applied to each Gateway HTTP request.
    pub(crate) http_timeout: Duration,
}

impl Config {
    /// Read the configuration from the environment.
    ///
    /// `SPLIC_GATEWAY_URL`   — Gateway base URL (default `http://127.0.0.1:3010`).
    /// `SPLIC_AUTH_MOCK`     — opt in to the development mock backend.
    /// `SPLIC_AUTH_MOCK_RESULT` — `ok` (default), `denied`, `no-callback`,
    ///                            or `exchange-error`.
    /// `SPLIC_AUTH_TIMEOUT_SECS` — browser wait, clamped to 5..=3600.
    /// `SPLIC_HTTP_TIMEOUT_SECS` — per-request timeout, clamped to 1..=120.
    ///
    /// Mock mode is compiled into every build but only takes effect in debug
    /// builds; release builds always talk to the live Gateway and log that the
    /// variable was ignored.
    pub(crate) fn from_env() -> Self {
        let gateway_url = {
            let raw = env_var("SPLIC_GATEWAY_URL");
            let trimmed = raw.trim();
            if trimmed.is_empty() {
                DEFAULT_GATEWAY_URL.to_owned()
            } else {
                trimmed.to_owned()
            }
        };

        let backend = if env_flag("SPLIC_AUTH_MOCK") {
            if cfg!(debug_assertions) {
                BackendMode::Mock {
                    outcome: parse_mock_outcome(&env_var("SPLIC_AUTH_MOCK_RESULT")),
                }
            } else {
                log::warn!("SPLIC_AUTH_MOCK is ignored in release builds; using the live Gateway");
                BackendMode::Live
            }
        } else {
            BackendMode::Live
        };

        Self {
            gateway_url,
            backend,
            auth_timeout: env_secs("SPLIC_AUTH_TIMEOUT_SECS", DEFAULT_AUTH_TIMEOUT_SECS, 5, 3600),
            http_timeout: env_secs("SPLIC_HTTP_TIMEOUT_SECS", DEFAULT_HTTP_TIMEOUT_SECS, 1, 120),
        }
    }

    /// `true` when sign-in runs against the development mock backend.
    pub(crate) fn is_mock(&self) -> bool {
        matches!(self.backend, BackendMode::Mock { .. })
    }
}

fn env_var(name: &str) -> String {
    std::env::var(name).unwrap_or_default()
}

fn env_flag(name: &str) -> bool {
    matches!(
        env_var(name).trim().to_ascii_lowercase().as_str(),
        "1" | "true" | "yes" | "on"
    )
}

fn env_secs(name: &str, default: u64, min: u64, max: u64) -> Duration {
    let raw = env_var(name);
    let seconds = raw.trim().parse::<u64>().unwrap_or(default);
    Duration::from_secs(seconds.clamp(min, max))
}

fn parse_mock_outcome(raw: &str) -> MockOutcome {
    match raw.trim().to_ascii_lowercase().as_str() {
        "denied" | "cancel" | "cancelled" => MockOutcome::Denied,
        "no-callback" | "timeout" => MockOutcome::NoCallback,
        "exchange-error" | "network" => MockOutcome::ExchangeFails,
        _ => MockOutcome::Success,
    }
}
