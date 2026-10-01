import * as THREE from 'three';

export class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    this.maxParticles = 180;
    this.geom = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.velocities = [];
    this.lifetimes = new Float32Array(this.maxParticles);
    this.maxLifetimes = new Float32Array(this.maxParticles);

    for (let i = 0; i < this.maxParticles; i++) {
      this.velocities.push(new THREE.Vector3());
      this.lifetimes[i] = 0;
    }

    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geom.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    this.pointsMesh = new THREE.Points(this.geom, mat);
    this.scene.add(this.pointsMesh);
  }

  spawnBurst(pos, colorHex, count = 18, speedMult = 1.0) {
    const color = new THREE.Color(colorHex);
    let spawned = 0;
    for (let i = 0; i < this.maxParticles && spawned < count; i++) {
      if (this.lifetimes[i] <= 0) {
        this.lifetimes[i] = 0.5 + Math.random() * 0.4;
        this.maxLifetimes[i] = this.lifetimes[i];

        const idx = i * 3;
        this.positions[idx] = pos.x;
        this.positions[idx + 1] = pos.y;
        this.positions[idx + 2] = pos.z;

        this.colors[idx] = color.r;
        this.colors[idx + 1] = color.g;
        this.colors[idx + 2] = color.b;

        this.velocities[i].set(
          (Math.random() - 0.5) * 6 * speedMult,
          (Math.random() * 5 + 1) * speedMult,
          (Math.random() - 0.5) * 6 * speedMult
        );

        spawned++;
      }
    }
    this.geom.attributes.position.needsUpdate = true;
    this.geom.attributes.color.needsUpdate = true;
  }

  update(dt) {
    let active = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.lifetimes[i] > 0) {
        active = true;
        this.lifetimes[i] -= dt;
        const idx = i * 3;

        this.velocities[i].y -= 14.0 * dt; // Gravity
        this.positions[idx] += this.velocities[i].x * dt;
        this.positions[idx + 1] += this.velocities[i].y * dt;
        this.positions[idx + 2] += this.velocities[i].z * dt;

        if (this.lifetimes[i] <= 0) {
          this.positions[idx + 1] = -100;
        }
      }
    }
    if (active) {
      this.geom.attributes.position.needsUpdate = true;
    }
  }
}
