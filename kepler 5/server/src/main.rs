//! kepler-releases — the tiny server behind the Kepler website.
//!
//! Serves the static site and one JSON endpoint, `/api/releases`, which the
//! download page reads to decide what it can offer. No dependencies, no
//! framework, no async runtime: a thread per connection and about three
//! hundred lines you can read in a sitting.
//!
//!     cargo run -p kepler-releases -- --serve 8080 --root ./site
//!
//! Security notes:
//!   * Paths are normalised and any `..` segment is rejected outright.
//!   * Only files inside `--root` are ever opened.
//!   * Request lines and header blocks are length-capped.
//!   * The server sets strict headers; it never sets a cookie.

mod releases;

use std::collections::HashMap;
use std::fs;
use std::io::{BufReader, BufWriter, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Component, Path, PathBuf};
use std::thread;

const MAX_REQUEST_LINE: usize = 8 * 1024;
const MAX_HEADER_BYTES: usize = 32 * 1024;

fn main() {
    let cfg = match Config::from_args(std::env::args().skip(1)) {
        Ok(cfg) => cfg,
        Err(msg) => {
            eprintln!("kepler-releases: {msg}\n");
            eprintln!("{}", USAGE);
            std::process::exit(2);
        }
    };

    if cfg.help {
        println!("{}", USAGE);
        return;
    }

    let manifest = releases::manifest();

    if cfg.print_manifest {
        println!("{}", manifest.to_json());
        return;
    }

    if !cfg.root.is_dir() {
        eprintln!(
            "kepler-releases: root {} is not a directory",
            cfg.root.display()
        );
        std::process::exit(1);
    }

    let addr = format!("127.0.0.1:{}", cfg.port);
    let listener = match TcpListener::bind(&addr) {
        Ok(l) => l,
        Err(e) => {
            eprintln!("kepler-releases: cannot bind {addr}: {e}");
            std::process::exit(1);
        }
    };

    println!("  kepler-releases");
    println!("  root     {}", cfg.root.display());
    println!("  manifest {}", manifest.summary());
    println!("  serving  http://{addr}");

    // Name every artifact the manifest is prepared to hand out. An empty list
    // here means the download page will render but every button stays inert.
    let ready: Vec<String> = manifest
        .builds
        .iter()
        .filter(|b| b.is_downloadable())
        .flat_map(|b| b.arches.iter().filter_map(move |a| b.file_name(*a)))
        .collect();

    if ready.is_empty() {
        println!("  artifacts none attached yet - downloads are disabled");
    } else {
        for name in &ready {
            println!("  artifact {name}");
        }
    }

    println!("  ctrl-c to stop\n");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                let root = cfg.root.clone();
                thread::spawn(move || {
                    if let Err(e) = handle(stream, &root) {
                        eprintln!("  connection error: {e}");
                    }
                });
            }
            Err(e) => eprintln!("  accept failed: {e}"),
        }
    }
}

const USAGE: &str = "\
usage: kepler-releases [--serve PORT] [--root DIR] [--manifest] [--help]

  --serve PORT   port to listen on (default 8080)
  --root DIR     directory containing the website (default .)
  --manifest     print the release manifest as JSON and exit
  --help         show this message";

struct Config {
    port: u16,
    root: PathBuf,
    print_manifest: bool,
    help: bool,
}

impl Config {
    fn from_args<I: Iterator<Item = String>>(mut args: I) -> Result<Config, String> {
        let mut cfg = Config {
            port: 8080,
            root: PathBuf::from("."),
            print_manifest: false,
            help: false,
        };

        while let Some(arg) = args.next() {
            match arg.as_str() {
                "--serve" | "-p" => {
                    let raw = args.next().ok_or("--serve needs a port")?;
                    cfg.port = raw.parse().map_err(|_| format!("bad port: {raw}"))?;
                }
                "--root" | "-r" => {
                    cfg.root = PathBuf::from(args.next().ok_or("--root needs a directory")?);
                }
                "--manifest" => cfg.print_manifest = true,
                "--help" | "-h" => cfg.help = true,
                other => return Err(format!("unknown argument: {other}")),
            }
        }

        Ok(cfg)
    }
}

/* -------------------------------------------------------------------------- */
/*  Request handling                                                          */
/* -------------------------------------------------------------------------- */

fn handle(stream: TcpStream, root: &Path) -> std::io::Result<()> {
    stream.set_read_timeout(Some(std::time::Duration::from_secs(10)))?;
    let peer_ok = stream.try_clone()?;
    let mut reader = BufReader::new(stream);
    let mut writer = BufWriter::new(peer_ok);

    let (method, target) = match read_request(&mut reader) {
        Some(parts) => parts,
        None => {
            respond(&mut writer, 400, "text/plain; charset=utf-8", b"bad request")?;
            return Ok(());
        }
    };

    if method != "GET" && method != "HEAD" {
        respond(&mut writer, 405, "text/plain; charset=utf-8", b"method not allowed")?;
        return Ok(());
    }

    // Strip any query string; this server has no query parameters.
    let path = target.split('?').next().unwrap_or("/");

    if path == "/api/releases" {
        let body = releases::manifest().to_json();
        return respond(&mut writer, 200, "application/json; charset=utf-8", body.as_bytes());
    }

    if path == "/api/health" {
        return respond(&mut writer, 200, "application/json; charset=utf-8", b"{\"ok\":true}");
    }

    match resolve(root, path) {
        Some(file) => match fs::read(&file) {
            Ok(bytes) => respond(&mut writer, 200, mime_for(&file), &bytes),
            Err(_) => respond(&mut writer, 404, "text/html; charset=utf-8", NOT_FOUND),
        },
        None => respond(&mut writer, 404, "text/html; charset=utf-8", NOT_FOUND),
    }
}

/// Read the request line and drain the header block, with hard size caps.
fn read_request(reader: &mut BufReader<TcpStream>) -> Option<(String, String)> {
    let mut line = Vec::new();
    let mut byte = [0u8; 1];
    let mut total = 0usize;

    // Request line.
    loop {
        if reader.read(&mut byte).ok()? == 0 {
            return None;
        }
        total += 1;
        if total > MAX_REQUEST_LINE {
            return None;
        }
        if byte[0] == b'\n' {
            break;
        }
        if byte[0] != b'\r' {
            line.push(byte[0]);
        }
    }

    let line = String::from_utf8(line).ok()?;
    let mut parts = line.split_whitespace();
    let method = parts.next()?.to_string();
    let target = parts.next()?.to_string();

    // Drain headers so the client doesn't see a reset while still writing.
    let mut header_bytes = 0usize;
    let mut blank = 0usize;
    loop {
        if reader.read(&mut byte).ok()? == 0 {
            break;
        }
        header_bytes += 1;
        if header_bytes > MAX_HEADER_BYTES {
            return None;
        }
        match byte[0] {
            b'\n' => {
                blank += 1;
                if blank == 2 {
                    break;
                }
            }
            b'\r' => {}
            _ => blank = 0,
        }
    }

    Some((method, target))
}

/// Map a URL path to a file inside `root`, refusing anything that escapes it.
fn resolve(root: &Path, url_path: &str) -> Option<PathBuf> {
    let decoded = percent_decode(url_path);
    let trimmed = decoded.trim_start_matches('/');

    let mut safe = PathBuf::new();
    for component in Path::new(trimmed).components() {
        match component {
            Component::Normal(part) => safe.push(part),
            // Anything else — .., /, C:\, a symlinked prefix — is refused.
            _ => return None,
        }
    }

    let mut candidate = root.join(&safe);

    if candidate.is_dir() {
        candidate = candidate.join("index.html");
    }

    // Extensionless URLs get an .html try, so /docs serves docs.html.
    if !candidate.exists() && candidate.extension().is_none() {
        let with_html = candidate.with_extension("html");
        if with_html.is_file() {
            candidate = with_html;
        }
    }

    // Final containment check against the canonical root.
    let real_root = fs::canonicalize(root).ok()?;
    let real_file = fs::canonicalize(&candidate).ok()?;
    if !real_file.starts_with(&real_root) {
        return None;
    }
    if !real_file.is_file() {
        return None;
    }

    Some(real_file)
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    let mut i = 0;

    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            let hex = std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or("");
            if let Ok(v) = u8::from_str_radix(hex, 16) {
                out.push(v);
                i += 3;
                continue;
            }
        }
        out.push(bytes[i]);
        i += 1;
    }

    String::from_utf8_lossy(&out).into_owned()
}

fn mime_for(path: &Path) -> &'static str {
    let table: HashMap<&str, &str> = [
        ("html", "text/html; charset=utf-8"),
        ("css", "text/css; charset=utf-8"),
        ("js", "text/javascript; charset=utf-8"),
        ("mjs", "text/javascript; charset=utf-8"),
        ("json", "application/json; charset=utf-8"),
        ("svg", "image/svg+xml"),
        ("png", "image/png"),
        ("jpg", "image/jpeg"),
        ("jpeg", "image/jpeg"),
        ("webp", "image/webp"),
        ("ico", "image/x-icon"),
        ("woff2", "font/woff2"),
        ("txt", "text/plain; charset=utf-8"),
        ("zst", "application/zstd"),
        ("gz", "application/gzip"),
        ("dmg", "application/octet-stream"),
        ("msi", "application/octet-stream"),
        ("asc", "text/plain; charset=utf-8"),
    ]
    .into_iter()
    .collect();

    path.extension()
        .and_then(|e| e.to_str())
        .and_then(|e| table.get(e.to_ascii_lowercase().as_str()).copied())
        .unwrap_or("application/octet-stream")
}

fn respond(
    writer: &mut BufWriter<TcpStream>,
    status: u16,
    content_type: &str,
    body: &[u8],
) -> std::io::Result<()> {
    let reason = match status {
        200 => "OK",
        400 => "Bad Request",
        404 => "Not Found",
        405 => "Method Not Allowed",
        _ => "Error",
    };

    let head = format!(
        "HTTP/1.1 {status} {reason}\r\n\
         Content-Type: {content_type}\r\n\
         Content-Length: {len}\r\n\
         X-Content-Type-Options: nosniff\r\n\
         Referrer-Policy: no-referrer\r\n\
         Cross-Origin-Opener-Policy: same-origin\r\n\
         Connection: close\r\n\
         \r\n",
        len = body.len()
    );

    writer.write_all(head.as_bytes())?;
    writer.write_all(body)?;
    writer.flush()
}

const NOT_FOUND: &[u8] = b"<!doctype html><meta charset=utf-8>\
<title>404 - lost in space</title>\
<body style=\"background:#000;color:#fff;font:16px/1.6 system-ui;\
display:grid;place-items:center;height:100vh;margin:0;text-align:center\">\
<div><h1 style=\"font-weight:400;letter-spacing:-.03em\">404</h1>\
<p style=\"opacity:.6\">Nothing in this orbit.</p>\
<p><a href=\"/\" style=\"color:#fff\">Back to Kepler</a></p></div>";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn traversal_is_refused() {
        assert!(resolve(Path::new("."), "/../../etc/passwd").is_none());
        assert!(resolve(Path::new("."), "/%2e%2e/%2e%2e/etc/passwd").is_none());
    }

    #[test]
    fn percent_decoding_works() {
        assert_eq!(percent_decode("/a%20b.html"), "/a b.html");
        assert_eq!(percent_decode("/plain"), "/plain");
    }

    #[test]
    fn mime_lookup() {
        assert_eq!(mime_for(Path::new("a/b.css")), "text/css; charset=utf-8");
        assert_eq!(mime_for(Path::new("x.unknown")), "application/octet-stream");
    }
}
