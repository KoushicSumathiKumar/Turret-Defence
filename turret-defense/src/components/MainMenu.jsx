import { useState, useRef, useEffect, Suspense } from "react"
import { setDifficulty, setTurretType, getDifficultySettings, getTurretSettings } from "../config"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useNavigate } from "react-router-dom"
import { SoundEffects } from "../utils/sound"

function TurretModel({ turretType }) {
  const gltf = useLoader(GLTFLoader, `/models/turrets/${turretType}.glb`)
  const modelRef = useRef()

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005
      // Floating effect
      modelRef.current.position.y = -1 + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  // Traverse the model to disable shadows
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = false
          node.receiveShadow = false
        }
      })
    }
  }, [gltf.scene])

  return <primitive ref={modelRef} object={gltf.scene} scale={1} position={[0, -1, 0]} />
}
function TurretViewer({ turretType }) {
  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        background: "linear-gradient(to bottom, #1a1a1a, #0a0a0a)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.6)",
      }}
    >
      <Canvas shadows={false} camera={{ position: [7, 4, 7], fov: 40 }}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 8, 30]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={2.0} castShadow={false} />
        <spotLight
          position={[3, 10, 3]}
          angle={0.4}
          penumbra={0.8}
          intensity={2.5}
          castShadow={false}
          color="#f0f0ff"
        />
        <pointLight position={[-5, 2, -5]} intensity={1.0} color="#ff6060" />
        <pointLight position={[5, 0, 5]} intensity={1.0} color="#60a0ff" />
        <pointLight position={[0, 0, -5]} intensity={1.0} color="#ffffff" />
        {/* Background stars */}
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <Suspense fallback={null}>
          <TurretModel turretType={turretType} />
        </Suspense>
        <OrbitControls minDistance={5} maxDistance={20} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

// Attribute bar component for displaying stats
function AttributeBar({ label, value, maxValue, color }) {
  const percentage = (value / maxValue) * 100

  return (
    <div style={{ marginBottom: "10px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
          fontSize: "14px",
        }}
      >
        <span>{label}</span>
        <span>
          {value}/{maxValue}
        </span>
      </div>
      <div
        style={{
          height: "8px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: color,
            boxShadow: `0 0 8px ${color}`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  )
}

// Difficulty badge component
function DifficultyBadge({ level, isSelected, onClick }) {
  // Define colors and difficulty descriptions
  const difficultyInfo = {
    easy: { color: "#4CAF50", bg: "rgba(76,175,80,0.2)", desc: "For casual players" },
    medium: { color: "#2196F3", bg: "rgba(33,150,243,0.2)", desc: "Balanced challenge" },
    hard: { color: "#FF9800", bg: "rgba(255,152,0,0.2)", desc: "For experienced players" },
    impossible: { color: "#F44336", bg: "rgba(244,67,54,0.2)", desc: "Survive if you can" },
  }

  const info = difficultyInfo[level]

  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 15px",
        background: isSelected ? info.bg : "rgba(255,255,255,0.05)",
        borderRadius: "8px",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        border: isSelected ? `2px solid ${info.color}` : "2px solid transparent",
        boxShadow: isSelected ? `0 0 15px ${info.color}40` : "none",
        width: "100%",
      }}
    >
      <div
        style={{
          textTransform: "uppercase",
          fontWeight: "bold",
          color: info.color,
          fontSize: "16px",
        }}
      >
        {level}
      </div>
      <div
        style={{
          fontSize: "12px",
          opacity: 0.7,
          marginTop: "4px",
        }}
      >
        {info.desc}
      </div>

      {isSelected && (
        <div
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: info.color,
            boxShadow: `0 0 8px ${info.color}`,
          }}
        />
      )}
    </div>
  )
}

// Main menu component
export default function MainMenu({ startGame }) {
  const navigate = useNavigate()
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [selectedTurret, setSelectedTurret] = useState("normal")
  const [isHovering, setIsHovering] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Add background music
  useEffect(() => {
    const music = SoundEffects.playMainMenuMusic()

    // Clean up when component unmounts
    return () => {
      SoundEffects.stopMainMenuMusic()
    }
  }, [])

  // Get difficulty and turret settings
  const difficultySettings = getDifficultySettings(selectedDifficulty)
  const turretSettings = getTurretSettings(selectedTurret)

  // Update the handleDifficultyChange function
  const handleDifficultyChange = (difficulty) => {
    SoundEffects.unlockAudio() 
    SoundEffects.playButtonSwitch()
    setSelectedDifficulty(difficulty)
    setDifficulty(difficulty)
  }

  // Update the handleTurretChange function
  const handleTurretChange = (turretType) => {
    SoundEffects.unlockAudio() 
    SoundEffects.playButtonSwitch()
    setSelectedTurret(turretType)
    setTurretType(turretType)
  }

  // Update the handleStartGame function to ensure it plays a sound and unlocks audio
  const handleStartGame = () => {
    SoundEffects.unlockAudio() 
    SoundEffects.playButtonClick()
    startGame()
  }

  // Get max values for stats comparison
  const getMaxStat = (statName) => {
    const allTurrets = ["normal", "sniper", "machineGun"]
    return Math.max(...allTurrets.map((t) => getTurretSettings(t)[statName] || 0))
  }

  const maxDamage = getMaxStat("damage")
  const maxReloadTime = getMaxStat("reloadTime")

  // Convert turret name for display
  const getTurretDisplayName = (name) => {
    switch (name) {
      case "machineGun":
        return "Machine Gun"
      case "normal":
        return "Standard"
      default:
        return name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  // Toggle model viewer
  const toggleModelViewer = () => {
    SoundEffects.unlockAudio()
    SoundEffects.playButtonClick()
    navigate("/models")
  }

  // Determine layout based on screen size
  const isSmallScreen = windowDimensions.width < 1024
  const isMobileScreen = windowDimensions.width < 768

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        background: "linear-gradient(135deg, #121212 0%, #1E1E1E 100%)",
        color: "white",
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
        padding: "20px",
        overflow: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Background vignette */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Game title - simplified for mobile */}
      <div
        style={{
          marginBottom: isMobileScreen ? "1.5rem" : "3rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: isMobileScreen ? "2.5rem" : "4rem",
            margin: 0,
            background: "linear-gradient(to bottom, #ff5555, #ff2222)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(255,85,85,0.4)",
            fontWeight: "900",
            letterSpacing: "2px",
          }}
        >
          TURRET DEFENSE
        </h1>
        <div
          style={{
            fontSize: isMobileScreen ? "0.8rem" : "1rem",
            opacity: 0.6,
            letterSpacing: isMobileScreen ? "4px" : "8px",
            textTransform: "uppercase",
            marginTop: "5px",
          }}
        >
          Survive the onslaught
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          width: "90%",
          maxWidth: "1200px",
          gap: isMobileScreen ? "20px" : "30px",
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {/* Main Settings Panel */}
        <div
          style={{
            background: "rgba(20,20,20,0.6)",
            backdropFilter: "blur(10px)",
            padding: isMobileScreen ? "1.5rem" : "2rem",
            borderRadius: "16px",
            width: isSmallScreen ? "100%" : "50%",
            flex: 1,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            boxSizing: "border-box",
            marginBottom: "20px",
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}
          >
            <h2 style={{ margin: 0, fontSize: isMobileScreen ? "1.5rem" : "1.8rem", fontWeight: "600" }}>
              Game Settings
            </h2>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  SoundEffects.playButtonClick()
                  navigate("/demo")
                }}
                style={{
                  padding: isMobileScreen ? "8px 12px" : "10px 15px",
                  fontSize: isMobileScreen ? "0.8rem" : "0.9rem",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                Watch Demo
              </button>
              <button
                onClick={() => {
                  SoundEffects.playButtonClick()
                  navigate("/about")
                }}
                style={{
                  padding: isMobileScreen ? "8px 12px" : "10px 15px",
                  fontSize: isMobileScreen ? "0.8rem" : "0.9rem",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                About Game
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#ccc",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  background: "#ff5555",
                  display: "inline-block",
                  borderRadius: "2px",
                }}
              ></span>
              Select Difficulty
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobileScreen ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "10px",
              }}
            >
              {["easy", "medium", "hard", "impossible"].map((diffName) => (
                <DifficultyBadge
                  key={diffName}
                  level={diffName}
                  isSelected={selectedDifficulty === diffName}
                  onClick={() => handleDifficultyChange(diffName)}
                />
              ))}
            </div>

            <div
              style={{
                marginTop: "15px",
                background: "rgba(0,0,0,0.2)",
                padding: "15px",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ marginBottom: "5px", color: "#aaa", fontWeight: "500" }}>Difficulty Stats:</div>
              <AttributeBar
                label="Enemy Speed"
                value={difficultySettings.enemySpeed}
                maxValue={getDifficultySettings("impossible").enemySpeed}
                color={selectedDifficulty === "impossible" ? "#F44336" : "#42A5F5"}
              />
              <AttributeBar
                label="Enemy Health"
                value={difficultySettings.enemyHealth}
                maxValue={getDifficultySettings("impossible").enemyHealth}
                color={selectedDifficulty === "impossible" ? "#F44336" : "#66BB6A"}
              />
            </div>
          </div>

          {/* Turret Selection */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#ccc",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  background: "#4CAF50",
                  display: "inline-block",
                  borderRadius: "2px",
                }}
              ></span>
              Select Turret
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: isMobileScreen ? "column" : "row",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              {["normal", "sniper", "machineGun"].map((turretName) => (
                <button
                  key={turretName}
                  onClick={() => handleTurretChange(turretName)}
                  style={{
                    padding: "12px 18px",
                    background:
                      selectedTurret === turretName
                        ? "linear-gradient(to bottom, #4CAF50, #388E3C)"
                        : "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    flex: 1,
                    fontSize: "1rem",
                    fontWeight: selectedTurret === turretName ? "bold" : "normal",
                    boxShadow: selectedTurret === turretName ? "0 0 15px rgba(76,175,80,0.4)" : "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    if (selectedTurret !== turretName) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.2)"
                      e.currentTarget.style.transform = "translateY(-2px)"
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedTurret !== turretName) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)"
                      e.currentTarget.style.transform = "translateY(0)"
                    }
                  }}
                >
                  {getTurretDisplayName(turretName)}
                </button>
              ))}
            </div>

            <div
              style={{
                background: "rgba(0,0,0,0.2)",
                padding: "15px",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "12px",
                  fontSize: "1.1rem",
                  color: "#4CAF50",
                }}
              >
                {turretSettings.name}
              </div>

              <p
                style={{
                  marginBottom: "15px",
                  lineHeight: "1.5",
                  color: "#ddd",
                }}
              >
                {turretSettings.description}
              </p>

              <AttributeBar label="Damage" value={turretSettings.damage} maxValue={maxDamage} color="#FF5722" />

              <AttributeBar
                label="Reload Time"
                value={turretSettings.reloadTime}
                maxValue={maxReloadTime}
                color="#29B6F6"
              />
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={handleStartGame}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              padding: "15px 30px",
              fontSize: "1.3rem",
              fontWeight: "bold",
              background: `linear-gradient(to bottom, ${isHovering ? "#5cb85c" : "#4CAF50"}, ${isHovering ? "#449d44" : "#388E3C"})`,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 15px rgba(76,175,80,0.3)",
              transform: isHovering ? "translateY(-2px)" : "translateY(0)",
              position: "relative",
              overflow: "hidden",
              marginBottom: isSmallScreen ? "20px" : 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                transform: `translateX(${isHovering ? "100%" : "-100%"})`,
                transition: "transform 0.6s ease",
              }}
            ></div>
            START GAME
          </button>
        </div>

        {/* 3D Turret Viewer Panel */}
        <div
          style={{
            background: "rgba(20,20,20,0.6)",
            backdropFilter: "blur(10px)",
            padding: isMobileScreen ? "1.5rem" : "2rem",
            borderRadius: "16px",
            width: isSmallScreen ? "100%" : "40%",
            flex: 1,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            boxSizing: "border-box",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: isMobileScreen ? "1.5rem" : "1.8rem",
                fontWeight: "600",
              }}
            >
              Turret Preview
            </h2>
            <button
              onClick={toggleModelViewer}
              style={{
                padding: isMobileScreen ? "8px 12px" : "10px 15px",
                fontSize: isMobileScreen ? "0.8rem" : "0.9rem",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              Open Model Viewer
            </button>
          </div>

          <div
            style={{
              marginBottom: "1.5rem",
              textAlign: "center",
              color: "#aaa",
              fontSize: "0.9rem",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: "2px solid #aaa",
                }}
              ></div>
              <span>Drag to rotate</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#aaa",
                  borderRadius: "2px",
                }}
              ></div>
              <span>Scroll to zoom</span>
            </div>
          </div>

          {/* Suspense is needed for React to handle async loading */}
          <Suspense
            fallback={
              <div
                style={{
                  width: "100%",
                  height: "350px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(to bottom, #1a1a1a, #0a0a0a)",
                  borderRadius: "12px",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.1)",
                    borderTopColor: "#4CAF50",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <div>Loading model...</div>
              </div>
            }
          >
            <TurretViewer turretType={selectedTurret} />
          </Suspense>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "1.2rem",
              fontWeight: "500",
              color: "#4CAF50",
            }}
          >
            {getTurretDisplayName(selectedTurret)} Turret
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Mobile-specific adjustments */
          @media (max-width: 768px) {
            body {
              font-size: 14px;
            }
          }
        `}
      </style>
    </div>
  )
}
