import { describe, test, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import UI from "./UI"
import { useGameStore } from "../store"

// Mock the store
vi.mock("../store", () => ({
  useGameStore: vi.fn(),
}))

// Mock SoundEffects
vi.mock("../utils/sound", () => ({
  SoundEffects: {
    unlockAudio: vi.fn(),
    playButtonClick: vi.fn(),
    playGameOver: vi.fn(),
    playUpgrade: vi.fn(),
    playSuperChargeReady: vi.fn(),
  },
}))

// Mock ItemsBar component
vi.mock("./ItemsBar", () => ({
  default: () => <div data-testid="items-bar">Items Bar Mock</div>,
}))

// Mock UpgradeScreen component
vi.mock("./UpgradeScreen", () => ({
  default: ({ onContinue }) => (
    <div data-testid="upgrade-screen">
      Upgrade Screen Mock
      <button onClick={onContinue}>Continue</button>
    </div>
  ),
}))

describe("UI Component", () => {
  // Setup default mock values
  const defaultMockStore = {
    wave: 3,
    enemiesKilled: 25,
    enemiesRemaining: 10,
    enemyIndicators: { left: [], right: [] },
    reloadState: { progress: 0.7, heatLevel: 0.3, isOverheated: false, isCharging: false, chargeLevel: 0 },
    superCharge: 50,
    isSuperActive: false,
    superActiveStartTime: 0,
    superActiveDuration: 10,
    showUpgradeScreen: false,
    setShowUpgradeScreen: vi.fn(),
    coins: 100,
    isBossWave: false,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossShieldActive: false,
    bossShieldHealth: 0,
    bossShieldMaxHealth: 0,
    getUpgradeMultiplier: vi.fn(),
    activeItems: {},
    itemCooldowns: {},
    getTimeOfDay: vi.fn().mockReturnValue(0),
    setGamePaused: vi.fn(),
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

  test("renders wave information correctly", () => {
    render(<UI wave={3} enemiesKilled={25} enemiesRemaining={10} gameOver={false} returnToMenu={() => {}} />)

    // Check if wave information is displayed
    expect(screen.getByText(/WAVE 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Killed: 25/i)).toBeInTheDocument()
    expect(screen.getByText(/Remaining: 10/i)).toBeInTheDocument()
    expect(screen.getByText(/Coins: 100/i)).toBeInTheDocument()
  })

  test("renders game over screen when game is over", () => {
    render(<UI wave={3} enemiesKilled={25} enemiesRemaining={0} gameOver={true} returnToMenu={vi.fn()} />)

    // Check if game over screen is displayed
    expect(screen.getByText(/GAME OVER/i)).toBeInTheDocument()
    expect(screen.getByText(/STATISTICS/i)).toBeInTheDocument()

    // Check if statistics are displayed correctly
    expect(screen.getByText("3")).toBeInTheDocument() // Wave reached
    expect(screen.getByText("25")).toBeInTheDocument() // Enemies defeated

    // Check if buttons are displayed
    expect(screen.getByText(/Main Menu/i)).toBeInTheDocument()
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument()
  })

  test("renders upgrade screen when showUpgradeScreen is true", () => {
    // Override the default mock for this test
    useGameStore.mockImplementation((selector) => {
      if (selector) {
        return selector({
          ...defaultMockStore,
          showUpgradeScreen: true,
        })
      }
      return {
        ...defaultMockStore,
        showUpgradeScreen: true,
      }
    })

    render(<UI wave={3} enemiesKilled={25} enemiesRemaining={10} gameOver={false} returnToMenu={() => {}} />)

    // Check if upgrade screen is displayed
    expect(screen.getByTestId("upgrade-screen")).toBeInTheDocument()
  })

  test("renders boss health bar during boss wave", () => {
    // Override the default mock for this test
    useGameStore.mockImplementation((selector) => {
      if (selector) {
        return selector({
          ...defaultMockStore,
          isBossWave: true,
          bossHealth: 500,
          bossMaxHealth: 1000,
        })
      }
      return {
        ...defaultMockStore,
        isBossWave: true,
        bossHealth: 500,
        bossMaxHealth: 1000,
      }
    })

    render(<UI wave={3} enemiesKilled={25} enemiesRemaining={10} gameOver={false} returnToMenu={() => {}} />)

    // Check if boss health information is displayed
    expect(screen.getByText(/BOSS/i)).toBeInTheDocument()
    expect(screen.getByText(/500 \/ 1000/i)).toBeInTheDocument()
  })

  test("renders super charge information", () => {
    render(<UI wave={3} enemiesKilled={25} enemiesRemaining={10} gameOver={false} returnToMenu={() => {}} />)

    // Check if super charge information is displayed - use more specific selector
    expect(screen.getByText("SUPER CHARGE")).toBeInTheDocument()
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  test("renders machine gun heat indicator for machine gun turret", () => {
    // Override the default mock for this test to simulate machine gun turret
    const getCurrentSettings = vi.fn().mockReturnValue({
      gameState: { turretType: "machineGun" },
      turret: { name: "Machine Gun Turret" },
    })

    vi.mock("../config", () => ({
      getCurrentSettings: () => ({
        gameState: { turretType: "machineGun" },
        turret: { name: "Machine Gun Turret" },
      }),
    }))

    render(<UI wave={3} enemiesKilled={25} enemiesRemaining={10} gameOver={false} returnToMenu={() => {}} />)

    // Check if heat indicator is displayed
    expect(screen.getByText(/HEAT/i)).toBeInTheDocument()
  })
})
