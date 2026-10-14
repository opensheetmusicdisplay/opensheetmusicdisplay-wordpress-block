# Dependency maintenance

The 1.5.0 plugin uses WordPress Scripts 36.1.0 and Webpack 5.111.1. WordPress
6.3 remains the minimum supported version. All existing block names, saved
attributes, shortcode names and extension exports are preserved.

## Installation and builds

Use Node **24.21.0** and npm **12.2.0**. `.nvmrc`, `engines` and `packageManager`
record those versions; `npm run check:toolchain` verifies the running tools.
For an nvm installation, select Node with `nvm install && nvm use`, then install
the pinned npm version in that selected Node installation if necessary.

```sh
npm ci
npm run build
npm start
```

`package-lock.json` is tracked. Direct registry dependencies have exact versions;
updates are explicit and must include the regenerated lockfile. `npm ci` must
leave that file unchanged. `.npmrc` disables install lifecycle scripts so local
library links cannot run their `prepare` hooks and mutate sibling checkouts.
The explicit build/start commands run their own checks and do not rely on
automatic npm pre/post hooks.

The two sibling repositories must already be installed and built:

- `../opensheetmusicdisplay`, providing `build/opensheetmusicdisplay.min.js`.
- `../pb-deep-link`, providing the endpoint, QR renderer and responsive CSS in
  `dist/`.

This repository's setup command installs only its own dependencies. Manage
sibling installs and builds in their respective repositories.

`library-inputs.json` records sibling Git commits, declared versions and SHA-256
hashes of copied assets. `npm run build` fails when these inputs differ.
`npm start` reports differences and continues with the developer's current
inputs. After reviewing an upstream change and rebuilding the library, use
`npm run inputs:update` and review the manifest diff explicitly.

The manifest fingerprints existing prebuilt assets; it does not prove they were
compiled from the recorded source commit or lockfile. In particular, the existing
PracticeBird bundles predate its current dependency lockfile. A plugin lockfile
does not freeze the source or dependency tree of a `file:` link.

## Package inventory

Registry versions were assessed on 2026-10-13.

| Package                      | Previous locked version     | Updated version                   |
| ---------------------------- | --------------------------- | --------------------------------- |
| `@wordpress/block-editor`    | 5.3.3                       | 18.1.0                            |
| `@wordpress/blocks`          | 6.25.2                      | 16.2.0                            |
| `@wordpress/components`      | Implicit dependency         | 42.0.0                            |
| `@wordpress/compose`         | 3.25.3                      | 8.10.0                            |
| `@wordpress/data`            | Implicit dependency         | 10.57.0                           |
| `@wordpress/element`         | 2.20.3                      | 9.0.0                             |
| `@wordpress/hooks`           | 2.12.3                      | 4.57.0                            |
| `@wordpress/i18n`            | 3.20.0                      | 6.30.0                            |
| `@wordpress/icons`           | Implicit dependency         | 18.0.0                            |
| `@wordpress/scripts`         | 13.0.3                      | 36.1.0                            |
| Dependency extraction plugin | 3.4.1                       | 6.57.0                            |
| `webpack`                    | 4.47.0                      | 5.111.1                           |
| `webpack-cli`                | 4.10.0                      | 7.2.3                             |
| `copy-webpack-plugin`        | 6.4.1                       | 14.0.0                            |
| `npm-run-all`                | 4.1.5                       | Replaced by `npm-run-all2` 9.0.3  |
| React / ReactDOM             | Implicit, mixed versions    | Explicit development peers 19.3.0 |
| OSMD                         | Local 2.2.1                 | Local 2.2.1                       |
| PracticeBird                 | Local, unversioned manifest | Same local link                   |

WordPress packages and React are development dependencies. Browser code uses
WordPress's registered globals rather than a second React implementation.
WordPress 6.3–6.5 gets a small JSX adapter using public React APIs; newer
WordPress retains its native `react-jsx-runtime` handle. Generated `.asset.php`
files provide dependencies for editor scripts, shared exports and auxiliary
bundles. PHP adds the existing extension prerequisites and explicit versions.

Direct Babel packages, `babel-loader`, TypeScript, `ts-loader`, Node typings and
ResizeObserver typings were removed. The plugin has no TypeScript source to
compile. All builds reuse WordPress Scripts' Babel rules; its supported Babel 7,
loader 9 and TypeScript 6 tooling remains transitive. Babel 8 and TypeScript 7
are newer major releases, but forcing them into that upstream toolchain is not a
supported upgrade. Unused TypeScript configuration remains available for IDEs;
the hook declaration now derives its type from public `createHooks`.

## Security policy and overrides

The original 2,223-entry lockfile audit reported 165 vulnerable package entries:
5 critical, 86 high, 65 moderate and 9 low. Counts include packages inheriting
findings from their dependencies and do not describe browser exploitability.

The upgraded plugin lockfile audit reports **26 high entries, zero critical**.
Every remaining finding traces to the single
[unpatched braces advisory GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
The concrete path includes `@wordpress/scripts → fast-glob → micromatch → braces`,
with additional paths through Stylelint and development-server tooling. This
code processes trusted project glob patterns during local development/builds;
it is not included in the plugin's shipped browser bundles. The exception does
not permit processing untrusted patterns in a public build service.

`npm run audit:check` examines the full audit, resolves inherited advisory
ancestry and checks each affected node's locked development flag. It rejects
critical findings, production exposure, unknown ancestry, registry failures and
any other advisory, including a new advisory in an already allowed package.
The exception is limited to the exact advisory URL and is reviewed during every
dependency refresh. Remove it when a supported patched dependency becomes
available; security checks must continue to report the actual audit counts.

| Override                                 | Reason                                         |
| ---------------------------------------- | ---------------------------------------------- |
| WordPress Scripts → copy plugin 14.0.0   | Remove its older glob/serialization chain      |
| `postcss-selector-parser` 7.1.6          | Patched selector parsing; verify generated CSS |
| Markdownlint CLI → `js-yaml` 5.4.3       | Patched merge parsing                          |
| Markdownlint CLI → `smol-toml` 1.9.1     | Patched key parsing                            |
| Micromark math → KaTeX 0.19.0            | Patched trust handling                         |
| WordPress Scripts → SockJS → UUID 11.1.1 | Patched buffer handling with CommonJS support  |

The SockJS override is scoped to WordPress Scripts so it does not constrain
the linked OSMD checkout. Use explicit upgrades and reviewed overrides rather
than `npm audit fix --force` or relaxed peer resolution. Retain these overrides
until their owning packages adopt compatible patched dependencies.

Some upstream tooling still installs deprecated packages, including ESLint 9
alongside the ESLint 10 CLI, `glob` 7, `inflight` and `abab`. Their presence is
recorded separately from advisory coverage; dependency-tree resolution alone
does not establish behavioral compatibility.

## Required upstream work

These repositories were read and audited separately; their files were not
changed by this upgrade. Plugin overrides cannot repair copied compiled code.

- **PracticeBird:** its production audit reports 15 entries, mostly build tools
  declared as runtime dependencies. The browser-relevant
  `query-string → decode-uri-component` chain needs an upstream update to
  `query-string` 9.5.1 and a fresh endpoint build using the patched decoder.
  [Decoder advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr).
  The provenance of the current prebuilt bundle also needs reconciliation before
  claiming it is cleared.
- **UAParser:** the inspected PracticeBird lockfile's 1.0.40 release was not
  flagged by this audit. Latest 2.0.10 changes to AGPL licensing; handle that
  migration upstream rather than forcing it into this plugin.
  [UAParser migration](https://docs.uaparser.dev/intro/whats-new.html).
- **OSMD:** assess JSZip 3.10.2 upstream. Moving from its patched VexFlow 1.2.93
  to VexFlow 5 requires an OSMD migration. Its two production-audit findings
  concern `tar-fs` and `undici` in native installation tooling, rather than
  identified browser dependencies.

## Validation

After building, use `npm run test:checks`, `npm run audit:check`, `npm run check:artifacts` and
`npm ls --all` for the focused checks. The artifact check verifies metadata paths,
script dependencies, shared extension exports, absence of a bundled React
implementation and byte-identical copies of the recorded renderer assets.

Validated with Node 24.21.0 / npm 12.2.0:

- A clean `npm ci` left the lockfile hash unchanged; `npm ls --all` reported no
  invalid peers, and the full production build and artifact checks passed.
- All eight focused audit-policy and JSX-runtime tests passed, as did linting
  of the new/changed toolchain JavaScript. All five PHP files passed syntax checks.
- The development watcher completed its initial compilation and retained the
  renderer, exported library and fallback runtime assets. It still logs that
  PracticeBird's upstream package manifest has no name; that manifest was not
  modified.
- Thirteen browser checks passed on each of WordPress 7.1.3 at localhost:8888
  and an isolated WordPress 6.3 installation. They covered iframe assets, media
  selection, score/Braille rendering, sizing, QR/icon modes, save/reopen,
  frontend blocks and both shortcodes, removal, missing-library recovery,
  pending-load cleanup and the Site Editor. There were no plugin rendering
  errors or deprecations; the current site's known core global-styles warning
  remains separate.
- A further WordPress 6.3 DOM probe verified the fallback's real refs, children,
  fragments and key precedence. Current WordPress retained its native JSX
  script; the fallback loaded only on 6.3. Frontend rendering passed without
  the editor controls being loaded.

The browser runs used temporary draft fixtures. Their posts were cleaned up,
the existing premium extension's original active state was restored, and the
test session and isolated 6.3 site were removed after validation.

The full JavaScript/CSS lint commands report existing style and source debt.
The pre-upgrade JavaScript command crashed in its formatter dependency, and the
CSS command already reported violations. The updated commands produce reports;
new toolchain files have a separate passing focused lint check. No broad source
formatting or unrelated lint cleanup is part of this update.

Webpack still reports the size of the existing 1.4 MiB OSMD renderer against its
244 KiB performance recommendation. Optimizing that upstream bundle is separate
work. The documented WordPress global-styles iframe warning also remains a core
issue; the plugin does not suppress it.
