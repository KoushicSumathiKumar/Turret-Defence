const GAME_CONFIG = {
  difficulties: {
    easy: {
      enemySpawnRate: 3000,
      enemySpeed: 0.5,
      enemyHealth: 1,
    },
    medium: {
      enemySpawnRate: 2000,
      enemySpeed: 1.0,
      enemyHealth: 2,
    },
    hard: {
      enemySpawnRate: 1000,
      enemySpeed: 1.5,
      enemyHealth: 3,
    },
    impossible: {
      enemySpawnRate: 500,
      enemySpeed: 2.0,
      enemyHealth: 5,
    },
  },

  turretTypes: {
    normal: {
      projectileSpeed: 7.5,
      projectileDistance: 100,
      reloadTime: 500,
      damage: 1.5,
      name: "Standard Turret",
      description: "Balanced performance with medium range and fire rate",
    },
    sniper: {
      projectileSpeed: 10,
      projectileDistance: 200,
      reloadTime: 1000,
      damage: 3,
      name: "Sniper Turret",
      description: "High velocity, long range shots with slow reload with charging abaility",
    },
    machineGun: {
      projectileSpeed: 5,
      projectileDistance: 80,
      reloadTime: 250,
      overheatTime: 3000,
      cooldownTime: 2000,
      damage: 0.5,
      name: "Machine Gun Turret",
      description: "Rapid fire but overheats after continuous use",
    },
  },
}

// Game state to track current settings
const currentGameState = {
  difficulty: "medium",
  turretType: "normal",
  score: 0,
  isGameActive: false,
}

// Functions to access and update game configuration
export function getDifficultySettings(difficultyLevel) {
  return GAME_CONFIG.difficulties[difficultyLevel] || GAME_CONFIG.difficulties.medium
}

export function getTurretSettings(turretType) {
  return GAME_CONFIG.turretTypes[turretType] || GAME_CONFIG.turretTypes.normal
}

export function setDifficulty(difficultyLevel) {
  if (GAME_CONFIG.difficulties[difficultyLevel]) {
    currentGameState.difficulty = difficultyLevel
    return true
  }
  return false
}

export function setTurretType(turretType) {
  if (GAME_CONFIG.turretTypes[turretType]) {
    currentGameState.turretType = turretType
    return true
  }
  return false
}

export function getCurrentSettings() {
  return {
    difficulty: getDifficultySettings(currentGameState.difficulty),
    turret: getTurretSettings(currentGameState.turretType),
    gameState: currentGameState,
  }
}
