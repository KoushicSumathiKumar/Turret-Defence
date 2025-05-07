import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera, Sky } from "@react-three/drei"
import * as THREE from "three"
import Turret from "./Turret"
import Enemy from "./Enemy"
import Projectile from "./Projectile"
import Ground from "./Ground"
import { useGameStore } from "../store"
import { getCurrentSettings } from "../config"
import { SoundEffects } from "../utils/sound"
import Boss from "./Boss"

// Custom DayNightCycle component
function DayNightCycle() {
  const timeOfDay = useGameStore((state) => state.getTimeOfDay())
  const wave = useGameStore((state) => state.wave)

  // Calculate sun position based on time of day
  const sunX = Math.cos((timeOfDay - 0.25) * Math.PI * 2) * 100
  const sunY = Math.sin((timeOfDay - 0.25) * Math.PI * 2) * 100
  const sunZ = 20

  // Calculate ambient light intensity (brighter during day, dimmer at night)
  const ambientIntensity = Math.max(0.1, 1 - timeOfDay * 0.9)

  // Calculate fog color and density
  const fogColor = new THREE.Color(
    timeOfDay < 0.5
      ? new THREE.Color(0x87ceeb).lerp(new THREE.Color(0xff7e50), timeOfDay * 2) // Day to sunset
      : new THREE.Color(0xff7e50).lerp(new THREE.Color(0x0a1a2a), (timeOfDay - 0.5) * 2), // Sunset to night
  )

  // For debugging purposes
  useEffect(() => {
    console.log(
      `Wave ${wave}: Time of day ${timeOfDay.toFixed(2)}, Sun position: [${sunX.toFixed(0)}, ${sunY.toFixed(0)}, ${sunZ}]`,
    )
  }, [timeOfDay, wave, sunX, sunY, sunZ])

  return (
    <>
      {/* Only show sky during day/sunset */}
      {timeOfDay < 0.5 && (
        <Sky
          distance={450000}
          sunPosition={[sunX, sunY, sunZ]}
          inclination={0.5}
          azimuth={0.25}
          mieCoefficient={0.005 + timeOfDay * 0.03}
          mieDirectionalG={0.7 + timeOfDay * 0.2}
          rayleigh={timeOfDay > 0.5 ? 0.5 : 1}
          turbidity={timeOfDay > 0.5 ? 20 : 10}
        />
      )}

      <ambientLight
        intensity={ambientIntensity}
        color={timeOfDay > 0.7 ? new THREE.Color(0x3a4a6a) : new THREE.Color(0xffffff)}
      />

      {/* Directional light for the sun */}
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={Math.max(0.1, 1 - timeOfDay * 0.9)}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Blue-ish light for night time */}
      {timeOfDay > 0.5 && (
        <hemisphereLight
          color={new THREE.Color(0x3a4a6a)}
          groundColor={new THREE.Color(0x000000)}
          intensity={timeOfDay * 0.3}
        />
      )}

      {/* Moon light at night */}
      {timeOfDay > 0.5 && (
        <directionalLight
          position={[-sunX, -sunY, sunZ]}
          intensity={timeOfDay * 0.2}
          color={new THREE.Color(0xc0d8ff)}
        />
      )}

      {/* Fog that changes with time of day */}
      <fog attach="fog" args={[fogColor, 30, 100 - timeOfDay * 50]} />
    </>
  )
}

export default function Game() {
  const turretRef = useRef()
  const cameraRef = useRef()
  const [turretRotation, setTurretRotation] = useState(0)
  const [projectiles, setProjectiles] = useState([])
  const [enemies, setEnemies] = useState([])
  const [reloadProgress, setReloadProgress] = useState(1) // 1 = ready to fire, 0 = just fired
  const [gameInitialized, setGameInitialized] = useState(false)
  const [visibleEnemies, setVisibleEnemies] = useState(new Set()) // Track visible enemies by ID
  const frameCountRef = useRef(0) // To track frame count for debugging

  // Direct keyboard state tracking with key repeat prevention
  const keyStateRef = useRef({
    a: false,
    d: false,
    s: false,
    q: false,
    sPressed: false, // Track if S was just pressed this frame
    sReleased: false, // Track if S was just released this frame
    sCanFire: true, // Only allow firing once per key press cycle (for non-machine gun)
  })

  // Last shot time tracking
  const lastShotTimeRef = useRef(0)

  // State variables after the existing state declarations
  const [isCharging, setIsCharging] = useState(false)
  const [chargeLevel, setChargeLevel] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1) // 1 = normal, > 1 = zoomed in
  const [showTrajectory, setShowTrajectory] = useState(false)

  // Item effect states
  const [timeSlowActive, setTimeSlowActive] = useState(false)
  const [timeWarpActive, setTimeWarpActive] = useState(false)
  const [shieldActive, setShieldActive] = useState(false)
  const [empActive, setEmpActive] = useState(false)

  // Boss shield state variables
  const [bossNextShieldThreshold, setBossNextShieldThreshold] = useState(0.75)
  const [shieldEffectActive, setShieldEffectActive] = useState(false)
  const [shieldEffectTime, setShieldEffectTime] = useState(0)

  // Machine gun specific states
  const [heatLevel, setHeatLevel] = useState(0) // 0 = cool, 1 = overheated
  const [isOverheated, setIsOverheated] = useState(false)
  const [overheatStartTime, setOverheatStartTime] = useState(0)
  const machineGunFireTimerRef = useRef(0) // Timer for machine gun rate of fire

  const wave = useGameStore((state) => state.wave)
  const gameOver = useGameStore((state) => state.gameOver)
  const setWave = useGameStore((state) => state.setWave)
  const killEnemy = useGameStore((state) => state.killEnemy)
  const removeEnemy = useGameStore((state) => state.removeEnemy)
  const setGameOver = useGameStore((state) => state.setGameOver)
  const enemiesRemaining = useGameStore((state) => state.enemiesRemaining)
  const enemySpeed = useGameStore((state) => state.enemySpeed)
  const setEnemyIndicators = useGameStore((state) => state.setEnemyIndicators)
  const setReloadState = useGameStore((state) => state.setReloadState)
  const gamePaused = useGameStore((state) => state.gamePaused)
  const setGamePaused = useGameStore((state) => state.setGamePaused)
  const timeOfDay = useGameStore((state) => state.getTimeOfDay())

  // Shop items
  const activeItems = useGameStore((state) => state.activeItems)
  const updateItemCooldowns = useGameStore((state) => state.updateItemCooldowns)

  // Get upgrade multipliers
  const damageMultiplier = useGameStore((state) => state.getUpgradeMultiplier("damage"))
  const reloadTimeMultiplier = useGameStore((state) => state.getUpgradeMultiplier("reloadTime"))
  const bulletSpeedMultiplier = useGameStore((state) => state.getUpgradeMultiplier("bulletSpeed"))

  // Check for super charge activation
  const superCharge = useGameStore((state) => state.superCharge)
  const isSuperActive = useGameStore((state) => state.isSuperActive)
  const activateSuperCharge = useGameStore((state) => state.activateSuperCharge)
  const updateSuperChargeStatus = useGameStore((state) => state.updateSuperChargeStatus)

  const { camera } = useThree()
  const [settings, setSettings] = useState(getCurrentSettings())

  // Super charge ready sound
  const [superChargeReadyPlayed, setSuperChargeReadyPlayed] = useState(false)

  // State variables in the Game component after the existing state declarations
  const isBossWave = useGameStore((state) => state.isBossWave)
  const setBossHealth = useGameStore((state) => state.setBossHealth)
  const updateBossHealth = useGameStore((state) => state.updateBossHealth)
  const setBossShieldStatus = useGameStore((state) => state.setBossShieldStatus)

  // Get boss shield state from store
  const bossShieldActive = useGameStore((state) => state.bossShieldActive)
  const bossShieldHealth = useGameStore((state) => state.bossShieldHealth)
  const bossShieldMaxHealth = useGameStore((state) => state.bossShieldMaxHealth)

  // addCoins function to the destructured state from useGameStore at the top of the component
  const addCoins = useGameStore((state) => state.addCoins)

  // Set up direct keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()

      if (keyStateRef.current.hasOwnProperty(key)) {
        // For non-s keys, just update the state
        if (key !== "s") {
          keyStateRef.current[key] = true
          return
        }

        // For s key, handle differently based on turret type
        const turretType = settings.gameState.turretType
        const isMachineGun = turretType === "machineGun"

        // For machine gun, always allow key to be pressed (continuous fire)
        if (isMachineGun) {
          keyStateRef.current[key] = true
          return
        }

        // For non-machine gun, only register press if not already pressed
        if (!keyStateRef.current[key]) {
          keyStateRef.current[key] = true

          // Only mark as pressed if we can fire
          if (keyStateRef.current.sCanFire) {
            keyStateRef.current.sPressed = true
            keyStateRef.current.sCanFire = false // Prevent firing again until key is released
          }
        }
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      if (keyStateRef.current.hasOwnProperty(key)) {
        keyStateRef.current[key] = false

        if (key === "s") {
          keyStateRef.current.sReleased = true
          keyStateRef.current.sCanFire = true // Allow firing again on next press
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [settings.gameState.turretType])

  // Function to create a projectile
  const createProjectile = (turretType, angle, damage, speed, isCharged = false, chargeLevel = 0) => {
    const now = Date.now()
    const timeSinceLastShot = now - lastShotTimeRef.current
    // Update last shot time
    lastShotTimeRef.current = now

    // Start firing animation
    turretRef.current?.startFiring()

    // Play sound
    SoundEffects.unlockAudio()
    SoundEffects.playShooting()

    // Create the projectile
    const newProjectile = {
      id: `proj_${now}_${Math.random().toString(36).substr(2, 9)}`,
      position: [0, 0.1, 0],
      rotation: angle,
      velocity: [Math.sin(angle) * speed, 0, Math.cos(angle) * speed],
      damage: damage,
      distance: 0,
      maxDistance: settings.turret.projectileDistance,
      turretType: turretType,
      createdAt: now / 1000,
      charged: isCharged,
      chargeLevel: chargeLevel,
    }

    setProjectiles((prev) => [...prev, newProjectile])
  }

  // Initialize game once on mount
  useEffect(() => {
    console.log("Game component mounted")

    // Make sure the game isn't paused when starting
    setGamePaused(false)

    // Clear any existing enemies and projectiles
    setEnemies([])
    setProjectiles([])
    setTurretRotation(0)
    setHeatLevel(0)
    setIsOverheated(false)
    lastShotTimeRef.current = 0
    machineGunFireTimerRef.current = 0
    setVisibleEnemies(new Set())

    // Reset boss shield state
    setBossNextShieldThreshold(0.75)
    setBossShieldStatus(false, 0, 0)

    // Update settings
    setSettings(getCurrentSettings())

    // Mark as initialized
    setGameInitialized(true)

    // Cleanup function
    return () => {
      console.log("Game component unmounting")
    }
  }, [])

  // Position the camera behind and above the turret
  useEffect(() => {
    if (cameraRef.current && camera) {
      camera.position.set(0, 5, -5)
      camera.lookAt(0, 1, 10)
    }
  }, [camera])

  useEffect(() => {
    if (timeWarpActive) {
      setEnemies((prev) =>
        prev.map((enemy, index) => {
          // Don't affect bosses with time warp
          if (enemy.type === "boss") {
            return enemy
          }

          const angle = (index / prev.length) * Math.PI * 2
          const fixedDistance = 50

          return {
            ...enemy,
            position: [Math.sin(angle) * fixedDistance, enemy.position[1], Math.cos(angle) * fixedDistance],
          }
        }),
      )
    }
  }, [timeWarpActive])

  useEffect(() => {
    // Don't spawn if game is over, paused, or enemies already exist
    if (gameOver || gamePaused || enemies.length > 0 || !gameInitialized) {
      return
    }

    // If no enemies remaining, advance to next wave
    if (enemiesRemaining <= 0 && projectiles.length === 0) {
      setWave(wave + 1)
      return
    }

    console.log("Spawning enemies for wave:", wave, "Remaining:", enemiesRemaining, "Boss wave:", isBossWave)

    // Only spawn if there are enemies remaining
    if (enemiesRemaining > 0) {
      const difficultySettings = settings.difficulty
      const newEnemies = []

      // Calculate how many regular enemies to spawn
      let spawnCount = Math.min(Math.floor(3 + wave), enemiesRemaining)

      // If it's a boss wave and haven't spawned a boss yet, reserve one slot for the boss
      const shouldSpawnBoss =
        isBossWave &&
        !enemies.some((enemy) => enemy.type === "boss") &&
        !newEnemies.some((enemy) => enemy.type === "boss")

      if (shouldSpawnBoss) {
        spawnCount = Math.max(0, spawnCount - 1)
      }

      // Calculate how many of each type to spawn (roughly equal)
      const tankCount = Math.floor(spawnCount / 2)
      const normalCount = spawnCount - tankCount

      // Spawn normal enemies
      for (let i = 0; i < normalCount; i++) {
        // Spawn enemies in a circle around the turret
        const angle = Math.random() * Math.PI * 2
        const distance = 50 + Math.random() * 10

        newEnemies.push({
          id: `enemy_normal_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          position: [Math.sin(angle) * distance, 0.5, Math.cos(angle) * distance],
          speed: enemySpeed * difficultySettings.enemySpeed * (0.8 + Math.random() * 0.4), // Apply difficulty modifier
          health: difficultySettings.enemyHealth,
          type: "normal",
          maxHealth: difficultySettings.enemyHealth,
        })
      }

      // Spawn tank enemies
      for (let i = 0; i < tankCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = 50 + Math.random() * 10

        newEnemies.push({
          id: `enemy_tank_${Date.now()}_${normalCount + i}_${Math.random().toString(36).substr(2, 9)}`,
          position: [Math.sin(angle) * distance, 0.75, Math.cos(angle) * distance],
          speed: enemySpeed * difficultySettings.enemySpeed * 0.4, // Tanks move at 40% of normal speed
          health: difficultySettings.enemyHealth * 3, // Tanks have 3x health
          type: "tank",
          maxHealth: difficultySettings.enemyHealth * 3,
        })
      }

      // If it's a boss wave and should spawn a boss, spawn a boss
      if (shouldSpawnBoss) {
        const angle = Math.random() * Math.PI * 2
        const distance = 50 + Math.random() * 10

        // Calculate boss health based on wave number
        const bossHealth = difficultySettings.enemyHealth * 20 * Math.ceil(wave / 5)

        // Create the boss with the shield threshold property
        const boss = {
          id: `boss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          position: [Math.sin(angle) * distance, 1.5, Math.cos(angle) * distance],
          speed: enemySpeed * difficultySettings.enemySpeed * 0.3, // Boss moves at 30% of normal speed
          health: bossHealth,
          type: "boss",
          maxHealth: bossHealth,
          hasShield: false,
          nextShieldThreshold: 0.75, // First shield at 75% health
        }

        SoundEffects.unlockAudio()
        SoundEffects.playBossWave()

        // Set boss health in the store for UI
        setBossHealth(bossHealth, bossHealth)

        // Reset boss shield state
        setBossNextShieldThreshold(0.75)
        setBossShieldStatus(false, 0, 0)

        newEnemies.push(boss)
      }

      setEnemies(newEnemies)
    } else {
      // No enemies remaining? Just advance to next wave
      console.log("No enemies remaining, advancing to next wave")
      setWave(wave + 1)
    }
  }, [
    wave,
    enemiesRemaining,
    gameOver,
    enemies.length,
    projectiles.length,
    enemySpeed,
    setWave,
    settings,
    gameInitialized,
    gamePaused,
    isBossWave,
    setBossHealth,
    setBossShieldStatus,
    enemies,
  ])

  // Reset enemies and projectiles when game state changes
  useEffect(() => {
    if (!gameOver && gameInitialized && !gamePaused && enemiesRemaining > 0 && enemies.length === 0) {
      console.log("Game state changed, resetting enemies")
      setEnemies([])
      setProjectiles([])
      setHeatLevel(0)
      setIsOverheated(false)
    }
  }, [gameOver, gameInitialized, gamePaused, enemiesRemaining])

  // Game loop
  useFrame((state, delta) => {
    // Increment frame counter for debugging
    frameCountRef.current += 1

    // Don't update anything if the game is over or paused
    if (gameOver || gamePaused) return

    const turretSettings = settings.turret
    const turretType = settings.gameState.turretType
    const isMachineGun = turretType === "machineGun"
    const isSniperTurret = turretType === "sniper"

    // Calculate reload progress with upgrade multiplier applied
    const reloadTime = (turretSettings.reloadTime / 1000) * reloadTimeMultiplier // Apply upgrade multiplier
    const timeSinceLastShot = (Date.now() - lastShotTimeRef.current) / 1000
    const newReloadProgress = Math.min(1, timeSinceLastShot / reloadTime)
    setReloadProgress(newReloadProgress)

    // Handle machine gun overheat
    if (isMachineGun) {
      if (isOverheated) {
        // Check if cooldown is complete
        const cooldownTime = turretSettings.cooldownTime / 1000
        const timeSinceOverheat = (Date.now() - overheatStartTime) / 1000

        if (timeSinceOverheat >= cooldownTime) {
          setIsOverheated(false)
          setHeatLevel(0)
        } else {
          // Gradually cool down
          const cooldownProgress = timeSinceOverheat / cooldownTime
          setHeatLevel(Math.max(0, 1 - cooldownProgress))
        }
      } else if (keyStateRef.current.s) {
        // Increase heat when firing
        const overheatTime = turretSettings.overheatTime / 1000
        const heatIncreaseRate = delta / overheatTime

        setHeatLevel((prevHeat) => {
          const newHeat = prevHeat + heatIncreaseRate
          if (newHeat >= 1) {
            setIsOverheated(true)
            setOverheatStartTime(Date.now())
            return 1
          }
          return newHeat
        })
      } else {
        // Cool down when not firing
        const cooldownRate = delta / (turretSettings.cooldownTime / 2000) // Cool twice as fast when not firing
        setHeatLevel((prevHeat) => Math.max(0, prevHeat - cooldownRate))
      }
    }

    // Update reload state in store for UI
    setReloadState({
      progress: newReloadProgress,
      heatLevel: isMachineGun ? heatLevel : 0,
      isOverheated: isOverheated,
      isCharging: isCharging,
      chargeLevel: chargeLevel,
    })

    // Turret rotation controls (A and D keys)
    if (keyStateRef.current.a) {
      setTurretRotation((prev) => prev + delta * 1.5)
    }
    if (keyStateRef.current.d) {
      setTurretRotation((prev) => prev - delta * 1.5)
    }

    if (superCharge >= 100 && !isSuperActive && !superChargeReadyPlayed) {
      SoundEffects.unlockAudio()
      SoundEffects.playSuperChargeReady()
      setSuperChargeReadyPlayed(true)
    }

    // Reset the flag if superCharge drops below 100
    if (superCharge < 100 && superChargeReadyPlayed) {
      setSuperChargeReadyPlayed(false)
    }

    // Super charge activation (Q key)
    if (keyStateRef.current.q && superCharge >= 100 && !isSuperActive) {
      SoundEffects.unlockAudio()
      const activated = activateSuperCharge()
      if (activated) {
        SoundEffects.playSuperChargeActivate()
      }
    }

    // Update super charge status (check if it should end)
    updateSuperChargeStatus()

    // Update item cooldowns
    updateItemCooldowns(delta)

    // Track slowing effect effect
    setTimeSlowActive(activeItems.absoluteZero)

    // Track time warp effect
    setTimeWarpActive(activeItems.timeWarp)

    // Track shield effect
    setShieldActive(activeItems.shield)

    // Track EMP effect
    setEmpActive(activeItems.empBlast)

    // Update camera position based on turret rotation
    if (cameraRef.current) {
      // Rotate camera around turret
      camera.position.x = Math.sin(turretRotation) * -5
      camera.position.z = Math.cos(turretRotation) * -5
      camera.lookAt(Math.sin(turretRotation) * 10, 1, Math.cos(turretRotation) * 10)
    }

    // Apply zoom effect to camera FOV
    if (camera) {
      camera.fov = 60 / zoomLevel
      camera.updateProjectionMatrix()
    }

    // Show trajectory line for sniper when charging
    setShowTrajectory(isSniperTurret && isCharging)

    // Shooting control with completely rewritten logic
    const canShoot = newReloadProgress >= 1 && !isOverheated

    // Handle different turret types
    if (isSniperTurret) {
      // Sniper turret - charge and release
      if (keyStateRef.current.s) {
        // Start or continue charging
        if (!isCharging) {
          setIsCharging(true)
        }

        // Increase charge level while holding S
        if (chargeLevel < 1) {
          setChargeLevel((prev) => Math.min(1, prev + delta * 0.5))
        }

        // Apply zoom effect based on charge level
        const targetZoom = 1 + chargeLevel * 0.5 // Max 50% zoom
        setZoomLevel((prev) => prev + (targetZoom - prev) * delta * 5)
      } else if (keyStateRef.current.sReleased) {
        // S key was just released - reset the flag immediately to prevent multiple firings
        keyStateRef.current.sReleased = false

        // Fire if charging and can shoot
        if (isCharging && canShoot) {
          // Calculate projectile properties
          const angle = turretRotation
          const chargeSpeedBonus = 1 + chargeLevel * 2 // Up to 3x speed at full charge
          const projectileSpeed = (turretSettings.projectileSpeed / 10) * bulletSpeedMultiplier * chargeSpeedBonus
          const chargeDamageBonus = 1 + chargeLevel * 1.5 // Up to 2.5x damage at full charge
          const damage = turretSettings.damage * damageMultiplier * chargeDamageBonus

          // Create the projectile
          createProjectile(turretType, angle, damage, projectileSpeed, true, chargeLevel)
        }

        // Reset charging state
        setIsCharging(false)
        setChargeLevel(0)

        // Reset zoom level smoothly
        setZoomLevel((prev) => prev + (1 - prev) * delta * 10)
      } else if (!keyStateRef.current.s && zoomLevel > 1) {
        // When not pressing S, gradually reset zoom
        setZoomLevel((prev) => prev + (1 - prev) * delta * 5)
      }
    } else if (isMachineGun) {
      // Machine gun - continuous fire with rate limiting
      if (keyStateRef.current.s && canShoot) {
        // Update machine gun fire timer
        machineGunFireTimerRef.current += delta

        // Check if it's time to fire based on reload time
        // Machine gun fires at a rate determined by its reload time
        if (machineGunFireTimerRef.current >= reloadTime) {
          // Reset timer (can be negative to account for overflow)
          machineGunFireTimerRef.current = 0

          // Calculate projectile properties
          const angle = turretRotation
          const projectileSpeed = (turretSettings.projectileSpeed / 10) * bulletSpeedMultiplier
          const damage = turretSettings.damage * damageMultiplier

          // Create the projectile
          createProjectile(turretType, angle, damage, projectileSpeed)
        }
      } else {
        // Reset timer when not firing
        machineGunFireTimerRef.current = reloadTime
      }
    } else {
      // Normal turret - single shot per press
      if (keyStateRef.current.sPressed && canShoot) {
        // Reset the flag immediately to prevent multiple firings
        keyStateRef.current.sPressed = false

        // Calculate projectile properties
        const angle = turretRotation
        const projectileSpeed = (turretSettings.projectileSpeed / 10) * bulletSpeedMultiplier
        const damage = turretSettings.damage * damageMultiplier

        // Create the projectile
        createProjectile(turretType, angle, damage, projectileSpeed)
      }
    }

    // Update shield effect if active
    if (shieldEffectActive) {
      setShieldEffectTime((prev) => prev + delta)

      // End effect after 2 seconds
      if (shieldEffectTime > 2) {
        setShieldEffectActive(false)
        setShieldEffectTime(0)
      }
    }

    // Update projectiles with improved movement and cleanup
    setProjectiles((prev) =>
      prev
        .map((proj) => {
          // Calculate movement
          const newX = proj.position[0] + proj.velocity[0]
          const newZ = proj.position[2] + proj.velocity[2]

          // Calculate distance traveled
          const deltaDistance = Math.sqrt(proj.velocity[0] * proj.velocity[0] + proj.velocity[2] * proj.velocity[2])

          return {
            ...proj,
            position: [newX, proj.position[1], newZ],
            distance: proj.distance + deltaDistance,
          }
        })
        .filter((proj) => {
          // Remove projectiles that exceed their max distance
          const distanceCheck = proj.distance < proj.maxDistance

          // Also remove projectiles that have existed for too long (5 seconds)
          // This prevents any stuck projectiles from remaining in the game
          const timeCheck = Date.now() / 1000 - proj.createdAt < 5

          return distanceCheck && timeCheck
        }),
    )

    // Track enemies and their indicators
    const leftIndicators = []
    const rightIndicators = []
    const newVisibleEnemies = new Set()

    // Update enemies
    const updatedEnemies = enemies.map((enemy) => {
      // Move enemy towards turret (0,0,0)
      const dirX = -enemy.position[0]
      const dirZ = -enemy.position[2]
      const length = Math.sqrt(dirX * dirX + dirZ * dirZ)

      // Check if the enemy is in field of view
      // Calculate angle between turret forward and enemy position
      const enemyAngle = Math.atan2(enemy.position[0], enemy.position[2])
      const relativeTurretAngle = (turretRotation + Math.PI) % (2 * Math.PI)
      const diff = Math.abs(enemyAngle - relativeTurretAngle) % (2 * Math.PI)
      const angleDiff = diff > Math.PI ? 2 * Math.PI - diff : diff

      // Enemy is in field of view if angle difference is less than ~45 degrees
      const isInView = angleDiff < Math.PI / 4

      // For tanks, we also check if they're close enough to be visible
      const isTank = enemy.type === "tank"
      const isBoss = enemy.type === "boss"
      const isVisible = isInView && length < 50 // Only consider visible if in view and within range

      // Track visible enemies
      if (isVisible && (isTank || isBoss)) {
        newVisibleEnemies.add(enemy.id)
      }

      // Add to indicators if not in view
      if (!isInView) {
        // Determine if enemy is to the left or right
        const isToLeft = (enemyAngle - relativeTurretAngle + 2 * Math.PI) % (2 * Math.PI) > Math.PI

        // Calculate blink rate based on distance (closer = faster blinking)
        const blinkRate = Math.max(0.1, Math.min(1, length / 20))
        const shouldBlink = state.clock.getElapsedTime() % blinkRate < blinkRate / 2

        if (isToLeft) {
          leftIndicators.push({
            distance: length,
            active: shouldBlink,
            id: enemy.id,
            isTank: isTank,
            isBoss: isBoss,
          })
        } else {
          rightIndicators.push({
            distance: length,
            active: shouldBlink,
            id: enemy.id,
            isTank: isTank,
            isBoss: isBoss,
          })
        }
      }

      // Don't move if already very close
      if (length < 10) {
        // If shield is active, don't trigger game over
        if (!gameOver && !shieldActive) {
          setGameOver(true)
        }
        return enemy
      }

      // Apply slowing effect (50% slower) - but not to bosses
      let speedModifier = 1
      if (timeSlowActive && enemy.type !== "boss") {
        speedModifier *= 0.5
      }
      if (timeSlowActive && enemy.type !== "boss") {
        speedModifier *= 0.5
      }

      // Apply EMP effect (completely stopped) - but not to bosses
      if (empActive && enemy.type !== "boss") {
        speedModifier = 0
      }

      // Normalize and apply speed with modifiers
      const speedFactor = (enemy.speed * speedModifier) / length

      return {
        ...enemy,
        position: [enemy.position[0] + dirX * speedFactor, enemy.position[1], enemy.position[2] + dirZ * speedFactor],
      }
    })

    // Update visible enemies set
    setVisibleEnemies(newVisibleEnemies)

    setEnemies(updatedEnemies)

    // Filter indicators to remove those for visible tank enemies
    const filteredLeftIndicators = leftIndicators.filter((indicator) => {
      // If it's a tank or boss and it's visible, don't show indicator
      return !((indicator.isTank || indicator.isBoss) && newVisibleEnemies.has(indicator.id))
    })

    const filteredRightIndicators = rightIndicators.filter((indicator) => {
      // If it's a tank or boss and it's visible, don't show indicator
      return !((indicator.isTank || indicator.isBoss) && newVisibleEnemies.has(indicator.id))
    })

    // Update enemy indicators in the store
    setEnemyIndicators({
      left: filteredLeftIndicators,
      right: filteredRightIndicators,
    })

    // Check for collisions between projectiles and enemies
    const hitEnemies = []
    const hitProjectiles = []

    projectiles.forEach((proj, pIndex) => {
      enemies.forEach((enemy, eIndex) => {
        const dx = proj.position[0] - enemy.position[0]
        const dz = proj.position[2] - enemy.position[2]
        const distance = Math.sqrt(dx * dx + dz * dz)

        // Different hit radius for different enemy types
        const hitRadius = enemy.type === "tank" ? 2.5 : 2

        // Increase hit radius for charged shots to prevent tunneling
        const projectileHitRadius = proj.charged ? 0.5 + proj.chargeLevel * 0.5 : 0.2
        const effectiveHitRadius = hitRadius + projectileHitRadius

        if (distance < effectiveHitRadius) {
          // Mark projectile as hit
          if (!hitProjectiles.includes(pIndex)) {
            hitProjectiles.push(pIndex)
          }

          // Check if this is a boss with an active shield
          if (enemy.type === "boss" && bossShieldActive) {
            // Damage the shield instead of the boss
            const newShieldHealth = Math.max(0, bossShieldHealth - proj.damage)

            // Update shield health in store
            setBossShieldStatus(true, newShieldHealth, bossShieldMaxHealth)

            // If shield is depleted, remove it
            if (newShieldHealth <= 0) {
              setBossShieldStatus(false, 0, 0)

              // Play shield break effect
              SoundEffects.unlockAudio()
              SoundEffects.playButtonClick()

              // Activate visual effect
              setShieldEffectActive(true)
              setShieldEffectTime(0)
            }
          } else {
            // Apply damage to normal enemies or unshielded boss
            const newHealth = enemy.health - proj.damage

            if (newHealth <= 0 && !hitEnemies.includes(eIndex)) {
              hitEnemies.push(eIndex)

              // Pass enemy type to killEnemy for coin rewards
              if (enemy.type === "boss") {
                // Give 25 coins for boss
                killEnemy("boss")
                // Add 24 more coins (since killEnemy already gives 1)
                addCoins(24)
              } else {
                killEnemy(enemy.type)
              }
            } else if (!hitEnemies.includes(eIndex)) {
              // Update enemy health
              updatedEnemies[eIndex] = {
                ...updatedEnemies[eIndex],
                health: newHealth,
              }

              // Update boss health in store if it's a boss
              if (enemy.type === "boss") {
                updateBossHealth(newHealth)

                // Check if need to activate the shield at the next threshold
                const healthPercent = newHealth / enemy.maxHealth

                if (!bossShieldActive && healthPercent <= bossNextShieldThreshold) {
                  // Activate boss shield
                  const shieldHealth = enemy.maxHealth * 0.2 // Shield is 20% of boss max health

                  // Update shield status in the store
                  setBossShieldStatus(true, shieldHealth, shieldHealth)

                  // Set the next threshold (75%, 50%, 25%)
                  if (bossNextShieldThreshold === 0.75) {
                    setBossNextShieldThreshold(0.5)
                  } else if (bossNextShieldThreshold === 0.5) {
                    setBossNextShieldThreshold(0.25)
                  } else {
                    setBossNextShieldThreshold(0) // No more shields after this
                  }

                  // Play shield activation sound
                  SoundEffects.unlockAudio()
                  SoundEffects.playButtonClick()

                  // Activate visual effect
                  setShieldEffectActive(true)
                  setShieldEffectTime(0)
                }
              }
            }
          }
        }
      })
    })

    // Remove hit enemies
    if (hitEnemies.length > 0) {
      setEnemies((prev) => prev.filter((_, index) => !hitEnemies.includes(index)))
    }

    // Remove hit projectiles
    if (hitProjectiles.length > 0) {
      setProjectiles((prev) => prev.filter((_, index) => !hitProjectiles.includes(index)))
    }
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 5, -5]} fov={70} />
      <DayNightCycle />

      {shieldActive && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial
            color={new THREE.Color("#4caf50")}
            transparent={true}
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <Ground />
      <Turret
        ref={turretRef}
        rotation={[0, turretRotation, 0]}
        turretType={settings.gameState.turretType}
        heatLevel={heatLevel}
        isOverheated={isOverheated}
        timeOfDay={timeOfDay}
        isSuperActive={isSuperActive}
        isCharging={isCharging}
        chargeLevel={chargeLevel}
      />

      {projectiles.map((proj) => (
        <Projectile
          key={proj.id}
          position={proj.position}
          turretType={proj.turretType}
          timeOfDay={timeOfDay}
          charged={proj.charged}
          chargeLevel={proj.chargeLevel}
          isSuperActive={proj.isSuperActive}
        />
      ))}

      {enemies.map((enemy) => {
        if (enemy.type === "boss") {
          return (
            <Boss
              key={enemy.id}
              position={enemy.position}
              health={enemy.health}
              maxHealth={enemy.maxHealth}
              hasShield={bossShieldActive}
              shieldHealth={bossShieldHealth}
              shieldMaxHealth={bossShieldMaxHealth}
            />
          )
        } else {
          return (
            <Enemy
              key={enemy.id}
              position={enemy.position}
              health={enemy.health}
              maxHealth={enemy.maxHealth}
              enemyType={enemy.type}
              timeOfDay={timeOfDay}
            />
          )
        }
      })}

      {/* Shield effect animation */}
      {shieldEffectActive && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[15 + shieldEffectTime * 10, 32, 32]} />
          <meshBasicMaterial
            color={new THREE.Color(bossShieldActive ? "#00aaff" : "#ff3300")}
            transparent={true}
            opacity={Math.max(0, 0.5 - shieldEffectTime / 4)}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  )
}
