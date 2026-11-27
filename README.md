# Neon Dash 3D

[![Deploy to GitHub Pages](https://github.com/Syed-Muhammad-Ali-Raza/synthwave-runner-threejs/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Syed-Muhammad-Ali-Raza/synthwave-runner-threejs/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A browser endless runner built with Three.js. The level, character animation, particle effects and audio are generated at runtime, so the project has no build step and no downloaded art or sound files.

## Features

- Three-lane movement with keyboard and touch controls.
- Pooled obstacles, coins and power-ups. Hazard patterns always leave a route through each cluster.
- Four hazard types: low hurdles, tall walls, overhead beams and moving drones.
- Magnet, shield and score-multiplier power-ups with HUD timers.
- Procedural Web Audio sounds and a looping synth bassline.
- High score and mute preference persisted in `localStorage`.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move left | `A` or `Left Arrow` | Swipe left |
| Move right | `D` or `Right Arrow` | Swipe right |
| Jump | `W`, `Up Arrow` or `Space` | Swipe up or tap |
| Slide | `S` or `Down Arrow` | Swipe down |
| Pause or resume | `P` or `Escape` | Pause button |

## Repository layout

```text
index.html              Markup, import map and content security policy
css/
  main.css              Entry point for the stylesheets
  variables.css         Theme tokens
  base.css              Canvas and viewport styles
  hud.css               In-game HUD
  modals.css            Start, pause and game-over screens
  buttons.css           Buttons and key badges
src/
  config.js             Gameplay constants and colours
  audio.js              Web Audio synthesis
  materials.js          Shared Three.js materials
  particles.js          Pooled particle system
  player.js             Player controller and rig animation
  world.js              Road recycling and entity spawning
  main.js               Scene setup, state machine and render loop
scripts/
  verify-site.mjs       Static checks used by CI
.github/workflows/
  ci.yml                Verification checks
  deploy-pages.yml      GitHub Pages deployment
```

## Running locally

ES modules need to be served over HTTP. Use one of the following from the project root:

```bash
npx serve -p 3000
```

```bash
py -m http.server 3000
```

Then open `http://localhost:3000`.

Gameplay values and colours live in [`src/config.js`](src/config.js).

## Deployment

Pushes to `main` run the [`Deploy to GitHub Pages`](.github/workflows/deploy-pages.yml) workflow. The published site is:

<https://syed-muhammad-ali-raza.github.io/synthwave-runner-threejs/>

The workflow publishes only `index.html`, `css/`, `src/` and `.nojekyll`. It uses a least-privilege token, pins third-party actions to commit SHAs, and checks tracked source files for common secret patterns before uploading.

`main` is protected: changes must arrive through a pull request, the `Verify` check must pass, branches must be up to date, and force pushes and branch deletion are blocked.

## Verification

The [`ci.yml`](.github/workflows/ci.yml) workflow runs on pull requests and pushes to `main`. It checks JavaScript syntax, validates local asset references and the CSP import-map hash, and scans tracked source files for secrets. Run the same checks locally with:

```bash
node scripts/verify-site.mjs
```

See [`SECURITY.md`](SECURITY.md) for the security policy and vulnerability reporting instructions.

## Contributing

1. Fork the repository and create a branch from `main`.
2. Make your change and run the game locally.
3. Run `node scripts/verify-site.mjs` before opening a pull request.
4. Open a pull request and make sure the `Verify` check passes.

Keep new assets procedural where practical, reuse the existing object pools, and avoid allocations inside the render loop.

## License

Released under the MIT License. See [`LICENSE`](LICENSE).
