import { Canvas } from "@react-three/fiber"
import { Sky } from "@react-three/drei"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import Game from "./components/Game"
import UI from "./components/UI"
import MainMenu from "./components/MainMenu"
import AboutPage from "./components/AboutPage"
import { useGameStore } from "./store"
import { SoundEffects } from "./utils/sound"
import ModelViewerPage from "./components/ModelViewerPage"
import DemoPage from "./components/DemoPage"

// Background music controller component
function BackgroundMusic() {
  const isGameRoute = window.location.pathname === "/game"

  useEffect(() => {
    // Only play background music when not on the game route
    if (!isGameRoute) {
      const music = SoundEffects.playMainMenuMusic()

      return () => {
        // Only stop if we're navigating to the game route
        if (window.location.pathname === "/game") {
          SoundEffects.stopMainMenuMusic()
        }
      }
    }
  }, [isGameRoute])

  return null
}

// GameScreen component
function GameScreen({ returnToMenu }) {
  const gameOver = useGameStore((state) => state.gameOver)
  const wave = useGameStore((state) => state.wave)
  const enemiesKilled = useGameStore((state) => state.enemiesKilled)
  const enemiesRemaining = useGameStore((state) => state.enemiesRemaining)
  const fullReset = useGameStore((state) => state.fullReset)
  const setGamePaused = useGameStore((state) => state.setGamePaused)
  const [gameStarted, setGameStarted] = useState(false)

  // useEffect to handle the beforeunload event
  useEffect(() => {
    // Only add the event listener if the game is active (not game over)
    if (!gameOver) {
      const handleBeforeUnload = (e) => {
        // Standard way to show a confirmation dialog
        e.preventDefault()
        e.returnValue = "Your game progress will be lost. Are you sure you want to leave?"
        if (window.location.pathname !== "/") {
          sessionStorage.setItem("redirectToMenu", "true")
        }

        return e.returnValue
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [gameOver])

  // Start the game after a short delay to ensure everything is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameStarted(true)
      setGamePaused(false)
    }, 500)

    return () => {
      clearTimeout(timer)
      setGamePaused(true)
    }
  }, [setGamePaused])

  // Handle WebGL context loss
  const handleContextLost = (event) => {
    event.preventDefault()
  }

  // Handle WebGL context restoration
  const handleContextRestored = () => {
    // Force a re-render of the game
    setGameStarted(false)
    setTimeout(() => setGameStarted(true), 100)
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, -10], fov: 60 }}
        onContextLost={handleContextLost}
        onContextRestored={handleContextRestored}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          depth: true,
          stencil: false,
          alpha: false,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Sky sunPosition={[100, 100, 20]} />
        {gameStarted && <Game />}
      </Canvas>

      <UI
        gameOver={gameOver}
        wave={wave}
        enemiesKilled={enemiesKilled}
        enemiesRemaining={enemiesRemaining}
        returnToMenu={returnToMenu}
        fullReset={fullReset}
      />
    </div>
  )
}

// Main App component
function App() {
  const fullReset = useGameStore((state) => state.fullReset)
  const musicInitialized = useRef(false)

  // useEffect to unlock audio on first click
  useEffect(() => {
    const handleFirstClick = () => {
      SoundEffects.unlockAudio()

      if (!musicInitialized.current && window.location.pathname !== "/game") {
        SoundEffects.playMainMenuMusic()
        musicInitialized.current = true
      }

      document.removeEventListener("click", handleFirstClick)
    }

    document.addEventListener("click", handleFirstClick)

    return () => {
      document.removeEventListener("click", handleFirstClick)
    }
  }, [])

  // useEffect to check for the redirect flag
  useEffect(() => {
    // Check if we need to redirect to the main menu
    const shouldRedirect = sessionStorage.getItem("redirectToMenu") === "true"
    if (shouldRedirect) {
      sessionStorage.removeItem("redirectToMenu")
      fullReset()

      // Redirect to the main menu if not already there
      if (window.location.pathname !== "/") {
        window.location.href = "/"
      }
    }
  }, [fullReset])

  return (
    <Router>
      <BackgroundMusic />
      <Routes>
        <Route path="/" element={<MainMenuWrapper fullReset={fullReset} />} />
        <Route path="/game" element={<GameWrapper fullReset={fullReset} />} />
        <Route path="/about" element={<AboutPageWrapper />} />
        <Route path="/models" element={<ModelViewerPageWrapper />} />
        <Route path="/demo" element={<DemoPageWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

// Wrapper components
function MainMenuWrapper({ fullReset }) {
  const navigate = useNavigate()

  const startGame = () => {
    SoundEffects.stopMainMenuMusic()
    fullReset()
    navigate("/game")
  }

  const goToAbout = () => {
    SoundEffects.playButtonClick()
    navigate("/about")
  }

  return <MainMenu startGame={startGame} goToAbout={goToAbout} />
}

function GameWrapper({ fullReset }) {
  const navigate = useNavigate()

  const returnToMenu = () => {
    fullReset()
    navigate("/")
  }

  return <GameScreen returnToMenu={returnToMenu} />
}

function AboutPageWrapper() {
  const navigate = useNavigate()

  const returnToMenu = () => {
    navigate("/")
  }

  return <AboutPage returnToMenu={returnToMenu} />
}

function ModelViewerPageWrapper() {
  const navigate = useNavigate()

  const returnToMenu = () => {
    navigate("/")
  }

  return <ModelViewerPage returnToMenu={returnToMenu} />
}

function DemoPageWrapper() {
  const navigate = useNavigate()

  const returnToMenu = () => {
    navigate("/")
  }

  return <DemoPage returnToMenu={returnToMenu} />
}

export default App
