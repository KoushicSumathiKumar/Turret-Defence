import { describe, test, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import MainMenu from "./MainMenu"
import { setDifficulty, setTurretType } from "../config"
import { SoundEffects } from "../utils/sound"

// Mock React Router
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}))

// Mock SoundEffects
vi.mock("../utils/sound", () => ({
  SoundEffects: {
    unlockAudio: vi.fn(),
    playButtonClick: vi.fn(),
    playButtonSwitch: vi.fn(),
    playMainMenuMusic: vi.fn().mockReturnValue({
      play: vi.fn(),
      pause: vi.fn(),
    }),
    stopMainMenuMusic: vi.fn(),
  },
}))

// Mock config functions
vi.mock("../config", () => ({
  setDifficulty: vi.fn(),
  setTurretType: vi.fn(),
  getDifficultySettings: vi.fn().mockReturnValue({
    enemySpeed: 1.0,
    enemyHealth: 2,
  }),
  getTurretSettings: vi.fn().mockReturnValue({
    name: "Standard Turret",
    description: "Balanced performance with medium range and fire rate",
    damage: 1.5,
    reloadTime: 500,
  }),
  getCurrentSettings: vi.fn().mockReturnValue({
    gameState: {
      difficulty: "medium",
      turretType: "normal",
    },
  }),
}))

// Mock React Three Fiber components
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }) => <div data-testid="canvas-mock">{children}</div>,
  useFrame: vi.fn(),
  useLoader: vi.fn().mockReturnValue({}),
}))

// Mock React Three Drei components
vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="orbit-controls-mock">OrbitControls</div>,
  Stars: () => <div data-testid="stars-mock">Stars</div>,
}))

// Mock Three.js GLTFLoader
vi.mock("three/examples/jsm/loaders/GLTFLoader", () => ({
  GLTFLoader: class {
    load() {}
  },
}))

describe("MainMenu Component", () => {
  const startGameMock = vi.fn()

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  test("renders main menu with title", () => {
    render(<MainMenu startGame={startGameMock} />)

    // Check if title is displayed
    expect(screen.getByText(/TURRET DEFENSE/i)).toBeInTheDocument()
    expect(screen.getByText(/Survive the onslaught/i)).toBeInTheDocument()
  })

  test("renders difficulty selection options", () => {
    render(<MainMenu startGame={startGameMock} />)

    // Check if difficulty options are displayed - use more specific selectors
    expect(screen.getByText("easy")).toBeInTheDocument()
    expect(screen.getByText("medium")).toBeInTheDocument()
    expect(screen.getByText("hard")).toBeInTheDocument()
    expect(screen.getByText("impossible")).toBeInTheDocument()
  })

  test("renders turret selection options", () => {
    render(<MainMenu startGame={startGameMock} />)

    const buttons = screen.getAllByRole("button")
    const standardButton = Array.from(buttons).find((button) => button.textContent === "Standard")
    const sniperButton = Array.from(buttons).find((button) => button.textContent === "Sniper")
    const machineGunButton = Array.from(buttons).find((button) => button.textContent === "Machine Gun")

    expect(standardButton).toBeInTheDocument()
    expect(sniperButton).toBeInTheDocument()
    expect(machineGunButton).toBeInTheDocument()
  })

  test("calls setDifficulty when difficulty is changed", () => {
    render(<MainMenu startGame={startGameMock} />)

    // Find and click a difficulty option
    const hardOption = screen.getByText(/hard/i)
    fireEvent.click(hardOption)

    // Check if setDifficulty was called with the correct parameter
    expect(setDifficulty).toHaveBeenCalledWith("hard")
    expect(SoundEffects.playButtonSwitch).toHaveBeenCalled()
  })

  test("calls setTurretType when turret is changed", () => {
    render(<MainMenu startGame={startGameMock} />)

    // Find and click a turret option
    const sniperOption = screen.getByText(/Sniper/i)
    fireEvent.click(sniperOption)

    // Check if setTurretType was called with the correct parameter
    expect(setTurretType).toHaveBeenCalledWith("sniper")
    expect(SoundEffects.playButtonSwitch).toHaveBeenCalled()
  })

  test("calls startGame when start game button is clicked", () => {
    render(<MainMenu startGame={startGameMock} />)

    // Find and click the start game button
    const startButton = screen.getByText(/START GAME/i)
    fireEvent.click(startButton)

    // Check if startGame was called
    expect(startGameMock).toHaveBeenCalled()
    expect(SoundEffects.playButtonClick).toHaveBeenCalled()
  })

  test("renders turret preview section", () => {
    render(<MainMenu startGame={startGameMock} />)

    // Check if turret preview section is displayed
    expect(screen.getByText(/Turret Preview/i)).toBeInTheDocument()
    expect(screen.getByText(/Open Model Viewer/i)).toBeInTheDocument()

    // Check if canvas mock is rendered
    expect(screen.getByTestId("canvas-mock")).toBeInTheDocument()
  })

  test("displays turret information", () => {
    render(<MainMenu startGame={startGameMock} />)

    // Use more specific selector for turret information
    const turretInfoHeading = screen.getAllByText(/Standard Turret/i)[0]
    expect(turretInfoHeading).toBeInTheDocument()
    expect(screen.getByText(/Balanced performance with medium range and fire rate/i)).toBeInTheDocument()
  })
})
