//! Sign-in state machine — the only thing the UI talks to.
//!
//! [`AuthController`] owns the current [`Phase`], the active session and the
//! background work. The UI never touches the network, the keychain or
//! threads directly: it calls the small method set here and reads the state
//! back after [`AuthController::poll`] has drained the event channel.

mod backend;
mod browser;
mod callback;
mod error;
mod flow;
mod gateway;
mod mock;
mod model;
mod pkce;
mod store;

use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::Arc;
use std::thread;

pub(crate) use error::{AuthError, ErrorCopy, Severity};
pub(crate) use model::{ProviderStatus, Session};

use crate::config::Config;

use backend::Backend;
use flow::Flow;

/// A step reported while a sign-in attempt is running.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Step {
    /// Building the request (random state, PKCE, callback port).
    Beginning,
    /// Waiting for the user to finish in the browser.
    AwaitingBrowser,
    /// Trading the authorization code for a session.
    Exchanging,
}

/// What the sign-in surface is doing right now.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum Phase {
    /// Nothing in flight; sign-in can start.
    Idle,
    /// An attempt is running.
    Working(Step),
    /// A session is active (freshly signed in or restored).
    Success,
    /// The last attempt failed; see the error.
    Error(AuthError),
}

/// Everything the background workers report back to the UI thread.
#[derive(Debug)]
pub(crate) enum AuthEvent {
    Providers(Result<Vec<ProviderStatus>, AuthError>),
    Progress(Step),
    SignedIn {
        session: Session,
        mock: bool,
        storage: Option<AuthError>,
    },
    Restored {
        session: Session,
        warning: Option<AuthError>,
    },
    /// The stored session is gone or was rejected.
    SessionLost(AuthError),
    /// The stored session could not be read at all.
    StorageFailed(AuthError),
    SignedOut {
        warning: Option<AuthError>,
    },
    Failed(AuthError),
}

/// Send an event, logging instead of panicking if nobody is listening.
pub(crate) fn emit(tx: &Sender<AuthEvent>, event: AuthEvent) {
    if let Err(error) = tx.send(event) {
        log::debug!("auth event dropped: {error}");
    }
}

/// The sign-in surface the UI drives.
pub(crate) struct AuthController {
    config: Arc<Config>,
    backend: Arc<dyn Backend>,
    tx: Sender<AuthEvent>,
    rx: Receiver<AuthEvent>,
    phase: Phase,
    session: Option<Session>,
    providers: Option<Vec<ProviderStatus>>,
    /// Non-fatal notice shown under the card (keychain trouble, unverified
    /// session, failed sign-out).
    warning: Option<AuthError>,
}

impl AuthController {
    /// Build the backend and start the background lookups.
    pub(crate) fn new(config: Arc<Config>) -> Self {
        let backend = backend::build(&config);
        let (tx, rx) = channel();
        let controller = Self {
            config: Arc::clone(&config),
            backend: Arc::clone(&backend),
            tx: tx.clone(),
            rx,
            phase: Phase::Idle,
            session: None,
            providers: None,
            warning: None,
        };

        // A mock session is never stored, and the mock backend must not be
        // asked to validate a real session — so restore only runs for real.
        if !config.is_mock() {
            let restore = Flow::new(Arc::clone(&config), Arc::clone(&backend), tx.clone());
            spawn(move || restore.restore());
        }
        let providers = Flow::new(config, backend, tx);
        spawn(move || providers.providers());

        controller
    }

    /// Apply every event that arrived since the last frame.
    pub(crate) fn poll(&mut self) {
        while let Ok(event) = self.rx.try_recv() {
            self.apply(event);
        }
    }

    /// Start a sign-in attempt. Ignored while one is already running, so a
    /// double click (or a held Enter key) cannot start a second browser flow.
    pub(crate) fn begin_sign_in(&mut self) {
        if self.busy() {
            log::debug!("ignoring a duplicate sign-in request");
            return;
        }
        self.warning = None;
        self.phase = Phase::Working(Step::Beginning);
        let flow = self.flow();
        spawn(move || flow.sign_in());
    }

    /// Sign out: forget locally at once, revoke in the background.
    pub(crate) fn sign_out(&mut self) {
        let Some(session) = self.session.take() else {
            return;
        };
        self.phase = Phase::Idle;
        self.warning = None;
        let flow = self.flow();
        spawn(move || flow.logout(session));
    }

    /// `true` while an attempt is running (used to disable the button).
    pub(crate) fn busy(&self) -> bool {
        matches!(self.phase, Phase::Working(_))
    }

    pub(crate) fn phase(&self) -> &Phase {
        &self.phase
    }

    pub(crate) fn session(&self) -> Option<&Session> {
        self.session.as_ref()
    }

    pub(crate) fn providers(&self) -> Option<&[ProviderStatus]> {
        self.providers.as_deref()
    }

    pub(crate) fn warning(&self) -> Option<&AuthError> {
        self.warning.as_ref()
    }

    pub(crate) fn config(&self) -> &Config {
        &self.config
    }

    fn flow(&self) -> Flow {
        Flow::new(
            Arc::clone(&self.config),
            Arc::clone(&self.backend),
            self.tx.clone(),
        )
    }

    fn apply(&mut self, event: AuthEvent) {
        match event {
            AuthEvent::Providers(result) => match result {
                Ok(providers) => {
                    log::debug!("the Gateway offers {} provider(s)", providers.len());
                    self.providers = Some(providers);
                }
                Err(error) => {
                    log::warn!("could not load provider availability: {error}");
                    self.providers = None;
                }
            },
            AuthEvent::Progress(step) => self.phase = Phase::Working(step),
            AuthEvent::SignedIn {
                session,
                mock,
                storage,
            } => {
                log::info!("signed in ({})", if mock { "mock session" } else { "live session" });
                self.session = Some(session);
                self.warning = storage;
                self.phase = Phase::Success;
            }
            AuthEvent::Restored { session, warning } => {
                log::info!("restored the stored session");
                self.session = Some(session);
                self.warning = warning;
                self.phase = Phase::Success;
            }
            AuthEvent::SessionLost(error) => {
                self.session = None;
                self.warning = None;
                self.phase = Phase::Error(error);
            }
            AuthEvent::StorageFailed(error) => {
                log::warn!("the stored session could not be read: {error}");
                self.warning = Some(error);
            }
            AuthEvent::SignedOut { warning } => {
                self.session = None;
                self.warning = warning;
                self.phase = Phase::Idle;
            }
            AuthEvent::Failed(error) => {
                self.phase = Phase::Error(error);
            }
        }
    }
}

/// Run `job` on a detached thread; its result arrives over the channel.
fn spawn(job: impl FnOnce() + Send + 'static) {
    drop(thread::spawn(job));
}
