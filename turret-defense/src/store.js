import { create } from "zustand"
import { SoundEffects } from "./utils/sound"

// Helper function to get item cooldown duration
function getItemCooldown(itemType) {
  const cooldowns = {
    absoluteZero: 15,
    timeWarp: 5,
    radialBlast: 5,
    shield: 10,
    empBlast: 8,
  }
  return cooldowns[itemType] || 5
}

export const useGameStore = create((set, get) => ({
  // Game state
  wave: 1,
  gameOver: false,
  enemiesKilled: 0,
  enemiesRemaining: 5,
  enemySpeed: 0.02,
  enemyIndicators: { left: [], right: [] },
  reloadState: { progress: 1, heatLevel: 0, isOverheated: false, isCharging: false, chargeLevel: 0 },
  gamePaused: false,
  timeOfDay: 0,

  // Super Charge system
  superCharge: 0, // 0-100 percentage
  isSuperActive: false,
  superActiveStartTime: 0,
  superActiveDuration: 10,
  originalUpgrades: null,

  // Currency and upgrade system
  coins: 0,
  showUpgradeScreen: false,
  upgrades: {
    damage: 0,
    reloadTime: 0,
    bulletSpeed: 0,
    superChargeDuration: 0,
  },

  // Shop system
  shopItems: {
    absoluteZero: 0, // Slow effect - slows down all enemies
    timeWarp: 0, // Time warp - resets enemy positions
    shield: 0, // Shield - temporary invulnerability
    empBlast: 0, // EMP blast - temporarily stuns all enemies
  },
  activeItems: {
    absoluteZero: false,
    timeWarp: false,
    shield: false,
    empBlast: false,
  },
  itemCooldowns: {
    absoluteZero: 0,
    timeWarp: 0,
    shield: 0,
    empBlast: 0,
  },

  isBossWave: false,
  bossHealth: 0,
  bossMaxHealth: 0,
  bossShieldActive: false,
  bossShieldHealth: 0,
  bossShieldMaxHealth: 0,

  // Get current time of day (0 = morning, 1 = night)
  getTimeOfDay: () => {
    const state = get()
    return ((state.wave - 1) % 5) / 5
  },

  // Add coins when enemies are defeated
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  // Purchase an upgrade if player has enough coins
  purchaseUpgrade: (upgradeType) => {
    const state = get()
    const currentLevel = state.upgrades[upgradeType]

    // Max level check
    if (currentLevel >= 5) return false

    // Calculate cost based on current level
    const costs = [10, 20, 40, 80, 160]
    const cost = costs[currentLevel]

    // Check if player has enough coins
    if (state.coins < cost) return false

    // Apply the upgrade
    set((state) => ({
      coins: state.coins - cost,
      upgrades: {
        ...state.upgrades,
        [upgradeType]: state.upgrades[upgradeType] + 1,
      },
    }))

    return true
  },

  // Purchase shop item
  purchaseShopItem: (itemType) => {
    const state = get()

    // Calculate cost based on current quantity
    const baseCosts = {
      absoluteZero: 30,
      timeWarp: 50,
      radialBlast: 40,
      shield: 60,
      empBlast: 45,
    }

    const cost = baseCosts[itemType]

    // Check if player has enough coins
    if (state.coins < cost) return false

    // Apply the purchase
    set((state) => ({
      coins: state.coins - cost,
      shopItems: {
        ...state.shopItems,
        [itemType]: state.shopItems[itemType] + 1,
      },
    }))

    return true
  },

  // Activate shop item
  activateItem: (itemType) => {
    const state = get()

    // Check if player has the item and it's not on cooldown
    if (state.shopItems[itemType] <= 0 || state.itemCooldowns[itemType] > 0) {
      return false
    }

    // Consume the item
    set((state) => ({
      shopItems: {
        ...state.shopItems,
        [itemType]: state.shopItems[itemType] - 1,
      },
      activeItems: {
        ...state.activeItems,
        [itemType]: true,
      },
      itemCooldowns: {
        ...state.itemCooldowns,
        [itemType]: getItemCooldown(itemType),
      },
    }))

    // For time warp, handle the effect in the Game component
    if (itemType === "timeWarp") {
    }

    return true
  },

  // Update item cooldowns
  updateItemCooldowns: (delta) => {
    set((state) => {
      const newCooldowns = { ...state.itemCooldowns }
      const newActiveItems = { ...state.activeItems }

      // Update each cooldown
      Object.keys(newCooldowns).forEach((item) => {
        if (newCooldowns[item] > 0) {
          newCooldowns[item] = Math.max(0, newCooldowns[item] - delta)

          // If cooldown reaches 0, deactivate the item
          if (newCooldowns[item] === 0) {
            newActiveItems[item] = false
          }
        }
      })

      return {
        itemCooldowns: newCooldowns,
        activeItems: newActiveItems,
      }
    })
  },

  // Get the multiplier value for a specific upgrade
  getUpgradeMultiplier: (upgradeType) => {
    const state = get()

    // If super is active, return max multiplier
    if (state.isSuperActive) {
      switch (upgradeType) {
        case "damage":
          return 2.2 // 110%
        case "reloadTime":
          return 0.4 // 40%
        case "bulletSpeed":
          return 2.2 // 110%
        case "superChargeDuration":
          return 1.5 // 50% longer duration during super
        default:
          return 1
      }
    }

    // Otherwise return normal multiplier based on level
    const level = state.upgrades[upgradeType]

    switch (upgradeType) {
      case "damage":
        // 0%, 20%, 40%, 60%, 80%, 100% increase
        return 1 + level * 0.2
      case "reloadTime":
        // 0%, 10%, 20%, 30%, 40%, 50% decrease (faster reload)
        return 1 - level * 0.1
      case "bulletSpeed":
        // 0%, 20%, 40%, 60%, 80%, 100% increase
        return 1 + level * 0.2
      case "superChargeDuration":
        // 0%, 20%, 40%, 60%, 80%, 100% increase
        return 1 + level * 0.2
      default:
        return 1
    }
  },

  // Toggle upgrade screen visibility and pause the game
  setShowUpgradeScreen: (show) =>
    set({
      showUpgradeScreen: show,
      gamePaused: show,
    }),

  setGamePaused: (paused) => set({ gamePaused: paused }),

  // Set the current wave and calculate number of enemies
  setWave: (wave) => {
    // Play wave completed sound if advancing to a new wave (not the first wave)
    if (wave > 1) {
      SoundEffects.unlockAudio() // Ensure audio is unlocked
      SoundEffects.playWaveCompleted()
    }

    const isBossWave = wave % 5 === 0 && wave > 0 // Every 5th wave is a boss wave
    const enemiesCount = Math.floor(3 + wave * 1) // Increase enemies with each wave

    set({
      wave,
      enemiesRemaining: isBossWave ? enemiesCount + 1 : enemiesCount, 
      enemySpeed: 0.02 + wave * 0.001,
      showUpgradeScreen: wave > 1,
      gamePaused: wave > 1,
      timeOfDay: ((wave - 1) % 5) / 5,
      isBossWave: isBossWave,
      bossHealth: 0,
      bossMaxHealth: 0,
    })
  },

  // Enemy was killed - now updates super charge
  killEnemy: (enemyType) => {
    // Award coins based on enemy type
    const coinReward = enemyType === "tank" ? 10 : enemyType === "boss" ? 25 : 5
    const superChargeIncrement = enemyType === "boss" ? 15 : enemyType === "tank" ? 8 : 4

    set((state) => ({
      enemiesKilled: state.enemiesKilled + 1,
      // For boss, ensure we decrement by 1 to prevent respawning
      enemiesRemaining: Math.max(0, state.enemiesRemaining - 1),
      coins: state.coins + coinReward,
      // Increment super charge and cap at 100%
      superCharge: Math.min(100, state.superCharge + superChargeIncrement),
      // If we killed a boss, reset boss-related state
      ...(enemyType === "boss"
        ? {
            isBossWave: false,
            bossHealth: 0,
            bossMaxHealth: 0,
            bossShieldActive: false,
            bossShieldHealth: 0,
            bossShieldMaxHealth: 0,
          }
        : {}),
    }))
  },

  // Activate super charge
  activateSuperCharge: () => {
    const state = get()

    // Only activate if fully charged and not already active
    if (state.superCharge < 100 || state.isSuperActive) return false

    // Get the duration multiplier
    const durationMultiplier = state.getUpgradeMultiplier("superChargeDuration")

    // Store original upgrades
    set((state) => ({
      isSuperActive: true,
      superCharge: 0, // Reset charge
      superActiveStartTime: Date.now(),
      originalUpgrades: { ...state.upgrades },
      superActiveDuration: 10 * durationMultiplier, // Base duration is 10 seconds
    }))

    return true
  },

  // Check and update super charge status
  updateSuperChargeStatus: () => {
    const state = get()

    if (state.isSuperActive) {
      const elapsedTime = (Date.now() - state.superActiveStartTime) / 1000

      // If super charge duration has ended
      if (elapsedTime >= state.superActiveDuration) {
        set((state) => ({
          isSuperActive: false,
          // Restore original upgrades
          upgrades: state.originalUpgrades || state.upgrades,
        }))
      }
    }
  },

  // Enemy escaped or reached player
  removeEnemy: () =>
    set((state) => ({
      // Prevent enemiesRemaining from going below 0
      enemiesRemaining: Math.max(0, state.enemiesRemaining - 1),
    })),

  // Game over
  setGameOver: (isOver) => set({ gameOver: isOver }),

  setEnemyIndicators: (indicators) => set({ enemyIndicators: indicators }),

  setReloadState: (reloadState) => set({ reloadState }),

  // Reset the game (basic reset for continuing)
  resetGame: () =>
    set({
      gameOver: false,
    }),

  // Full reset (for new game or returning to menu)
  fullReset: () =>
    set({
      wave: 1,
      gameOver: false,
      enemiesKilled: 0,
      enemiesRemaining: 5,
      enemySpeed: 0.02,
      enemyIndicators: { left: [], right: [] },
      reloadState: { progress: 1, heatLevel: 0, isOverheated: false, isCharging: false, chargeLevel: 0 },
      coins: 0,
      showUpgradeScreen: false,
      gamePaused: false,
      timeOfDay: 0,
      superCharge: 0,
      isSuperActive: false,
      upgrades: {
        damage: 0,
        reloadTime: 0,
        bulletSpeed: 0,
        superChargeDuration: 0,
      },
      shopItems: {
        absoluteZero: 0,
        timeWarp: 0,
        shield: 0,
        empBlast: 0,
      },
      activeItems: {
        absoluteZero: false,
        timeWarp: false,
        shield: false,
        empBlast: false,
      },
      itemCooldowns: {
        absoluteZero: 0,
        timeWarp: 0,
        shield: 0,
        empBlast: 0,
      },
      isBossWave: false,
      bossHealth: 0,
      bossMaxHealth: 0,
      bossShieldActive: false,
      bossShieldHealth: 0,
      bossShieldMaxHealth: 0,
    }),

  setBossHealth: (health, maxHealth) =>
    set({
      bossHealth: health,
      bossMaxHealth: maxHealth,
    }),

  setBossShieldStatus: (active, health, maxHealth) =>
    set({
      bossShieldActive: active,
      bossShieldHealth: health,
      bossShieldMaxHealth: maxHealth,
    }),

  updateBossHealth: (health) =>
    set((state) => ({
      bossHealth: health,
    })),
}))
