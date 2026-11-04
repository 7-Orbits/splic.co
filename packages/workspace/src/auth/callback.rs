//! Loopback listener for the Google redirect.
//!
//! A desktop app cannot register a custom URL scheme without installer
//! changes, so each sign-in attempt binds an ephemeral port on `127.0.0.1`
//! and hands that as the redirect URI. Only local connections are accepted,
//! `state` is checked before anything else happens, and the listener is
//! dropped as soon as one attempt finishes.

use std::io::{BufRead, BufReader, ErrorKind, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::{Duration, Instant};

use super::error::AuthError;

/// How long a single browser connection may take to send its request line.
const READ_TIMEOUT: Duration = Duration::from_secs(5);

/// How often the listener polls while waiting for the browser.
const POLL_INTERVAL: Duration = Duration::from_millis(50);

/// A single sign-in callback, as parsed off the wire.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Callback {
    pub(crate) code: Option<String>,
    pub(crate) state: Option<String>,
    pub(crate) error: Option<String>,
}

impl Callback {
    /// `true` when the browser reported a definite outcome (code or error).
    fn is_outcome(&self) -> bool {
        self.code.is_some() || self.error.is_some()
    }
}

/// A one-shot listener bound to an ephemeral loopback port.
pub(crate) struct CallbackServer {
    listener: TcpListener,
    port: u16,
}

impl CallbackServer {
    /// Bind `127.0.0.1:0` and let the OS pick a free port.
    pub(crate) fn start() -> Result<Self, AuthError> {
        let listener = TcpListener::bind(("127.0.0.1", 0)).map_err(|error| {
            log::error!("could not bind a loopback port for the sign-in callback: {error}");
            AuthError::CallbackUnavailable
        })?;
        let port = listener
            .local_addr()
            .map_err(|error| {
                log::error!("could not inspect the sign-in callback listener: {error}");
                AuthError::CallbackUnavailable
            })?
            .port();
        Ok(Self { listener, port })
    }

    /// The redirect URI for this sign-in attempt.
    pub(crate) fn redirect_uri(&self) -> String {
        format!("http://127.0.0.1:{}/callback", self.port)
    }

    /// Block until the browser reports back, or `timeout` elapses.
    ///
    /// The listener is non-blocking (sockets have no accept timeout), so the
    /// wait is a short sleep loop against a deadline. Requests for anything
    /// other than the callback path — a favicon, a port scan — are answered
    /// and ignored, so the wait continues.
    pub(crate) fn wait_for_callback(self, timeout: Duration) -> Result<Callback, AuthError> {
        self.listener.set_nonblocking(true).map_err(|error| {
            log::error!("could not configure the sign-in callback listener: {error}");
            AuthError::CallbackUnavailable
        })?;
        let deadline = Instant::now() + timeout;
        loop {
            match self.listener.accept() {
                Ok((stream, address)) => {
                    log::debug!("sign-in callback connection from {address}");
                    if let Some(callback) = handle(stream) {
                        if callback.is_outcome() {
                            return Ok(callback);
                        }
                    }
                }
                Err(error)
                    if matches!(error.kind(), ErrorKind::WouldBlock | ErrorKind::TimedOut) =>
                {
                    if Instant::now() >= deadline {
                        return Err(AuthError::CallbackTimeout);
                    }
                    thread::sleep(POLL_INTERVAL);
                }
                Err(error) => {
                    log::error!("the sign-in callback listener failed: {error}");
                    return Err(AuthError::CallbackUnavailable);
                }
            }
        }
    }
}

/// Read one request, answer it, and return its callback query if it was one.
fn handle(mut stream: TcpStream) -> Option<Callback> {
    stream.set_read_timeout(Some(READ_TIMEOUT)).ok()?;
    let request_line = {
        let mut reader = BufReader::new(&stream);
        let mut line = String::new();
        reader.read_line(&mut line).ok()?;
        line
    };

    let target = request_line.split_whitespace().nth(1)?;
    let (path, query) = target.split_once('?').unwrap_or((target, ""));
    if path.starts_with("/callback") {
        respond(&mut stream, "200 OK", SUCCESS_PAGE);
        Some(parse_query(query))
    } else {
        respond(&mut stream, "404 Not Found", NOT_FOUND_PAGE);
        None
    }
}

fn respond(stream: &mut TcpStream, status: &str, body: &str) {
    let head = format!(
        "HTTP/1.1 {status}\r\n\
         Content-Type: text/html; charset=utf-8\r\n\
         Content-Length: {}\r\n\
         Connection: close\r\n\r\n",
        body.len()
    );
    let outcome = stream
        .write_all(head.as_bytes())
        .and_then(|()| stream.write_all(body.as_bytes()));
    if let Err(error) = outcome {
        log::debug!("could not answer the browser: {error}");
    }
}

fn parse_query(query: &str) -> Callback {
    let pairs = query
        .split('&')
        .filter(|pair| !pair.is_empty())
        .map(|pair| {
            let (key, value) = pair.split_once('=').unwrap_or((pair, ""));
            (percent_decode(key), percent_decode(value))
        })
        .collect::<Vec<(String, String)>>();
    Callback {
        code: param(&pairs, "code").map(str::to_owned),
        state: param(&pairs, "state").map(str::to_owned),
        error: param(&pairs, "error").map(str::to_owned),
    }
}

fn param<'a>(pairs: &'a [(String, String)], name: &str) -> Option<&'a str> {
    pairs
        .iter()
        .find(|(key, _)| key == name)
        .map(|(_, value)| value.as_str())
}

/// Decode a `application/x-www-form-urlencoded` component.
fn percent_decode(input: &str) -> String {
    let raw = input.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(raw.len());
    let mut index = 0;
    while index < raw.len() {
        match raw[index] {
            b'%' if index + 2 < raw.len() => match (hex(raw[index + 1]), hex(raw[index + 2])) {
                (Some(high), Some(low)) => {
                    out.push((high << 4) | low);
                    index += 3;
                }
                _ => {
                    out.push(b'%');
                    index += 1;
                }
            },
            b'+' => {
                out.push(b' ');
                index += 1;
            }
            byte => {
                out.push(byte);
                index += 1;
            }
        }
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn hex(byte: u8) -> Option<u8> {
    char::from(byte).to_digit(16).map(|digit| digit as u8)
}

const SUCCESS_PAGE: &str = r#"<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Splic — signed in</title></head>
<body style="margin:0;background:#08090a;color:#f7f8f8;font:15px/1.6 system-ui,sans-serif;display:grid;place-items:center;height:100vh">
  <p>You're signed in. You can close this tab and return to Splic.</p>
</body>
</html>"#;

const NOT_FOUND_PAGE: &str = r#"<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Splic</title></head>
<body style="margin:0;background:#08090a;color:#8a8f98;font:15px/1.6 system-ui,sans-serif;display:grid;place-items:center;height:100vh">
  <p>Nothing here. Return to the Splic app to finish signing in.</p>
</body></html>"#;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_a_complete_callback() {
        let callback = parse_query("code=abc-123&state=xyz&scope=openid");
        assert_eq!(callback.code.as_deref(), Some("abc-123"), "code must parse");
        assert_eq!(callback.state.as_deref(), Some("xyz"), "state must parse");
        assert_eq!(callback.error, None, "there is no error parameter");
        assert!(callback.is_outcome(), "a code is a definite outcome");
    }

    #[test]
    fn parses_an_error_callback() {
        let callback = parse_query("error=access_denied&state=xyz");
        assert_eq!(
            callback.error.as_deref(),
            Some("access_denied"),
            "the provider error must parse"
        );
        assert_eq!(callback.code, None, "there is no code parameter");
    }

    #[test]
    fn decodes_percent_escapes() {
        assert_eq!(
            percent_decode("a%20b%2Bc"),
            "a b+c",
            "percent escapes must decode to their bytes"
        );
        assert_eq!(
            percent_decode("%zz"),
            "%zz",
            "an invalid escape must be left alone"
        );
        assert_eq!(
            parse_query("code=").code,
            None,
            "an empty value counts as absent"
        );
    }
}
