//! Background jobs: sign-in, session restore, provider lookup and sign-out.
//!
//! Every job runs on its own thread and reports back through the channel the
//! [`AuthController`](super::AuthController) polls between frames, so the UI
//! thread never blocks on the network or on the keychain.

use std::sync::mpsc::Sender;
use std::sync::Arc;

use super::backend::{Backend, BeginRequest, ExchangeRequest};
use super::browser;
use super::callback::CallbackServer;
use crate::config::{BackendMode, Config};
use super::error::AuthError;
use super::mock;
use super::model::Session;
use super::pkce;
use super::store;
use super::{emit, AuthEvent, Step};

/// Scopes the desktop app asks Google for.
const SCOPE: &str = "openid email profile";

/// Everything one background job needs.
pub(crate) struct Flow {
    config: Arc<Config>,
    backend: Arc<dyn Backend>,
    tx: Sender<AuthEvent>,
}

impl Flow {
    pub(crate) fn new(
        config: Arc<Config>,
        backend: Arc<dyn Backend>,
        tx: Sender<AuthEvent>,
    ) -> Self {
        Self {
            config,
            backend,
            tx,
        }
    }

    /// Run one complete sign-in attempt: request, browser, callback, exchange.
    pub(crate) fn sign_in(self) {
        emit(&self.tx, AuthEvent::Progress(Step::Beginning));
        if let Err(error) = self.run_sign_in() {
            log::warn!("sign-in failed: {error}");
            emit(&self.tx, AuthEvent::Failed(error));
        }
    }

    /// Revalidate the stored session, or report that it is gone.
    pub(crate) fn restore(self) {
        let stored = match store::load() {
            Ok(stored) => stored,
            Err(error) => {
                emit(&self.tx, AuthEvent::StorageFailed(error));
                return;
            }
        };
        let Some(mut session) = stored else {
            log::debug!("no stored session; starting signed out");
            return;
        };
        if session.expired() {
            log::info!("the stored session had already expired");
            self.forget(AuthError::SessionInvalid);
            return;
        }
        match self.backend.me(&session.token) {
            Ok(user) => {
                session.user = Some(user);
                emit(
                    &self.tx,
                    AuthEvent::Restored {
                        session,
                        warning: None,
                    },
                );
            }
            Err(AuthError::SessionInvalid) => {
                log::info!("the Gateway rejected the stored session");
                self.forget(AuthError::SessionInvalid);
            }
            Err(error) => {
                // Anything but a definite rejection keeps the session: a network
                // blip or a Gateway outage must not sign the user out.
                log::warn!("could not verify the stored session, keeping it: {error}");
                emit(
                    &self.tx,
                    AuthEvent::Restored {
                        session,
                        warning: Some(error),
                    },
                );
            }
        }
    }

    /// Ask the Gateway which providers are configured.
    pub(crate) fn providers(self) {
        emit(&self.tx, AuthEvent::Providers(self.backend.providers()));
    }

    /// Forget locally, then revoke server-side.
    pub(crate) fn logout(self, session: Session) {
        let storage = store::clear().err();
        if let Some(error) = &storage {
            log::warn!("could not clear the stored session: {error}");
        }
        let revoke = self.backend.logout(&session.token).err();
        if let Some(error) = &revoke {
            log::warn!("could not revoke the session with the Gateway: {error}");
        }
        emit(
            &self.tx,
            AuthEvent::SignedOut {
                warning: revoke.or(storage),
            },
        );
    }

    fn run_sign_in(&self) -> Result<(), AuthError> {
        let server = CallbackServer::start()?;
        let redirect_uri = server.redirect_uri();
        let state = pkce::random_state()?;
        let verifier = pkce::generate_verifier()?;
        let challenge = pkce::challenge(&verifier);

        let url = self.backend.begin(&BeginRequest {
            redirect_uri: redirect_uri.clone(),
            state: state.clone(),
            code_challenge: challenge.clone(),
            scope: SCOPE.to_owned(),
        })?;
        log::debug!(
            "authorization request ready (mock: {}, url: {url})",
            self.config.is_mock()
        );

        if let BackendMode::Mock { outcome } = self.config.backend {
            mock::simulate_browser(outcome, &redirect_uri, &state, &challenge);
        } else {
            browser::open(&url)?;
        }
        emit(&self.tx, AuthEvent::Progress(Step::AwaitingBrowser));

        let callback = server.wait_for_callback(self.config.auth_timeout)?;
        if callback.state.as_deref() != Some(state.as_str()) {
            log::warn!("the callback did not carry the state we sent");
            return Err(AuthError::StateMismatch);
        }
        if let Some(provider_error) = callback.error {
            log::info!("the provider refused the request: {provider_error}");
            return Err(if provider_error == "access_denied" {
                AuthError::AccessDenied
            } else {
                AuthError::CallbackRejected
            });
        }
        let code = callback.code.ok_or(AuthError::CallbackRejected)?;

        emit(&self.tx, AuthEvent::Progress(Step::Exchanging));
        let session = self.backend.exchange(&ExchangeRequest {
            code,
            redirect_uri,
            code_verifier: verifier,
        })?;
        self.finish(session);
        Ok(())
    }

    fn finish(&self, session: Session) {
        let mock = session.mock;
        let storage = if mock {
            // Mock sessions are never persisted: every launch starts signed out.
            None
        } else {
            match store::save(&session) {
                Ok(()) => None,
                Err(error) => Some(error),
            }
        };
        emit(
            &self.tx,
            AuthEvent::SignedIn {
                session,
                mock,
                storage,
            },
        );
    }

    fn forget(&self, error: AuthError) {
        if let Err(clear_error) = store::clear() {
            log::warn!("could not clear the stored session: {clear_error}");
        }
        emit(&self.tx, AuthEvent::SessionLost(error));
    }
}
