import * as THREE from 'three';
import { CONFIG } from './config.js';
import { SoundEngine } from './audio.js';
import { ParticleManager } from './particles.js';
import { PlayerController } from './player.js';
import { WorldManager } from './world.js';

/* ==========================================================================
   SCENE, CAMERA, RENDERER & LIGHTS SETUP
   ========================================================================== */
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(CONFIG.colors.fog, 35, 110);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  250
);
const cameraBaseOffset = new THREE.Vector3(0, 3.8, 6.2);
camera.position.set(0, 4.0, 7.0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xff77aa, 0x1a0933, 0.95);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.35);
dirLight.position.set(15, 25, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 70;
dirLight.shadow.camera.left = -15;
dirLight.shadow.camera.right = 15;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

// Horizon Sun & Mountains
function createSkyBackground() {
  const sunGeo = new THREE.CircleGeometry(24, 32);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xff3377,
    fog: false,
    side: THREE.DoubleSide
  });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.set(0, 14, -140);
  scene.add(sunMesh);

  const mountainGeo = new THREE.ConeGeometry(18, 28, 4);
  const mountainMat = new THREE.MeshLambertMaterial({
    color: 0x170b2e,
    flatShading: true,
    fog: true
  });

  const mountainGroup = new THREE.Group();
  for (let i = -6; i <= 6; i++) {
    if (Math.abs(i) < 1) continue;
    const m = new THREE.Mesh(mountainGeo, mountainMat);
    const xOffset = i * 22 + (Math.random() * 8 - 4);
    const scaleY = 0.7 + Math.random() * 0.7;
    m.scale.set(1.2, scaleY, 1.2);
    m.position.set(xOffset, 4 * scaleY, -135 + Math.random() * 10);
    m.rotation.y = Math.random() * Math.PI;
    mountainGroup.add(m);
  }
  scene.add(mountainGroup);
}
createSkyBackground();

/* ==========================================================================
   MODULE INSTANTIATIONS
   ========================================================================== */
const audio = new SoundEngine();
const particles = new ParticleManager(scene);
const player = new PlayerController(scene, audio);
const world = new WorldManager(scene);

/* ==========================================================================
   GAME STATE & SCORING
   ========================================================================== */
let gameState = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAME_OVER'
let currentSpeed = CONFIG.baseSpeed;
let score = 0;
let coinsCollected = 0;
let distanceTraveled = 0;
let bestScore = 0;
let isNewRecord = false;
let cameraShakeAmount = 0;

// Load persisted data
try {
  const savedScore = localStorage.getItem('neondash_high_score');
  const parsedScore = Number.parseInt(savedScore ?? '', 10);
  if (Number.isSafeInteger(parsedScore) && parsedScore >= 0) bestScore = parsedScore;
  const savedAudio = localStorage.getItem('neondash_audio_muted');
  if (savedAudio === 'true') {
    audio.muted = true;
    document.getElementById('sound-status-label').textContent = 'OFF';
    document.getElementById('btn-sound-toggle').textContent = '🔇';
  }
} catch (e) {}

document.getElementById('start-best-score').textContent = bestScore.toLocaleString();

// UI Elements
const hudElement = document.getElementById('hud');
const hudScore = document.getElementById('hud-score');
const hudCoins = document.getElementById('hud-coins');
const hudDist = document.getElementById('hud-dist');
const powerupContainer = document.getElementById('powerup-container');
const screenStart = document.getElementById('screen-start');
const screenPause = document.getElementById('screen-pause');
const screenGameOver = document.getElementById('screen-gameover');

function updateHUD() {
  hudScore.textContent = Math.floor(score).toLocaleString();
  hudCoins.textContent = coinsCollected.toLocaleString();
  hudDist.textContent = Math.floor(distanceTraveled) + 'm';
}

function triggerScorePop() {
  hudScore.classList.remove('pop');
  void hudScore.offsetWidth;
  hudScore.classList.add('pop');
}

// Build power-up badges with DOM APIs instead of innerHTML so no runtime value
// can ever be interpreted as markup.
function createPowerupPill(label, value, color, percent) {
  const pill = document.createElement('div');
  pill.className = 'powerup-pill';

  const header = document.createElement('div');
  header.className = 'powerup-header';
  header.style.color = color;

  const name = document.createElement('span');
  name.textContent = label;
  const status = document.createElement('span');
  status.textContent = value;
  header.append(name, status);

  const barBackground = document.createElement('div');
  barBackground.className = 'powerup-bar-bg';
  const barFill = document.createElement('div');
  barFill.className = 'powerup-bar-fill';
  barFill.style.width = percent + '%';
  barFill.style.background = color;
  barFill.style.boxShadow = '0 0 8px ' + color;
  barBackground.appendChild(barFill);

  pill.append(header, barBackground);
  return pill;
}

function updatePowerupHUD() {
  powerupContainer.replaceChildren();

  if (player.activeShield) {
    powerupContainer.appendChild(createPowerupPill('Shield', 'ON', '#39ff14', 100));
  }

  if (player.activeMagnetTimer > 0) {
    const pct = (player.activeMagnetTimer / CONFIG.magnetDuration) * 100;
    powerupContainer.appendChild(
      createPowerupPill('Magnet', player.activeMagnetTimer.toFixed(1) + 's', '#00f0ff', pct)
    );
  }

  if (player.activeDoubleTimer > 0) {
    const pct = (player.activeDoubleTimer / CONFIG.doubleScoreDuration) * 100;
    powerupContainer.appendChild(
      createPowerupPill('2X Score', player.activeDoubleTimer.toFixed(1) + 's', '#ff007f', pct)
    );
  }
}

/* ==========================================================================
   INPUT HANDLING & BUFFERING
   ========================================================================== */
const inputBuffer = { action: null, time: 0 };

function bufferInput(action) {
  inputBuffer.action = action;
  inputBuffer.time = performance.now();
}

function processInputBuffer() {
  if (!inputBuffer.action) return;
  if (performance.now() - inputBuffer.time <= 140) {
    const action = inputBuffer.action;
    inputBuffer.action = null;

    if (action === 'LEFT') player.switchLane(-1);
    else if (action === 'RIGHT') player.switchLane(1);
    else if (action === 'JUMP') player.jump();
    else if (action === 'SLIDE') player.slide();
  } else {
    inputBuffer.action = null;
  }
}

// Keyboard
window.addEventListener('keydown', (e) => {
  audio.init();
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    e.preventDefault();
    bufferInput('LEFT');
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    e.preventDefault();
    bufferInput('RIGHT');
  } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
    e.preventDefault();
    bufferInput('JUMP');
  } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    e.preventDefault();
    bufferInput('SLIDE');
  } else if (e.code === 'KeyP' || e.code === 'Escape') {
    e.preventDefault();
    togglePause();
  }
});

// Touch Swipes
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

window.addEventListener('touchstart', (e) => {
  audio.init();
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartTime = performance.now();
}, { passive: true });

window.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const elapsed = performance.now() - touchStartTime;

  if (elapsed > 450) return;

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const minSwipe = 28;

  if (absX > minSwipe || absY > minSwipe) {
    if (absX > absY) {
      if (deltaX > 0) bufferInput('RIGHT');
      else bufferInput('LEFT');
    } else {
      if (deltaY > 0) bufferInput('SLIDE');
      else bufferInput('JUMP');
    }
  } else if (elapsed < 200 && absX < 15 && absY < 15) {
    bufferInput('JUMP');
  }
}, { passive: true });

/* ==========================================================================
   COLLISION DETECTION (Zero Garbage Collection Allocations)
   ========================================================================== */
const _playerBox = new THREE.Box3();
const _obsBox = new THREE.Box3();
const _coinBox = new THREE.Box3();
const _playerPosVec = new THREE.Vector3();
const _playerSizeVec = new THREE.Vector3();
const _entityPosVec = new THREE.Vector3();
const _entitySizeVec = new THREE.Vector3();

function checkCollisions() {
  if (gameState !== 'PLAYING') return;

  const currentHitbox = player.isSliding ? CONFIG.hitboxSlide : CONFIG.hitboxNormal;
  const playerCenterY = player.isSliding ? 0.35 + player.posY : 0.75 + player.posY;

  _playerPosVec.set(player.posX, playerCenterY, player.meshData.group.position.z);
  _playerSizeVec.set(currentHitbox.x, currentHitbox.y, currentHitbox.z);
  _playerBox.setFromCenterAndSize(_playerPosVec, _playerSizeVec);

  // 1. Obstacles
  for (let obs of world.obstaclePool) {
    if (!obs.userData.active || !obs.visible) continue;

    const dz = Math.abs(obs.position.z - player.meshData.group.position.z);
    if (dz > 3.5) continue;

    const hb = obs.userData.hitbox;
    let obsCenterY = hb.y / 2;
    if (hb.yMin !== undefined) obsCenterY = hb.yMin + hb.y / 2;

    _entityPosVec.set(obs.position.x, obsCenterY, obs.position.z);
    _entitySizeVec.set(hb.x, hb.y, hb.z);
    _obsBox.setFromCenterAndSize(_entityPosVec, _entitySizeVec);

    if (_playerBox.intersectsBox(_obsBox)) {
      if (player.activeShield) {
        player.activeShield = false;
        player.meshData.shield.visible = false;
        obs.userData.active = false;
        obs.visible = false;
        particles.spawnBurst(obs.position, 0x00f0ff, 24, 1.3);
        audio.playPowerup();
        triggerScreenFlash('#00f0ff');
        updatePowerupHUD();
        return;
      } else {
        triggerCrash();
        return;
      }
    }
  }

  // 2. Coins
  for (let coin of world.coinPool) {
    if (!coin.userData.active || !coin.visible) continue;

    const dz = coin.position.z - player.meshData.group.position.z;
    const distToPlayer = coin.position.distanceTo(player.meshData.group.position);

    if (player.activeMagnetTimer > 0 && distToPlayer < CONFIG.magnetRadius) {
      coin.position.lerp(
        new THREE.Vector3(player.posX, player.posY + 0.8, player.meshData.group.position.z),
        0.18
      );
    }

    if (Math.abs(dz) < 2.0) {
      _entitySizeVec.set(1.1, 1.4, 1.1);
      _coinBox.setFromCenterAndSize(coin.position, _entitySizeVec);

      if (_playerBox.intersectsBox(_coinBox)) {
        coin.userData.active = false;
        coin.visible = false;
        coinsCollected++;
        const points = player.activeDoubleTimer > 0 ? 100 : 50;
        score += points;
        audio.playCoin();
        particles.spawnBurst(coin.position, CONFIG.colors.coin, 12);
        triggerScorePop();
        updateHUD();
      }
    }
  }

  // 3. Power-ups
  for (let p of world.powerupPool) {
    if (!p.userData.active || !p.visible) continue;

    const dz = Math.abs(p.position.z - player.meshData.group.position.z);
    if (dz < 2.0) {
      _entitySizeVec.set(1.3, 1.5, 1.3);
      _coinBox.setFromCenterAndSize(p.position, _entitySizeVec);

      if (_playerBox.intersectsBox(_coinBox)) {
        p.userData.active = false;
        p.visible = false;
        audio.playPowerup();
        particles.spawnBurst(p.position, 0xff00ff, 20, 1.5);

        if (p.userData.type === 'MAGNET') {
          player.activeMagnetTimer = CONFIG.magnetDuration;
        } else if (p.userData.type === 'SHIELD') {
          player.activeShield = true;
          player.meshData.shield.visible = true;
        } else if (p.userData.type === '2X') {
          player.activeDoubleTimer = CONFIG.doubleScoreDuration;
        }
        updatePowerupHUD();
      }
    }
  }
}

function triggerScreenFlash(color = '#ff1e56') {
  const flash = document.getElementById('flash-overlay');
  flash.style.background = color;
  flash.style.opacity = '0.75';
  setTimeout(() => { flash.style.opacity = '0'; }, 90);
}

function triggerCrash() {
  gameState = 'GAME_OVER';
  audio.playCrash();
  triggerScreenFlash('#ff1e56');
  particles.spawnBurst(player.meshData.group.position, CONFIG.colors.playerVisor, 45, 2.0);
  player.meshData.group.visible = false;
  cameraShakeAmount = 0.8;

  if (score > bestScore) {
    bestScore = score;
    isNewRecord = true;
    try { localStorage.setItem('neondash_high_score', bestScore.toString()); } catch(e) {}
  } else {
    isNewRecord = false;
  }

  setTimeout(showGameOverScreen, 700);
}

/* ==========================================================================
   GAME LIFECYCLE & BUTTON LISTENERS
   ========================================================================== */
function startGame() {
  audio.init();
  audio.startMusic();

  player.reset();
  world.reset();

  currentSpeed = CONFIG.baseSpeed;
  score = 0;
  coinsCollected = 0;
  distanceTraveled = 0;
  cameraShakeAmount = 0;

  updateHUD();
  updatePowerupHUD();

  screenStart.classList.remove('active');
  screenPause.classList.remove('active');
  screenGameOver.classList.remove('active');
  hudElement.style.display = 'flex';

  gameState = 'PLAYING';
}

function togglePause() {
  if (gameState === 'PLAYING') {
    gameState = 'PAUSED';
    screenPause.classList.add('active');
    audio.stopMusic();
  } else if (gameState === 'PAUSED') {
    gameState = 'PLAYING';
    screenPause.classList.remove('active');
    audio.startMusic();
  }
}

function showGameOverScreen() {
  document.getElementById('go-score').textContent = Math.floor(score).toLocaleString();
  document.getElementById('go-coins').textContent = coinsCollected.toLocaleString();
  document.getElementById('go-distance').textContent = Math.floor(distanceTraveled) + 'm';
  document.getElementById('go-best').textContent = bestScore.toLocaleString();

  const recordBadge = document.getElementById('gameover-new-record');
  recordBadge.style.display = isNewRecord ? 'inline-block' : 'none';

  hudElement.style.display = 'none';
  screenGameOver.classList.add('active');
  audio.stopMusic();
}

document.getElementById('btn-start-play').addEventListener('click', startGame);
document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-pause').addEventListener('click', togglePause);
document.getElementById('btn-pause-restart').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

const soundToggleBtn = document.getElementById('btn-sound-toggle');
soundToggleBtn.addEventListener('click', () => {
  audio.init();
  const isMuted = audio.toggleMute();
  soundToggleBtn.textContent = isMuted ? '🔇' : '🔊';
  document.getElementById('sound-status-label').textContent = isMuted ? 'OFF' : 'ON';
  try { localStorage.setItem('neondash_audio_muted', isMuted.toString()); } catch(e) {}
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && gameState === 'PLAYING') togglePause();
});

/* ==========================================================================
   ANIMATION & RENDER LOOP
   ========================================================================== */
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  const rawDt = (now - lastTime) / 1000;
  lastTime = now;
  const dt = Math.min(rawDt, 0.05);

  if (gameState === 'PLAYING') {
    if (currentSpeed < CONFIG.maxSpeed) {
      currentSpeed += CONFIG.speedAccel * dt;
    }

    const forwardStep = currentSpeed * dt;
    distanceTraveled += forwardStep;
    const scoreMultiplier = player.activeDoubleTimer > 0 ? 2 : 1;
    score += forwardStep * 2.2 * scoreMultiplier;
    updateHUD();

    processInputBuffer();

    player.meshData.group.position.z -= forwardStep;
    player.update(dt, currentSpeed, particles);

    world.update(player.meshData.group.position.z, distanceTraveled, dt, now);

    checkCollisions();

    dirLight.position.set(
      player.posX + 15,
      player.posY + 25,
      player.meshData.group.position.z + 20
    );
    dirLight.target = player.meshData.group;
  }

  // Camera follow & shake
  const targetCamZ = player.meshData.group.position.z + cameraBaseOffset.z;
  const targetCamX = player.posX * 0.45;
  const targetCamY = cameraBaseOffset.y + (player.posY * 0.3);

  camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 6.0, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 6.0, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 12.0, dt);

  if (cameraShakeAmount > 0.01) {
    camera.position.x += (Math.random() - 0.5) * cameraShakeAmount;
    camera.position.y += (Math.random() - 0.5) * cameraShakeAmount;
    cameraShakeAmount = THREE.MathUtils.damp(cameraShakeAmount, 0, 6.0, dt);
  }

  const speedRatio = (currentSpeed - CONFIG.baseSpeed) / (CONFIG.maxSpeed - CONFIG.baseSpeed);
  const targetFOV = 65 + speedRatio * 14;
  camera.fov = THREE.MathUtils.damp(camera.fov, targetFOV, 3.0, dt);
  camera.updateProjectionMatrix();

  camera.lookAt(player.posX * 0.2, 1.4 + player.posY * 0.2, player.meshData.group.position.z - 7.0);

  particles.update(dt);
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
