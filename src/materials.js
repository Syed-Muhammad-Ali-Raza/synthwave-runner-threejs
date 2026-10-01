import * as THREE from 'three';
import { CONFIG } from './config.js';

export const materials = {
  playerBody: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.playerBody,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.1
  }),
  playerVisor: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.playerVisor,
    emissive: CONFIG.colors.playerVisor,
    emissiveIntensity: 0.6,
    roughness: 0.1
  }),
  playerLimb: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    roughness: 0.5
  }),
  playerAcc: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.playerAcc,
    flatShading: true
  }),
  shieldBubble: new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  }),
  road: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.road,
    roughness: 0.8,
    flatShading: true
  }),
  roadLine: new THREE.MeshBasicMaterial({
    color: CONFIG.colors.roadEdge
  }),
  roadGrid: new THREE.MeshBasicMaterial({
    color: CONFIG.colors.roadGrid,
    wireframe: true
  }),
  coin: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.coin,
    emissive: CONFIG.colors.coinGlow,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.85,
    flatShading: true
  }),
  obsLow: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.obstacleLow,
    roughness: 0.3,
    flatShading: true
  }),
  obsTall: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.obstacleTall,
    roughness: 0.3,
    flatShading: true
  }),
  obsHigh: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.obstacleHigh,
    emissive: CONFIG.colors.obstacleHigh,
    emissiveIntensity: 0.3,
    roughness: 0.2,
    flatShading: true
  }),
  obsMoving: new THREE.MeshStandardMaterial({
    color: CONFIG.colors.obstacleMoving,
    roughness: 0.3,
    flatShading: true
  }),
  powerupMagnet: new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.6,
    roughness: 0.2
  }),
  powerupShield: new THREE.MeshStandardMaterial({
    color: 0x39ff14,
    emissive: 0x39ff14,
    emissiveIntensity: 0.6,
    roughness: 0.2
  }),
  powerupMultiplier: new THREE.MeshStandardMaterial({
    color: 0xff007f,
    emissive: 0xff007f,
    emissiveIntensity: 0.6,
    roughness: 0.2
  })
};
