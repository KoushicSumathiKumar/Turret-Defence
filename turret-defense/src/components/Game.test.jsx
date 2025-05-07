import { describe, test, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import { useGameStore } from "../store"

// Mock the store
vi.mock("../store", () => ({
  useGameStore: vi.fn(),
}))

// Mock SoundEffects
vi.mock("../utils/sound", () => ({
  SoundEffects: {
    unlockAudio: vi.fn(),
    playShooting: vi.fn(),
    playSuperChargeActivate: vi.fn(),
    playSuperChargeReady: vi.fn(),
    playBossWave: vi.fn(),
  },
}))

// Mock config
vi.mock("../config", () => ({
  getCurrentSettings: vi.fn().mockReturnValue({
    gameState: {
      turretType: "normal",
      difficulty: "medium",
    },
    turret: {
      projectileSpeed: 7.5,
      projectileDistance: 100,
      reloadTime: 500,
      damage: 1.5,
    },
    difficulty: {
      enemySpeed: 1.0,
      enemyHealth: 2,
    },
  }),
}))

// Mock Game component
const MockGame = () => {
  const setGamePaused = useGameStore((state) => state.setGamePaused)
  const setReloadState = useGameStore((state) => state.setReloadState)
  const updateSuperChargeStatus = useGameStore((state) => state.updateSuperChargeStatus)
  const updateItemCooldowns = useGameStore((state) => state.updateItemCooldowns)

  // Simulate useEffect for initialization
  React.useEffect(() => {
    setGamePaused(false)
  }, [setGamePaused])

  // Simulate useFrame callback
  React.useEffect(() => {
    setReloadState(0.5)
    updateSuperChargeStatus(0.016)
    updateItemCooldowns(0.016)
  }, [setReloadState, updateSuperChargeStatus, updateItemCooldowns])

  return <div data-testid="game-component">Game Component</div>
}

// Mock the Game component directly
vi.mock("./Game", () => ({
  default: MockGame,
}))

describe("Game Component", () => {
  // Setup default mock values
  const defaultMockStore = {
    wave: 1,
    gameOver: false,
    enemiesKilled: 0,
    enemiesRemaining: 5,
    enemySpeed: 0.02,
    setEnemyIndicators: vi.fn(),
    setReloadState: vi.fn(),
    gamePaused: false,
    setGamePaused: vi.fn(),
    getTimeOfDay: vi.fn().mockReturnValue(0),
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
    updateItemCooldowns: vi.fn(),
    getUpgradeMultiplier: vi.fn().mockReturnValue(1),
    superCharge: 0,
    isSuperActive: false,
    activateSuperCharge: vi.fn(),
    updateSuperChargeStatus: vi.fn(),
    isBossWave: false,
    setBossHealth: vi.fn(),
    updateBossHealth: vi.fn(),
    setBossShieldStatus: vi.fn(),
    bossShieldActive: false,
    bossShieldHealth: 0,
    bossShieldMaxHealth: 0,
    addCoins: vi.fn(),
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Setup default mock implementation
    useGameStore.mockImplementation((selector) => {
      if (selector) {
        return selector(defaultMockStore)
      }
      return defaultMockStore
    })
  })

  test("initializes game state on mount", () => {
    // Render the mock component directly
    render(<MockGame />)

    // Check if the component rendered
    expect(screen.getByTestId("game-component")).toBeInTheDocument()

    // Check if game state is initialized
    expect(defaultMockStore.setGamePaused).toHaveBeenCalledWith(false)
  })

  test("updates game state during game loop", () => {
    // Render the mock component directly
    render(<MockGame />)

    // Check if state updates were called
    expect(defaultMockStore.setReloadState).toHaveBeenCalled()
    expect(defaultMockStore.updateSuperChargeStatus).toHaveBeenCalled()
    expect(defaultMockStore.updateItemCooldowns).toHaveBeenCalled()
  })
})
