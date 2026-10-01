# ⚡ Neon Dash 3D - Low-Poly Synthwave Endless Runner

[![Three.js](https://img.shields.io/badge/Three.js-r160-00f0ff?style=for-the-badge&logo=three.js&logoColor=black)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-ff2a85?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffe600?style=for-the-badge)](LICENSE)

A high-performance, polished, retro synthwave 3D endless runner built using **Three.js** and procedural **Web Audio API**. Zero external build tools, zero asset dependencies — all 3D geometries, materials, animations, and sound effects are generated dynamically in the browser.

---

## 🎮 Gameplay & Features

- **Procedural Low-Poly Runner**: Articulated character with speed-synchronized arm/leg swings, lateral banking lean, squash & stretch jump kinematics, and tucked slide poses.
- **Fair Procedural World Spawner**: Dynamic 3-lane road recycling with guaranteed survivable hazard patterns and rewarding coin arcs over jumpable barriers.
- **Dynamic Hazard Types**:
  - 🔻 **Low Hurdles**: Can be jumped over or dodged.
  - 🏢 **Tall Walls**: Require timely lane switching.
  - ⚡ **High Laser Beams**: Require sliding underneath.
  - 🛸 **Moving Drones**: Slide laterally between lanes at higher speeds.
- **Power-Up System**:
  - 🧲 **Coin Magnet** (8s): Pulls nearby coins into the player.
  - 🛡️ **Neon Energy Shield** (15s): Absorbs one lethal collision.
  - ⚡ **2X Score Multiplier** (10s): Doubles point accumulation.
- **Zero-Asset Procedural Audio Engine**: Web Audio API sound synthesis with synthesized coin blips, jump whooshes, landing thuds, crash noise explosions, and an evolving retro synthwave bassline.
- **High-Performance Architecture**: Zero-allocation collision loops, pre-allocated `THREE.Points` particle manager, and frame-rate-independent delta physics (steady 60 FPS).
- **Glassmorphic Responsive UI**: Touch swipes and keyboard controls, score pop animations, power-up cooldown meters, pause overlay, and `localStorage` high-score persistence.

---

## 🕹️ Controls

| Action | Keyboard | Touch / Mobile |
|---|---|---|
| **Move Left** | `A` or `◄ Left Arrow` | Swipe Left |
| **Move Right** | `D` or `► Right Arrow` | Swipe Right |
| **Jump** | `W` or `▲ Up Arrow` or `Space` | Swipe Up / Tap |
| **Slide** | `S` or `▼ Down Arrow` | Swipe Down |
| **Pause / Resume** | `P` or `Escape` | Pause Button (Top-Right) |

---

## 📁 Project Structure

```
neon-dash-3d/
├── index.html           # Main HTML entry and UI overlay markup
├── css/
│   ├── main.css         # Root stylesheet importing all CSS modules
│   ├── variables.css    # Synthwave theme colors, glows, and typography
│   ├── base.css         # Canvas container, resets, and viewport locks
│   ├── hud.css          # In-game HUD cards, coin counters, and power-up meters
│   ├── modals.css       # Start menu, pause screen, and game-over modals
│   └── buttons.css      # Interactive buttons and control badges
├── src/
│   ├── config.js        # Global configuration, speeds, physics, and colors
│   ├── audio.js         # Procedural Web Audio API sound FX and synth music
│   ├── materials.js     # Shared GPU materials for low-poly synthwave rendering
│   ├── particles.js     # Object-pooled particle systems (sparks, dust, explosions)
│   ├── player.js        # Kinematic player controller, rigging, and animation state
│   ├── world.js         # Infinite road recycling, scenery generation, and hazard pools
│   └── main.js          # Three.js setup, game state machine, and render loop
└── .agents/skills/      # Antigravity development skills for 3D games & animation
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Syed-Muhammad-Ali-Raza/synthwave-runner-threejs
cd synthwave-runner-threejs
```

### 2. Run Locally

Since the project uses standard ES Modules (`import`/`export`), it should be served via any local HTTP server:

**Using Node / npx:**
```bash
npx serve -p 3000
```

**Using Python:**
```bash
python -m http.server 3000
```

**Using VS Code:**
Install the **Live Server** extension and click **"Go Live"**.

Open your browser at `http://localhost:3000`.

---

## ⚙️ Customization & Tuning

All gameplay metrics, speeds, and aesthetic palettes can be tuned in [`src/config.js`](src/config.js):

```javascript
export const CONFIG = {
  laneWidth: 2.2,          // Distance between lanes
  baseSpeed: 19.0,         // Starting speed
  maxSpeed: 44.0,          // Maximum speed cap
  speedAccel: 0.35,        // Speed gain per second
  gravity: 42.0,           // Jump gravity
  jumpForce: 13.5,         // Jump impulse
  slideDuration: 0.72,     // Seconds sliding lasts
  // Colors & theme tokens...
};
```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

### How to Contribute
1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines
- **Zero Heavy Assets**: Keep models procedural using Three.js primitives and sound procedural using Web Audio API where possible.
- **Zero-Allocation Game Loop**: Avoid allocating new objects (`new THREE.Vector3()`, `new THREE.Box3()`) inside the per-frame `animate()` loop.
- **Maintain Modular Architecture**: Place new game features into their respective modules in `src/` or stylesheets in `css/`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
