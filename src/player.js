import * as THREE from 'three';
import { CONFIG } from './config.js';
import { materials } from './materials.js';

const UNIT_SCALE = new THREE.Vector3(1, 1, 1);

export function createPlayerMesh() {
  const playerGroup = new THREE.Group();

  // Core Torso
  const bodyGeo = new THREE.BoxGeometry(0.75, 0.9, 0.55);
  const body = new THREE.Mesh(bodyGeo, materials.playerBody);
  body.position.y = 0.95;
  body.castShadow = true;
  playerGroup.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.55, 0.5, 0.5);
  const head = new THREE.Mesh(headGeo, materials.playerBody);
  head.position.set(0, 0.72, 0);
  head.castShadow = true;
  body.add(head);

  // Neon Visor
  const visorGeo = new THREE.BoxGeometry(0.48, 0.18, 0.15);
  const visor = new THREE.Mesh(visorGeo, materials.playerVisor);
  visor.position.set(0, 0.05, -0.22);
  head.add(visor);

  // Jetpack / Backpack
  const packGeo = new THREE.BoxGeometry(0.45, 0.6, 0.2);
  const pack = new THREE.Mesh(packGeo, materials.playerAcc);
  pack.position.set(0, 0.05, 0.32);
  pack.castShadow = true;
  body.add(pack);

  // Limbs: Legs
  const legGeo = new THREE.BoxGeometry(0.22, 0.55, 0.22);
  legGeo.translate(0, -0.275, 0);

  const leftLeg = new THREE.Mesh(legGeo, materials.playerLimb);
  leftLeg.position.set(-0.22, 0.55, 0);
  leftLeg.castShadow = true;
  playerGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, materials.playerLimb);
  rightLeg.position.set(0.22, 0.55, 0);
  rightLeg.castShadow = true;
  playerGroup.add(rightLeg);

  // Limbs: Arms
  const armGeo = new THREE.BoxGeometry(0.18, 0.5, 0.18);
  armGeo.translate(0, -0.25, 0);

  const leftArm = new THREE.Mesh(armGeo, materials.playerLimb);
  leftArm.position.set(-0.48, 0.4, 0);
  leftArm.castShadow = true;
  body.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, materials.playerLimb);
  rightArm.position.set(0.48, 0.4, 0);
  rightArm.castShadow = true;
  body.add(rightArm);

  // Shield Bubble
  const shieldGeo = new THREE.IcosahedronGeometry(1.2, 2);
  const shield = new THREE.Mesh(shieldGeo, materials.shieldBubble);
  shield.position.y = 0.9;
  shield.visible = false;
  playerGroup.add(shield);

  // Shadow Blob underneath
  const shadowGeo = new THREE.CircleGeometry(0.65, 8);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  playerGroup.add(shadow);

  return {
    group: playerGroup,
    body,
    head,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    shield,
    shadow
  };
}

export class PlayerController {
  constructor(scene, audio) {
    this.scene = scene;
    this.audio = audio;
    this.meshData = createPlayerMesh();
    this.scene.add(this.meshData.group);

    this.reset();
  }

  reset() {
    this.currentLane = 1;
    this.targetX = 0;
    this.posX = 0;
    this.posY = 0;
    this.velY = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.rollTilt = 0;
    this.runAnimTime = 0;

    this.activeMagnetTimer = 0;
    this.activeShield = false;
    this.activeDoubleTimer = 0;

    this.meshData.shield.visible = false;
    this.meshData.group.position.set(0, 0, 0);
    this.meshData.group.scale.set(1, 1, 1);
    this.meshData.group.visible = true;
  }

  getLaneX(laneIndex) {
    return (laneIndex - 1) * CONFIG.laneWidth;
  }

  switchLane(direction) {
    const nextLane = this.currentLane + direction;
    if (nextLane >= 0 && nextLane < CONFIG.numLanes) {
      this.currentLane = nextLane;
      this.targetX = this.getLaneX(this.currentLane);
      this.rollTilt = -direction * CONFIG.playerLeanMax;
    }
  }

  jump() {
    if (this.isGrounded && !this.isSliding) {
      this.velY = CONFIG.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
      this.audio.playJump();
      this.meshData.group.scale.set(0.85, 1.25, 0.85);
    }
  }

  slide() {
    if (this.isGrounded && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = CONFIG.slideDuration;
      this.audio.playSlide();
    } else if (!this.isGrounded) {
      this.velY = -CONFIG.jumpForce * 1.2;
    }
  }

  update(dt, currentSpeed, particles) {
    // Horizontal interpolation
    this.posX = THREE.MathUtils.damp(this.posX, this.targetX, CONFIG.laneLerpSpeed, dt);
    this.rollTilt = THREE.MathUtils.damp(this.rollTilt, 0, 8.0, dt);

    // Vertical physics
    if (!this.isGrounded) {
      this.velY -= CONFIG.gravity * dt;
      this.posY += this.velY * dt;

      if (this.posY <= 0) {
        this.posY = 0;
        this.velY = 0;
        this.isGrounded = true;
        this.isJumping = false;
        this.audio.playLand();
        particles.spawnBurst(this.meshData.group.position, 0xffffff, 8, 0.5);
        this.meshData.group.scale.set(1.15, 0.85, 1.15);
      }
    }

    this.meshData.group.scale.lerp(UNIT_SCALE, 12.0 * dt);

    // Slide timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Power-up timers
    if (this.activeMagnetTimer > 0) {
      this.activeMagnetTimer = Math.max(0, this.activeMagnetTimer - dt);
    }
    if (this.activeDoubleTimer > 0) {
      this.activeDoubleTimer = Math.max(0, this.activeDoubleTimer - dt);
    }

    // Position updates
    this.meshData.group.position.x = this.posX;
    this.meshData.group.position.y = this.posY;
    this.meshData.group.rotation.z = this.rollTilt;

    // Running animation
    this.runAnimTime += dt * (currentSpeed * 0.7);
    const legSwing = Math.sin(this.runAnimTime) * 0.65;

    if (this.isSliding) {
      this.meshData.body.position.y = 0.45;
      this.meshData.body.rotation.x = 0.55;
      this.meshData.leftLeg.rotation.x = -1.2;
      this.meshData.rightLeg.rotation.x = -1.2;
      this.meshData.leftArm.rotation.x = 0.9;
      this.meshData.rightArm.rotation.x = 0.9;
    } else if (this.isJumping) {
      this.meshData.body.position.y = 0.95;
      this.meshData.body.rotation.x = 0.1;
      this.meshData.leftLeg.rotation.x = -0.4;
      this.meshData.rightLeg.rotation.x = 0.3;
      this.meshData.leftArm.rotation.x = -0.8;
      this.meshData.rightArm.rotation.x = -0.8;
    } else {
      this.meshData.body.position.y = 0.95 + Math.abs(Math.sin(this.runAnimTime * 2)) * 0.08;
      this.meshData.body.rotation.x = 0.15;
      this.meshData.leftLeg.rotation.x = legSwing;
      this.meshData.rightLeg.rotation.x = -legSwing;
      this.meshData.leftArm.rotation.x = -legSwing * 0.85;
      this.meshData.rightArm.rotation.x = legSwing * 0.85;
    }

    if (this.activeShield) {
      this.meshData.shield.rotation.y += dt * 3.0;
      this.meshData.shield.rotation.x += dt * 1.5;
    }
  }
}
