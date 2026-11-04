//! Safe, user-facing copy for sign-in failures.
//!
//! The wording mirrors `packages/site/lib/auth/errors.ts` so a failure reads
//! the same on the website and in the desktop app. Raw server messages, tokens
//! and stack traces never reach the UI — only these static strings do; details
//! go to the log instead.

use std::fmt;

/// How the UI should present a failure.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Severity {
    /// Something broke; the user should retry.
    Error,
    /// Something the user should know about but did not cause.
    Warning,
    /// A benign outcome, such as cancelling at Google.
    Info,
}

/// Static, safe copy describing an [`AuthError`].
#[derive(Debug, Clone, Copy)]
pub(crate) struct ErrorCopy {
    pub(crate) title: &'static str,
    pub(crate) description: &'static str,
    pub(crate) severity: Severity,
}

/// Fallback copy for anything we cannot describe precisely.
const DEFAULT_COPY: ErrorCopy = ErrorCopy {
    title: "Authentication failed",
    description: "Authentication failed; please try again.",
    severity: Severity::Error,
};

/// Every failure the sign-in flow can produce.
///
/// Variants are deliberately coarse: the UI only ever shows the static copy
/// from [`AuthError::copy`], and the machine-readable detail is kept for the
/// log.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum AuthError {
    /// The Gateway exposes no desktop sign-in endpoint yet.
    BackendNotReady,
    /// This build cannot sign in at all (the web build).
    #[allow(dead_code)]
    Unsupported,
    /// The Gateway could not be reached.
    GatewayUnreachable,
    /// The Gateway answered with a non-success status.
    Gateway { status: u16, code: String },
    /// A success response we could not parse.
    MalformedResponse,
    /// The system browser refused to open.
    BrowserUnavailable,
    /// The loopback callback port could not be bound.
    CallbackUnavailable,
    /// The browser never reported back in time.
    CallbackTimeout,
    /// The callback carried neither a code nor an error.
    CallbackRejected,
    /// `state` did not match the value we sent.
    StateMismatch,
    /// The code did not match the PKCE challenge we sent.
    PkceMismatch,
    /// The user cancelled at Google.
    AccessDenied,
    /// The Gateway says our session token is no longer valid.
    SessionInvalid,
    /// The OS credential store could not be read or written.
    Storage(String),
    /// The device could not produce a secure random value.
    RandomSourceUnavailable,
}

impl AuthError {
    /// Static, safe copy for this failure.
    pub(crate) fn copy(&self) -> ErrorCopy {
        match self {
            Self::BackendNotReady => ErrorCopy {
                title: "Sign-in isn't wired up yet",
                description: "The Splic Gateway doesn't offer desktop sign-in \
                             yet, so there is nothing to exchange a Google \
                             code with. Run a debug build with SPLIC_AUTH_MOCK=1 \
                             to exercise the flow.",
                severity: Severity::Warning,
            },
            Self::Unsupported => ErrorCopy {
                title: "Desktop build required",
                description: "Sign-in only exists in the Splic Desktop app.",
                severity: Severity::Warning,
            },
            Self::GatewayUnreachable => ErrorCopy {
                title: "Gateway unreachable",
                description: "Couldn't reach the Splic Gateway. Check your \
                              connection and that it is running.",
                severity: Severity::Error,
            },
            Self::Gateway { code, .. } => gateway_copy(code),
            Self::MalformedResponse => ErrorCopy {
                title: "Unexpected response",
                description: "The Splic Gateway sent something we couldn't read.",
                severity: Severity::Error,
            },
            Self::BrowserUnavailable => ErrorCopy {
                title: "Couldn't open your browser",
                description: "Your browser didn't open. Check your default \
                              browser settings and try again.",
                severity: Severity::Error,
            },
            Self::CallbackUnavailable => ErrorCopy {
                title: "Couldn't listen for sign-in",
                description: "Splic couldn't open a local port to receive the \
                              sign-in response. Try again.",
                severity: Severity::Error,
            },
            Self::CallbackTimeout => ErrorCopy {
                title: "Timed out waiting",
                description: "No sign-in response arrived in time. Please try again.",
                severity: Severity::Warning,
            },
            Self::CallbackRejected => ErrorCopy {
                title: "Sign-in incomplete",
                description: "The sign-in response was incomplete. Please try again.",
                severity: Severity::Error,
            },
            Self::StateMismatch | Self::PkceMismatch => ErrorCopy {
                title: "Verification failed",
                description: "Authentication could not be verified. Please try again.",
                severity: Severity::Error,
            },
            Self::AccessDenied => ErrorCopy {
                title: "Sign-in cancelled",
                description: "Google authentication was cancelled.",
                severity: Severity::Info,
            },
            Self::SessionInvalid => ErrorCopy {
                title: "Session no longer valid",
                description: "Your session is no longer valid. Please sign in again.",
                severity: Severity::Warning,
            },
            Self::Storage(_) => ErrorCopy {
                title: "Keychain unavailable",
                description: "Your session couldn't be saved to the system \
                              keychain, so you'll need to sign in again next time.",
                severity: Severity::Warning,
            },
            Self::RandomSourceUnavailable => ErrorCopy {
                title: "Secure random unavailable",
                description: "This device couldn't produce a secure random \
                              value, so sign-in was cancelled. Please try again.",
                severity: Severity::Error,
            },
        }
    }

}

/// Copy for an error code reported by the Gateway, mirroring
/// `packages/site/lib/auth/errors.ts`.
fn gateway_copy(code: &str) -> ErrorCopy {
    match code {
        "account_not_registered" => ErrorCopy {
            title: "Account not registered",
            description: "This Google account isn't registered with Splic yet. \
                          Sign-up will be available in the Splic desktop app.",
            severity: Severity::Error,
        },
        "access_denied" => ErrorCopy {
            title: "Sign-in cancelled",
            description: "Google authentication was cancelled.",
            severity: Severity::Info,
        },
        "session_expired" => ErrorCopy {
            title: "Session expired",
            description: "Session expired; please sign in again.",
            severity: Severity::Warning,
        },
        "auth_failed" | "invalid_grant" => ErrorCopy {
            title: "Authentication failed",
            description: "Authentication failed; please try again.",
            severity: Severity::Error,
        },
        "auth_state_mismatch" => ErrorCopy {
            title: "Verification failed",
            description: "Authentication could not be verified. Please try again.",
            severity: Severity::Error,
        },
        "auth_not_configured" => ErrorCopy {
            title: "Sign-in unavailable",
            description: "Sign-in isn't configured yet. Please try again later.",
            severity: Severity::Error,
        },
        "account_unavailable" => ErrorCopy {
            title: "Account unavailable",
            description: "This Splic account is currently unavailable.",
            severity: Severity::Error,
        },
        "storage_unavailable" => ErrorCopy {
            title: "Splic storage unavailable",
            description: "Splic couldn't reach its storage. Please try again in a moment.",
            severity: Severity::Warning,
        },
        _ => DEFAULT_COPY,
    }
}

impl fmt::Display for AuthError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::BackendNotReady => formatter.write_str("gateway has no desktop sign-in endpoint"),
            Self::Unsupported => formatter.write_str("sign-in is not available in this build"),
            Self::GatewayUnreachable => formatter.write_str("gateway unreachable"),
            Self::Gateway { status, code } => write!(formatter, "gateway status {status}: {code}"),
            Self::MalformedResponse => formatter.write_str("unreadable gateway response"),
            Self::BrowserUnavailable => formatter.write_str("could not open the browser"),
            Self::CallbackUnavailable => formatter.write_str("could not bind the callback port"),
            Self::CallbackTimeout => formatter.write_str("callback timed out"),
            Self::CallbackRejected => formatter.write_str("callback carried no code"),
            Self::StateMismatch => formatter.write_str("oauth state mismatch"),
            Self::PkceMismatch => formatter.write_str("pkce challenge mismatch"),
            Self::AccessDenied => formatter.write_str("user denied access"),
            Self::SessionInvalid => formatter.write_str("session token rejected"),
            Self::Storage(detail) => write!(formatter, "credential store: {detail}"),
            Self::RandomSourceUnavailable => formatter.write_str("secure random unavailable"),
        }
    }
}
