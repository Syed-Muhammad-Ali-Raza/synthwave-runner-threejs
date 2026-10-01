/* ==========================================================================
   GAME CONFIGURATION & TUNING
   ========================================================================== */
export const CONFIG = {
  // Gameplay & Speeds
  laneWidth: 2.2,
  numLanes: 3,             // -2.2, 0, +2.2
  baseSpeed: 19.0,         // Initial forward units / sec
  maxSpeed: 44.0,          // Terminal max speed
  speedAccel: 0.35,        // Speed gain per second
  
  // Physics & Player Motion
  gravity: 42.0,
  jumpForce: 13.5,
  slideDuration: 0.72,     // Seconds sliding lasts
  laneLerpSpeed: 14.0,     // Snappiness of lane switching
  playerLeanMax: 0.28,     // Radians to tilt during lane change
  
  // Hitboxes (Forgiving box boundaries)
  hitboxNormal: { x: 0.7, y: 1.4, z: 0.7 },
  hitboxSlide:  { x: 0.7, y: 0.55, z: 1.1 },
  
  // World & Segment Dimensions
  segmentLength: 30,
  visibleSegments: 8,      // How many segments in the pool
  despawnDistanceZ: 20,    // Z behind player where segments recycle
  
  // Spawning Distances
  minObstacleSpacing: 16,  // Min distance between obstacle clusters
  maxObstacleSpacing: 26,
  
  // Power-up Durations (seconds)
  magnetDuration: 8.0,
  magnetRadius: 10.0,
  shieldDuration: 15.0,
  doubleScoreDuration: 10.0,
  
  // Aesthetic Colors (Low-Poly Synthwave / Pastel)
  colors: {
    skyTop: 0x1d0b3a,
    skyBottom: 0xff4d88,
    fog: 0x1d0f36,
    road: 0x140d28,
    roadEdge: 0x00f0ff,
    roadGrid: 0x311a5e,
    playerBody: 0x00f0ff,
    playerVisor: 0xff007f,
    playerAcc: 0xffe600,
    coin: 0xffd700,
    coinGlow: 0xffb700,
    obstacleLow: 0xff2a6d,
    obstacleTall: 0x9b51e0,
    obstacleHigh: 0x05d9e8,
    obstacleMoving: 0xff9900,
    sceneryTrees: [0x05d9e8, 0xff2a6d, 0x7928ca, 0x00ffcc],
    sceneryBuildings: [0x1f1640, 0x271954, 0x140c2e]
  }
};
