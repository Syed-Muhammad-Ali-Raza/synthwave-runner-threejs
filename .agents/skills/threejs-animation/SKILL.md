---
name: threejs-animation
description: Procedural 3D character rigging, skeletal kinematics, running/jumping sinusoidal cycles, squash & stretch, and dynamic state blending for Three.js.
---

# Three.js 3D Character Animation & Rigging Skill

This skill outlines strategies for procedural animation, low-poly character articulation, and physics-driven motion dynamics in Three.js.

## Hierarchical Primitive Rigging

1. **Pivot Point Centering**:
   - Translate geometries so their rotational pivot sits at the joint origin:
     ```javascript
     const legGeo = new THREE.BoxGeometry(0.22, 0.55, 0.22);
     legGeo.translate(0, -0.275, 0); // Hip joint pivot at top
     ```
2. **Kinematic Hierarchy**:
   - Attach limbs to parent groups (Torso -> Head, Torso -> Arms, Root -> Legs).
   - This ensures torso bobs or rotations propagate down the kinematic chain.

## Procedural Locomotion & Sinusoidal Cycles

### 1. Speed-Synchronized Running
```javascript
player.runAnimTime += dt * (currentSpeed * 0.7);
const legSwing = Math.sin(player.runAnimTime) * 0.65;

// Opposing limb swings
player.leftLeg.rotation.x = legSwing;
player.rightLeg.rotation.x = -legSwing;
player.leftArm.rotation.x = -legSwing * 0.85;
player.rightArm.rotation.x = legSwing * 0.85;

// Vertical torso bobbing (2x frequency)
player.body.position.y = 0.95 + Math.abs(Math.sin(player.runAnimTime * 2)) * 0.08;
```

### 2. Squash & Stretch Dynamics
- **Takeoff**: `scale.set(0.85, 1.25, 0.85)`
- **Landing Impact**: `scale.set(1.15, 0.85, 1.15)`
- **Damped Recovery**:
  ```javascript
  player.group.scale.lerp(new THREE.Vector3(1, 1, 1), 12.0 * dt);
  ```

### 3. State-Driven Poses
- **Sliding**: Lowers torso `position.y`, tilts forward `rotation.x = 0.55`, stretches legs backward.
- **Jumping**: Tucks knee joints and raises arms for aerial silhouette.
- **Lateral Roll/Lean**: Tilts `rotation.z` in the direction of lateral velocity with smooth recovery dampening.
