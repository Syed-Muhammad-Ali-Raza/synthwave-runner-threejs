import * as THREE from 'three';
import { CONFIG } from './config.js';
import { materials } from './materials.js';

export class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.roadSegments = [];
    this.obstaclePool = [];
    this.coinPool = [];
    this.powerupPool = [];
    this.nextSpawnZ = -35;

    this.initRoad();
    this.initPools();
  }

  createRoadSegment() {
    const group = new THREE.Group();
    const roadWidth = CONFIG.laneWidth * CONFIG.numLanes + 1.2;

    // Road Base
    const roadGeo = new THREE.BoxGeometry(roadWidth, 0.4, CONFIG.segmentLength);
    const roadMesh = new THREE.Mesh(roadGeo, materials.road);
    roadMesh.position.y = -0.2;
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // Glowing Neon Borders
    const borderGeo = new THREE.BoxGeometry(0.2, 0.1, CONFIG.segmentLength);
    const leftBorder = new THREE.Mesh(borderGeo, materials.roadLine);
    leftBorder.position.set(-roadWidth / 2, 0.05, 0);
    group.add(leftBorder);

    const rightBorder = new THREE.Mesh(borderGeo, materials.roadLine);
    rightBorder.position.set(roadWidth / 2, 0.05, 0);
    group.add(rightBorder);

    // Dashed Lane Markings
    for (let z = -CONFIG.segmentLength / 2 + 2; z < CONFIG.segmentLength / 2; z += 5) {
      const dashGeo = new THREE.BoxGeometry(0.12, 0.02, 2.2);
      const dash1 = new THREE.Mesh(dashGeo, materials.roadLine);
      dash1.position.set(-CONFIG.laneWidth / 2, 0.02, z);
      group.add(dash1);

      const dash2 = new THREE.Mesh(dashGeo, materials.roadLine);
      dash2.position.set(CONFIG.laneWidth / 2, 0.02, z);
      group.add(dash2);
    }

    // Scenery Trees and Geometric Towers
    const sceneryCount = 4;
    for (let i = 0; i < sceneryCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const xDist = (roadWidth / 2 + 3 + Math.random() * 8) * side;
      const zPos = -CONFIG.segmentLength / 2 + (i + 0.5) * (CONFIG.segmentLength / sceneryCount);

      if (Math.random() < 0.45) {
        // Low-poly Crystal Tree
        const treeGroup = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.2, 5);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x1d1135, flatShading: true });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.6;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const folGeo = new THREE.ConeGeometry(1.3, 2.8, 5);
        const randomColor = CONFIG.colors.sceneryTrees[Math.floor(Math.random() * CONFIG.colors.sceneryTrees.length)];
        const folMat = new THREE.MeshStandardMaterial({ color: randomColor, flatShading: true, roughness: 0.4 });
        const foliage = new THREE.Mesh(folGeo, folMat);
        foliage.position.y = 2.4;
        foliage.castShadow = true;
        treeGroup.add(foliage);

        treeGroup.position.set(xDist, 0, zPos);
        group.add(treeGroup);
      } else {
        // Low-poly Tower
        const h = 4 + Math.random() * 7;
        const w = 1.8 + Math.random() * 1.5;
        const towerGeo = new THREE.BoxGeometry(w, h, w);
        const towerMat = new THREE.MeshStandardMaterial({
          color: CONFIG.colors.sceneryBuildings[Math.floor(Math.random() * CONFIG.colors.sceneryBuildings.length)],
          roughness: 0.5,
          flatShading: true
        });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(xDist, h / 2 - 0.2, zPos);
        tower.castShadow = true;
        group.add(tower);
      }
    }

    return group;
  }

  initRoad() {
    for (let i = 0; i < CONFIG.visibleSegments; i++) {
      const seg = this.createRoadSegment();
      seg.position.z = -i * CONFIG.segmentLength;
      this.scene.add(seg);
      this.roadSegments.push(seg);
    }
  }

  createObstacleMesh(type) {
    const group = new THREE.Group();
    let hitbox = { x: 1, y: 1, z: 1 };

    switch (type) {
      case 'LOW': {
        const geo = new THREE.BoxGeometry(1.8, 0.75, 0.6);
        const mesh = new THREE.Mesh(geo, materials.obsLow);
        mesh.position.y = 0.375;
        mesh.castShadow = true;
        group.add(mesh);

        const stripeGeo = new THREE.BoxGeometry(1.82, 0.15, 0.62);
        const stripe = new THREE.Mesh(stripeGeo, materials.playerAcc);
        stripe.position.y = 0.7;
        group.add(stripe);

        hitbox = { x: 1.6, y: 0.75, z: 0.5 };
        break;
      }
      case 'TALL': {
        const geo = new THREE.BoxGeometry(1.8, 2.8, 0.7);
        const mesh = new THREE.Mesh(geo, materials.obsTall);
        mesh.position.y = 1.4;
        mesh.castShadow = true;
        group.add(mesh);

        const iconGeo = new THREE.OctahedronGeometry(0.35, 0);
        const icon = new THREE.Mesh(iconGeo, materials.roadLine);
        icon.position.set(0, 1.6, -0.4);
        group.add(icon);

        hitbox = { x: 1.6, y: 2.7, z: 0.6 };
        break;
      }
      case 'HIGH_BARRIER': {
        const beamGeo = new THREE.BoxGeometry(2.0, 0.45, 0.45);
        const beam = new THREE.Mesh(beamGeo, materials.obsHigh);
        beam.position.y = 1.65;
        beam.castShadow = true;
        group.add(beam);

        const pillarGeo = new THREE.BoxGeometry(0.18, 1.8, 0.25);
        const leftP = new THREE.Mesh(pillarGeo, materials.road);
        leftP.position.set(-0.95, 0.9, 0);
        const rightP = new THREE.Mesh(pillarGeo, materials.road);
        rightP.position.set(0.95, 0.9, 0);
        group.add(leftP);
        group.add(rightP);

        hitbox = { x: 1.7, y: 0.85, z: 0.45, yMin: 1.15 };
        break;
      }
      case 'MOVING': {
        const geo = new THREE.DodecahedronGeometry(0.7, 0);
        const mesh = new THREE.Mesh(geo, materials.obsMoving);
        mesh.position.y = 0.8;
        mesh.castShadow = true;
        group.add(mesh);

        hitbox = { x: 1.3, y: 1.3, z: 1.3 };
        break;
      }
    }

    group.userData = { type, hitbox, active: false, movingPhase: Math.random() * Math.PI * 2 };
    return group;
  }

  createCoinMesh() {
    const group = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 10);
    geo.rotateZ(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, materials.coin);
    mesh.castShadow = true;
    group.add(mesh);

    group.userData = { active: false, initialY: 0.9, bobOffset: Math.random() * Math.PI * 2 };
    return group;
  }

  createPowerupMesh(pType) {
    const group = new THREE.Group();
    let mat = materials.powerupMagnet;
    if (pType === 'SHIELD') mat = materials.powerupShield;
    if (pType === '2X') mat = materials.powerupMultiplier;

    const geo = new THREE.OctahedronGeometry(0.45, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.9;
    mesh.castShadow = true;
    group.add(mesh);

    const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 6, 16);
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.position.y = 0.9;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    group.userData = { type: pType, active: false, initialY: 0.9, bobOffset: Math.random() * Math.PI * 2 };
    return group;
  }

  initPools() {
    const obstacleTypes = ['LOW', 'TALL', 'HIGH_BARRIER', 'MOVING'];
    for (let i = 0; i < 35; i++) {
      const type = obstacleTypes[i % obstacleTypes.length];
      const obs = this.createObstacleMesh(type);
      obs.visible = false;
      this.scene.add(obs);
      this.obstaclePool.push(obs);
    }

    for (let i = 0; i < 60; i++) {
      const coin = this.createCoinMesh();
      coin.visible = false;
      this.scene.add(coin);
      this.coinPool.push(coin);
    }

    const powerupTypes = ['MAGNET', 'SHIELD', '2X'];
    for (let i = 0; i < 6; i++) {
      const type = powerupTypes[i % powerupTypes.length];
      const p = this.createPowerupMesh(type);
      p.visible = false;
      this.scene.add(p);
      this.powerupPool.push(p);
    }
  }

  reset() {
    for (let i = 0; i < this.roadSegments.length; i++) {
      this.roadSegments[i].position.z = -i * CONFIG.segmentLength;
    }
    this.obstaclePool.forEach(obs => { obs.visible = false; obs.userData.active = false; });
    this.coinPool.forEach(coin => { coin.visible = false; coin.userData.active = false; });
    this.powerupPool.forEach(p => { p.visible = false; p.userData.active = false; });
    this.nextSpawnZ = -35;
  }

  spawnCoinLine(x, startZ, count = 3) {
    for (let i = 0; i < count; i++) {
      const coin = this.coinPool.find(c => !c.userData.active);
      if (coin) {
        coin.userData.active = true;
        coin.visible = true;
        coin.position.set(x, 0.85, startZ - i * 2.6);
      }
    }
  }

  spawnCoinArc(x, centerZ) {
    const arcPoints = [
      { y: 0.8, z: centerZ + 3.0 },
      { y: 1.8, z: centerZ + 1.5 },
      { y: 2.3, z: centerZ },
      { y: 1.8, z: centerZ - 1.5 },
      { y: 0.8, z: centerZ - 3.0 }
    ];

    arcPoints.forEach(pt => {
      const coin = this.coinPool.find(c => !c.userData.active);
      if (coin) {
        coin.userData.active = true;
        coin.visible = true;
        coin.position.set(x, pt.y, pt.z);
      }
    });
  }

  spawnPowerup(x, z) {
    const p = this.powerupPool.find(item => !item.userData.active);
    if (p) {
      p.userData.active = true;
      p.visible = true;
      p.position.set(x, 0.9, z);
    }
  }

  update(playerZ, distanceTraveled, dt, now) {
    // 1. Road recycling
    for (let seg of this.roadSegments) {
      if (seg.position.z > playerZ + CONFIG.despawnDistanceZ) {
        seg.position.z -= this.roadSegments.length * CONFIG.segmentLength;
      }
    }

    // 2. Procedural fair spawner
    while (this.nextSpawnZ > playerZ - 180) {
      const clusterZ = this.nextSpawnZ;
      const lanes = [0, 1, 2];
      for (let i = lanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
      }

      const difficultyProgress = Math.min(1.0, distanceTraveled / 1200);
      const obstacleCount = Math.random() < (0.35 + difficultyProgress * 0.45) ? 2 : 1;

      for (let i = 0; i < obstacleCount; i++) {
        const laneIdx = lanes[i];
        const laneX = (laneIdx - 1) * CONFIG.laneWidth;

        let allowedTypes = ['LOW', 'TALL'];
        if (distanceTraveled > 150) allowedTypes.push('HIGH_BARRIER');
        if (distanceTraveled > 400) allowedTypes.push('MOVING');

        const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
        const obs = this.obstaclePool.find(o => !o.userData.active && o.userData.type === chosenType);

        if (obs) {
          obs.userData.active = true;
          obs.visible = true;
          obs.position.set(laneX, 0, clusterZ);
          obs.userData.baseLaneX = laneX;
        }

        if (chosenType === 'LOW' && Math.random() < 0.75) {
          this.spawnCoinArc(laneX, clusterZ);
        }
      }

      const openLaneIdx = lanes[obstacleCount];
      const openLaneX = (openLaneIdx - 1) * CONFIG.laneWidth;

      if (Math.random() < 0.65) {
        this.spawnCoinLine(openLaneX, clusterZ - 4, 4);
      } else if (Math.random() < 0.28) {
        this.spawnPowerup(openLaneX, clusterZ);
      }

      const spacing = THREE.MathUtils.lerp(CONFIG.maxObstacleSpacing, CONFIG.minObstacleSpacing, difficultyProgress);
      this.nextSpawnZ -= spacing + Math.random() * 6;
    }

    // 3. Moving obstacles
    for (let obs of this.obstaclePool) {
      if (obs.userData.active && obs.userData.type === 'MOVING') {
        obs.userData.movingPhase += dt * 3.2;
        obs.position.x = Math.sin(obs.userData.movingPhase) * CONFIG.laneWidth;
      }
    }

    // 4. Animate Coins & Power-ups
    for (let coin of this.coinPool) {
      if (coin.userData.active) {
        coin.rotation.y += dt * 4.0;
        coin.position.y = coin.userData.initialY + Math.sin(now * 0.005 + coin.userData.bobOffset) * 0.15;
      }
    }

    for (let p of this.powerupPool) {
      if (p.userData.active) {
        p.rotation.y += dt * 3.0;
        p.position.y = p.userData.initialY + Math.sin(now * 0.004 + p.userData.bobOffset) * 0.18;
      }
    }
  }
}
