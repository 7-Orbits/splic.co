//! PKCE (RFC 7636) helpers for the authorization code flow.
//!
//! The verifier never leaves the app until the exchange step, and the
//! challenge is what the Gateway (or Google) sees on the authorization
//! request, so a stolen code is useless without it.

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use sha2::{Digest, Sha256};

use super::error::AuthError;

/// Verifier length in characters. RFC 7636 §4.1 allows 43..=128.
const VERIFIER_LEN: usize = 64;

/// The unreserved characters RFC 7636 §4.1 permits in a verifier.
const UNRESERVED: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

/// Random bytes below this value map uniformly onto [`UNRESERVED`] with `%`.
///
/// `184 = 92 * 2`, and `92` is the alphabet length, so every character is
/// produced exactly twice out of the accepted range — no modulo bias.
const REJECT_ABOVE: u8 = 184;

/// Number of random bytes behind a `state` value.
const STATE_BYTES: usize = 32;

/// A fresh, high-entropy code verifier.
pub(crate) fn generate_verifier() -> Result<String, AuthError> {
    let mut verifier = String::with_capacity(VERIFIER_LEN);
    while verifier.len() < VERIFIER_LEN {
        let mut byte = [0_u8; 1];
        getrandom::fill(&mut byte).map_err(random_failure)?;
        let byte = byte[0];
        if byte < REJECT_ABOVE {
            verifier.push(char::from(UNRESERVED[usize::from(byte) % UNRESERVED.len()]));
        }
    }
    Ok(verifier)
}

/// `BASE64URL-ENCODE(SHA256(VERIFIER))` — the S256 challenge.
pub(crate) fn challenge(verifier: &str) -> String {
    URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()))
}

/// A random `state` value that must come back unchanged on the callback.
pub(crate) fn random_state() -> Result<String, AuthError> {
    let mut bytes = [0_u8; STATE_BYTES];
    getrandom::fill(&mut bytes).map_err(random_failure)?;
    Ok(URL_SAFE_NO_PAD.encode(bytes))
}

fn random_failure(error: getrandom::Error) -> AuthError {
    log::error!("secure random source failed: {error}");
    AuthError::RandomSourceUnavailable
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Test vector from RFC 7636 Appendix B.
    const RFC_VERIFIER: &str = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const RFC_CHALLENGE: &str = "E9Melhoa2OwvFrEMTJguCHaoeK118bR01ABnBt6Cbg";

    /// Unwraps a result in test code without tripping `clippy::unwrap_used`.
    fn must<T>(result: Result<T, AuthError>) -> T {
        match result {
            Ok(value) => value,
            Err(error) => panic!("expected success, got {error}"),
        }
    }

    #[test]
    fn s256_matches_the_rfc_vector() {
        assert_eq!(
            challenge(RFC_VERIFIER),
            RFC_CHALLENGE,
            "the S256 transform must match RFC 7636 Appendix B"
        );
    }

    #[test]
    fn generated_verifier_meets_the_rfc_constraints() {
        let verifier = must(generate_verifier());
        assert_eq!(
            verifier.len(),
            VERIFIER_LEN,
            "the verifier must be 43..=128 characters long"
        );
        assert!(
            verifier
                .chars()
                .all(|character| UNRESERVED.contains(&(character as u8))),
            "the verifier may only contain RFC 7636 unreserved characters"
        );
        assert_ne!(
            verifier,
            must(generate_verifier()),
            "two verifiers must not collide"
        );
    }

    #[test]
    fn state_values_are_base64url_and_unique() {
        let state = must(random_state());
        assert_eq!(
            state.len(),
            43,
            "32 random bytes encode to 43 base64url characters without padding"
        );
        assert_ne!(
            state,
            must(random_state()),
            "two state values must not collide"
        );
    }
}
