---
name: threejs-game-dev
description: Expert guide and best practices for developing high-performance 3D browser games with Three.js, procedural low-poly assets, object pooling, and physics loops.
---

# Three.js Game Development Skill

This skill provides guidelines and patterns for engineering production-grade, 60fps browser games in Three.js without external build tools or heavy asset overhead.

## Core Architectural Principles

### 1. Zero-Allocation Render Loop
- **Rule**: Never invoke `new THREE.Vector3()`, `new THREE.Box3()`, or `new THREE.Matrix4()` inside `requestAnimationFrame` or physics tick loops.
- **Pattern**: Allocate shared scratch objects at file module scope:
  ```javascript
  const _scratchVecA = new THREE.Vector3();
  const _scratchVecB = new THREE.Vector3();
  const _scratchBox = new THREE.Box3();
  ```

### 2. Object Pooling
- Pre-allocate maximum concurrency bounds for enemies, obstacles, projectiles, coins, and particles during initialization.
- Store flags like `userData.active = false` and set `.visible = false` when inactive.
- Recycle elements seamlessly when they traverse past the camera despawn threshold.

### 3. Procedural Primitives & Flat-Shaded Aesthetics
- Construct characters, vehicles, and scenery by compounding Three.js primitives (`BoxGeometry`, `CylinderGeometry`, `ConeGeometry`, `IcosahedronGeometry`).
- Apply `MeshStandardMaterial` or `MeshLambertMaterial` with `flatShading: true` for clean low-poly visuals.
- Share material and geometry instances across pool entities to minimize GPU state switches and draw calls.

### 4. Frame-Rate Independent Physics
- Clamp delta time (`const dt = Math.min(rawDt, 0.05)`) to protect simulation state against background tab switching.
- Use `THREE.MathUtils.damp` or exponential lerp for smooth camera follows, banking rolls, and lane switching.

### 5. Lighting & Shadow Cascades
- Keep directional shadow camera bounds tightly fitted around the active player zone.
- Translate the light alongside the player coordinate system to preserve shadow map resolution without requiring massive texture maps.
