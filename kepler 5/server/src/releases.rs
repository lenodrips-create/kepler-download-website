//! The Kepler release manifest.
//!
//! This is the single source of truth for what the download page offers.
//! Nothing is downloadable until a build here has `available: true` *and* a
//! checksum, so an artifact can never ship un-verified by accident.

use std::fmt;

/// Operating systems we publish for.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Platform {
    Linux,
    MacOs,
    Windows,
    Source,
}

impl Platform {
    pub fn slug(self) -> &'static str {
        match self {
            Platform::Linux => "linux",
            Platform::MacOs => "macos",
            Platform::Windows => "windows",
            Platform::Source => "source",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Platform::Linux => "Linux",
            Platform::MacOs => "macOS",
            Platform::Windows => "Windows",
            Platform::Source => "Source tarball",
        }
    }
}

impl fmt::Display for Platform {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.slug())
    }
}

/// CPU architectures a build targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Arch {
    X86_64,
    Arm64,
    Any,
}

impl Arch {
    pub fn slug(self) -> &'static str {
        match self {
            Arch::X86_64 => "x86_64",
            Arch::Arm64 => "arm64",
            Arch::Any => "any",
        }
    }
}

/// One publishable build.
#[derive(Debug, Clone)]
pub struct Build {
    pub platform: Platform,
    pub note: &'static str,
    pub arches: &'static [Arch],
    /// File name template; `{arch}` is substituted per architecture.
    pub file: Option<&'static str>,
    pub size: Option<&'static str>,
    pub sha256: Option<&'static str>,
    /// Set to `true` once the artifact is actually on disk.
    pub available: bool,
}

impl Build {
    /// A build is only offered when it exists *and* we can prove what it is.
    pub fn is_downloadable(&self) -> bool {
        self.available && self.file.is_some() && self.sha256.is_some()
    }

    pub fn file_name(&self, arch: Arch) -> Option<String> {
        self.file.map(|f| f.replace("{arch}", arch.slug()))
    }
}

/// The published manifest.
#[derive(Debug, Clone)]
pub struct Manifest {
    pub version: &'static str,
    pub channel: &'static str,
    pub released: &'static str,
    pub builds: Vec<Build>,
}

/// Edit this function to publish a release.
///
/// Set `available: true` and fill in `file`, `size` and `sha256` for each
/// build. The website picks the change up on the next request; there is no
/// database and nothing to migrate.
pub fn manifest() -> Manifest {
    Manifest {
        version: "0.9.0",
        channel: "beta",
        released: "2026-09-22",
        builds: vec![
            Build {
                platform: Platform::Linux,
                note: "glibc 2.31+ · tar.zst",
                arches: &[Arch::X86_64, Arch::Arm64],
                file: None,   // "kepler-0.9.0-linux-{arch}.tar.zst"
                size: None,   // "96.4 MB"
                sha256: None, // "3f1a…"
                available: false,
            },
            Build {
                platform: Platform::MacOs,
                note: "13 Ventura or newer · notarised .dmg",
                arches: &[Arch::Arm64, Arch::X86_64],
                file: None,
                size: None,
                sha256: None,
                available: false,
            },
            Build {
                platform: Platform::Windows,
                note: "10 and 11 · signed .msi",
                arches: &[Arch::X86_64, Arch::Arm64],
                file: None,
                size: None,
                sha256: None,
                available: false,
            },
            Build {
                platform: Platform::Source,
                note: "Build it yourself · tar.gz + .asc",
                arches: &[Arch::Any],
                file: None,
                size: None,
                sha256: None,
                available: false,
            },
        ],
    }
}

/// Escape a string for embedding in JSON.
fn esc(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out
}

fn json_str(value: Option<&str>) -> String {
    match value {
        Some(v) => format!("\"{}\"", esc(v)),
        None => "null".to_string(),
    }
}

impl Manifest {
    /// Serialise to the exact shape `assets/js/downloads.js` expects.
    ///
    /// Hand-rolled rather than pulled from a crate: it is twenty lines, it has
    /// no supply chain, and the output is stable.
    pub fn to_json(&self) -> String {
        let mut out = String::from("{\n");
        out.push_str(&format!("  \"version\": \"{}\",\n", esc(self.version)));
        out.push_str(&format!("  \"channel\": \"{}\",\n", esc(self.channel)));
        out.push_str(&format!("  \"released\": \"{}\",\n", esc(self.released)));
        out.push_str("  \"builds\": [\n");

        for (i, b) in self.builds.iter().enumerate() {
            let arches = b
                .arches
                .iter()
                .map(|a| format!("\"{}\"", a.slug()))
                .collect::<Vec<_>>()
                .join(", ");

            out.push_str("    {\n");
            out.push_str(&format!("      \"os\": \"{}\",\n", b.platform.slug()));
            out.push_str(&format!("      \"label\": \"{}\",\n", esc(b.platform.label())));
            out.push_str(&format!("      \"note\": \"{}\",\n", esc(b.note)));
            out.push_str(&format!("      \"arches\": [{}],\n", arches));
            out.push_str(&format!("      \"file\": {},\n", json_str(b.file)));
            out.push_str(&format!("      \"size\": {},\n", json_str(b.size)));
            out.push_str(&format!("      \"sha256\": {},\n", json_str(b.sha256)));
            out.push_str(&format!("      \"available\": {}\n", b.is_downloadable()));
            out.push_str(if i + 1 == self.builds.len() { "    }\n" } else { "    },\n" });
        }

        out.push_str("  ]\n}");
        out
    }

    /// A one-line summary for the startup banner.
    pub fn summary(&self) -> String {
        let ready = self.builds.iter().filter(|b| b.is_downloadable()).count();
        format!(
            "v{} {} · {}/{} builds publishable",
            self.version,
            self.channel,
            ready,
            self.builds.len()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nothing_ships_without_a_checksum() {
        let m = manifest();
        for b in &m.builds {
            if b.sha256.is_none() {
                assert!(!b.is_downloadable(), "{} would ship unverified", b.platform);
            }
        }
    }

    #[test]
    fn json_contains_every_build() {
        let json = manifest().to_json();
        for b in &manifest().builds {
            assert!(json.contains(b.platform.slug()));
        }
    }

    #[test]
    fn arch_substitution_works() {
        let b = Build {
            platform: Platform::Linux,
            note: "",
            arches: &[Arch::X86_64],
            file: Some("kepler-0.9.0-linux-{arch}.tar.zst"),
            size: None,
            sha256: None,
            available: false,
        };
        assert_eq!(
            b.file_name(Arch::X86_64).unwrap(),
            "kepler-0.9.0-linux-x86_64.tar.zst"
        );
    }
}
