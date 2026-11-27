# Security Policy

## Supported versions

The `main` branch and the latest GitHub Pages deployment receive security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Use GitHub's private vulnerability reporting form for this repository:
[Report a vulnerability](https://github.com/Syed-Muhammad-Ali-Raza/synthwave-runner-threejs/security/advisories/new).

Include reproduction steps, affected files/versions and the impact you observed.
You should receive an acknowledgement within a few days.

## Security practices in this project

- No secrets, API keys or credentials are required to run or deploy the game.
- Runtime dependencies are limited to a version-pinned Three.js CDN module and
  Google Fonts; a Content Security Policy restricts what the page may load and execute.
- DOM updates use safe APIs (`textContent`, `createElement`) rather than `innerHTML`
  with runtime values.
- The deployment workflow deploys only from `main`, uses least-privilege tokens,
  pins every third-party action to an immutable commit SHA and scans tracked
  source files for obvious secret patterns before publishing.
