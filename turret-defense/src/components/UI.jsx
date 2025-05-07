import { useGameStore } from "../store"
import { getCurrentSettings } from "../config"
import { useState, useEffect } from "react"
import UpgradeScreen from "./UpgradeScreen"
import { SoundEffects } from "../utils/sound"
import ItemsBar from "./ItemsBar"

export default function UI({ gameOver, wave, enemiesKilled, enemiesRemaining, returnToMenu }) {
  const enemyIndicators = useGameStore((state) => state.enemyIndicators)
  const reloadState = useGameStore((state) => state.reloadState)
  const settings = getCurrentSettings()
  const turretType = settings.gameState.turretType
  const isMachineGun = turretType === "machineGun"
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [sortField, setSortField] = useState("")
  const [sortDirection, setSortDirection] = useState("asc")
  const setGameOver = useGameStore((state) => state.setGameOver)

  const [showAddForm, setShowAddForm] = useState(false)
  const [username, setUsername] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  // Pulse animation for critical states
  const [pulseState, setPulseState] = useState(0)

  // Get super charge state
  const superCharge = useGameStore((state) => state.superCharge)
  const isSuperActive = useGameStore((state) => state.isSuperActive)
  const superActiveStartTime = useGameStore((state) => state.superActiveStartTime)
  const superActiveDuration = useGameStore((state) => state.superActiveDuration)

  // Calculate super charge timer
  const [superTimeLeft, setSuperTimeLeft] = useState(0)

  const [selectedDifficulty, setSelectedDifficulty] = useState("easy")

  // State to track submitted usernames
  const [hasSubmittedThisGame, setHasSubmittedThisGame] = useState(false)

  // Destructured state from useGameStore
  const isBossWave = useGameStore((state) => state.isBossWave)
  const bossHealth = useGameStore((state) => state.bossHealth)
  const bossMaxHealth = useGameStore((state) => state.bossMaxHealth)
  const bossShieldActive = useGameStore((state) => state.bossShieldActive)
  const bossShieldHealth = useGameStore((state) => state.bossShieldHealth)
  const bossShieldMaxHealth = useGameStore((state) => state.bossShieldMaxHealth)

  // useEffect to update the super charge timer
  useEffect(() => {
    if (isSuperActive) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - superActiveStartTime) / 1000
        const remaining = Math.max(0, superActiveDuration - elapsed)
        setSuperTimeLeft(remaining)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isSuperActive, superActiveStartTime, superActiveDuration])

  // Get upgrade screen state
  const showUpgradeScreen = useGameStore((state) => state.showUpgradeScreen)
  const setShowUpgradeScreen = useGameStore((state) => state.setShowUpgradeScreen)
  const coins = useGameStore((state) => state.coins)

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Determine layout based on screen size
  const isSmallScreen = windowDimensions.width < 1024
  const isMobileScreen = windowDimensions.width < 768

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseState((prev) => (prev === 1 ? 0 : 1))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showLeaderboard) {
      fetch("http://localhost:3000/api/leaderboard")
        .then((response) => response.json())
        .then((data) => setLeaderboardData(data.leaderboard || []))
        .catch((error) => console.error("Error fetching leaderboard:", error))
    }
  }, [showLeaderboard])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/leaderboard")
      const data = await response.json()
      setLeaderboardData(data.leaderboard || [])
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!username) {
      setErrorMessage("All fields are required!")
      return
    }

    if (hasSubmittedThisGame) {
      setErrorMessage("You have already submitted your score for this game.")
      return
    }

    try {
      const date_time = new Date().toISOString() // Get the current date/time in ISO format
      const response = await fetch("http://localhost:3000/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          difficulty: settings.gameState.difficulty,
          wave: Number.parseInt(wave),
          enemies_defeated: Number.parseInt(enemiesKilled),
          turretType,
          date_time,
        }),
      })

      if (response.ok) {
        setHasSubmittedThisGame(true)
        // Reset form and show success
        setUsername("")
        setErrorMessage("")
        setShowAddForm(false)
        fetchLeaderboard() // Fetch leaderboard after adding a new entry
      } else {
        const result = await response.json()
        setErrorMessage(result.error || "An error occurred!")
      }
    } catch (error) {
      setErrorMessage("Failed to add leaderboard entry.")
    }
  }

  // Calculate color based on heat level
  const getHeatColor = (level) => {
    if (level > 0.9) return "#ff0000"
    if (level > 0.7) return "#ff4500"
    if (level > 0.5) return "#ff8c00"
    if (level > 0.3) return "#ffa500"
    return "#76ff03"
  }

  const filteredData = leaderboardData
  .filter((entry) => entry.difficulty === selectedDifficulty)
  .sort((a, b) => {
    if (b.wave !== a.wave) {
      return a.wave - b.wave
    }
    return a.enemies_defeated - b.enemies_defeated
  })

  // Sort the filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "date_time") {
      const dateA = new Date(a[sortField])
      const dateB = new Date(b[sortField])
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    } else {
      return sortDirection === "asc" ? (a[sortField] > b[sortField] ? 1 : -1) : a[sortField] < b[sortField] ? 1 : -1
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Play game over sound when game ends
  useEffect(() => {
    if (gameOver) {
      SoundEffects.playGameOver()
    }
  }, [gameOver])

  // Visual effects for active items
  const activeItems = useGameStore((state) => state.activeItems)
  const itemCooldowns = useGameStore((state) => state.itemCooldowns)

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        userSelect: "none",
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
      }}
    >
      {/* Visual overlays for active items */}
      {/* Slow Effect - Blue Overlay */}
      {activeItems.absoluteZero && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            background: "rgba(33, 150, 243, 0.15)",
            boxShadow: "inset 0 0 100px rgba(33, 150, 243, 0.3)",
            zIndex: 5,
          }}
        >
          {/* Frost/ice particles at the edges */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50px",
              background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)",
              opacity: Math.sin(Date.now() * 0.001) * 0.3 + 0.7,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50px",
              background: "linear-gradient(to top, rgba(255, 255, 255, 0.2), transparent)",
              opacity: Math.sin(Date.now() * 0.001 + 1) * 0.3 + 0.7,
            }}
          />
        </div>
      )}

      {/* EMP Blast Effect - Electric Overlay */}
      {activeItems.empBlast && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {/* Electric arcs */}
          {[...Array(8)].map((_, i) => {
            const randomX = Math.sin(Date.now() * 0.001 + i) * 50 + 50
            const randomY = Math.cos(Date.now() * 0.002 + i) * 50 + 50
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: `${randomY}%`,
                  left: `${randomX}%`,
                  width: "100px",
                  height: "2px",
                  background: "#ffc107",
                  boxShadow: "0 0 10px #ffc107, 0 0 20px #ffc107",
                  transform: `rotate(${Math.random() * 360}deg)`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
              />
            )
          })}

          {/* Yellow tint */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 193, 7, 0.1)",
              boxShadow: "inset 0 0 100px rgba(255, 193, 7, 0.2)",
            }}
          />
        </div>
      )}

      {/* Time Warp Effect - Purple Ripple */}
      {activeItems.timeWarp && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {/* Ripple effect */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              transform: "translate(-50%, -50%) scale(0)",
              border: "2px solid #9c27b0",
              boxShadow: "0 0 20px #9c27b0",
              animation: "ripple 1s ease-out",
            }}
          />

          {/* Purple tint */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(156, 39, 176, 0.1)",
              animation: "fade-out 1s ease-out forwards",
            }}
          />

          {/* Keyframes for animations */}
          <style>
            {`
              @keyframes ripple {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
              }
              @keyframes fade-out {
                0% { opacity: 0.3; }
                100% { opacity: 0; }
              }
            `}
          </style>
        </div>
      )}

      {/* Top HUD Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "1vh 2vh",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
        }}
      >
        {/* Wave Status */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "4vh",
              fontWeight: "600",
              color: "#fff",
              textShadow: "0 0 1vh rgba(0,0,0,0.7)",
              marginBottom: "1vh",
            }}
          >
            WAVE {wave}
          </div>

          <div
            style={{
              display: "flex",
              gap: "5vh",
              color: "#e0e0e0",
              fontSize: "2vh",
              textShadow: "0 0 0.5vh rgba(0,0,0,0.5)",
            }}
          >
            <div>
              <span style={{ color: "#ff5252" }}>●</span> Killed: {enemiesKilled}
            </div>
            <div>
              <span style={{ color: "#1591EA" }}>●</span> Remaining: {enemiesRemaining}
            </div>
            <div>
              <span style={{ color: "#ffd700" }}>●</span> Coins: {coins}
            </div>
          </div>
        </div>

        {/* Active Effects Timer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "1vh",
          }}
        >
          {Object.entries(itemCooldowns).map(([item, cooldown]) => {
            if (cooldown > 0 && activeItems[item]) {
              // Only show active effects
              return (
                <div
                  key={item}
                  style={{
                    position: "absolute",
                    top: "2vh",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(0.5vh)",
                    borderRadius: "1vh",
                    padding: "0.5vh 1vh",
                    fontSize: "1.75vh",
                    color: getItemColor(item),
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5vh",
                  }}
                >
                  {getItemIcon(item, 16)}
                  <span style={{ fontWeight: "bold" }}>{getItemName(item)}:</span> {cooldown.toFixed(1)}s
                </div>
              )
            }
            return null
          })}
        </div>

        {/* Controls Guide */}
        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(0.5vh)",
            borderRadius: "1.5vh",
            padding: "1.25vh 1.5vh",
            fontSize: "1.75vh",
            color: "#e0e0e0",
            marginTop: "1vh",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "0.75vh", color: "#fff" }}>CONTROLS</div>
          <div style={{ display: "flex", gap: "2vh" }}>
            <div>
              <span style={{ color: "#64b5f6", fontWeight: "bold" }}>A/D</span> Rotate
            </div>
            <div>
              <span style={{ color: "#64b5f6", fontWeight: "bold" }}>S</span> Fire
            </div>
            <div>
              <span style={{ color: "#64b5f6", fontWeight: "bold" }}>Q</span> Super Charge
            </div>
          </div>
        </div>
      </div>

      {/* Boss Health Bar - only show during boss waves when boss is alive */}
      {isBossWave && bossHealth > 0 && (
        <div
          style={{
            position: "absolute",
            top: "15vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60vh",
            maxWidth: "90%",
            background: "rgba(0,0,0,0.7)",
            padding: "1.5vh",
            borderRadius: "1vh",
            border: bossShieldActive ? "0.2vh solid rgba(0,170,255,0.7)" : "0.2vh solid rgba(255,0,0,0.5)",
            boxShadow: bossShieldActive
              ? "0 0 2vh rgba(0,170,255,0.5), inset 0 0 1vh rgba(0,170,255,0.3)"
              : "0 0 2vh rgba(255,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "1vh",
            zIndex: 10,
            transition: "border 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "2.5vh",
                fontWeight: "bold",
                color: bossShieldActive ? "#00aaff" : "#ff0000",
                textShadow: bossShieldActive ? "0 0 0.5vh rgba(0,170,255,0.7)" : "0 0 0.5vh rgba(255,0,0,0.7)",
                transition: "color 0.3s ease, text-shadow 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "1vh",
              }}
            >
              BOSS
              {bossShieldActive && (
                <div
                  style={{
                    fontSize: "1.8vh",
                    color: "#00aaff",
                    background: "rgba(0,170,255,0.2)",
                    padding: "0.3vh 0.8vh",
                    borderRadius: "0.5vh",
                    border: "0.1vh solid rgba(0,170,255,0.5)",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  SHIELD ACTIVE
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: "2vh",
                color: "#ffffff",
              }}
            >
              {Math.ceil(bossHealth)} / {bossMaxHealth}
            </div>
          </div>

          {/* Health bar with shield effect */}
          <div
            style={{
              position: "relative",
              height: "2vh",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "0.5vh",
              overflow: "hidden",
              border: "0.1vh solid rgba(255,255,255,0.2)",
            }}
          >
            {/* Shield glow effect */}
            {bossShieldActive && (
              <div
                style={{
                  position: "absolute",
                  top: "-0.5vh",
                  left: "-0.5vh",
                  right: "-0.5vh",
                  bottom: "-0.5vh",
                  borderRadius: "1vh",
                  boxShadow: "0 0 1vh #00aaff, inset 0 0 0.5vh #00aaff",
                  opacity: 0.7,
                  animation: "pulse 1.5s infinite",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}

            {/* Health bar fill */}
            <div
              style={{
                position: "relative",
                height: "100%",
                width: `${(bossHealth / bossMaxHealth) * 100}%`,
                background: bossShieldActive
                  ? "linear-gradient(to right, #00aaff, #66ccff)"
                  : "linear-gradient(to right, #ff0000, #ff5555)",
                borderRadius: "0.5vh",
                transition: "width 0.3s ease, background 0.3s ease",
                boxShadow: bossShieldActive ? "0 0 1vh rgba(0,170,255,0.7)" : "0 0 1vh rgba(255,0,0,0.7)",
                zIndex: 2,
              }}
            />

            {/* Shield energy lines effect */}
            {bossShieldActive && (
              <>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: "0",
                      left: `${i * 25}%`,
                      height: "100%",
                      width: "0.2vh",
                      background: "rgba(255,255,255,0.7)",
                      boxShadow: "0 0 0.5vh #ffffff",
                      animation: `shieldLine 2s infinite ${i * 0.2}s`,
                      zIndex: 3,
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Shield health bar - only show when shield is active */}
          {bossShieldActive && (
            <div
              style={{
                position: "relative",
                height: "1.5vh",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "0.5vh",
                overflow: "hidden",
                border: "0.1vh solid rgba(0,170,255,0.3)",
                marginTop: "0.5vh",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(bossShieldHealth / bossShieldMaxHealth) * 100}%`,
                  background: "linear-gradient(to right, #0088cc, #00aaff)",
                  borderRadius: "0.5vh",
                  transition: "width 0.3s ease",
                  boxShadow: "0 0 1vh rgba(0,170,255,0.7)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2vh",
                  color: "#ffffff",
                  textShadow: "0 0 0.3vh rgba(0,0,0,0.9)",
                  fontWeight: "bold",
                }}
              >
                SHIELD: {Math.ceil(bossShieldHealth)} / {bossShieldMaxHealth}
              </div>
            </div>
          )}

          {/* Keyframes for animations */}
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
              }
              @keyframes shieldLine {
                0% { transform: translateX(0); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateX(60vh); opacity: 0; }
              }
            `}
          </style>
        </div>
      )}

      {/* Crosshair and Weapon System */}
      <div
        style={{
          position: "absolute",
          top: "42.5%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Reload Circle */}
        <div
          style={{
            position: "relative",
            width: "8.75vh",
            height: "8.75vh",
          }}
        >
          {/* Base circle */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "0.25vh solid rgba(255,255,255,0.2)",
              boxShadow: "0 0 1.25vh rgba(0,0,0,0.5)",
            }}
          />

          {/* Progress circle - using conic gradient for smooth fill */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `conic-gradient(
              ${isMachineGun && reloadState.isOverheated ? "#ff2222" : "#4caf50"} 
              ${reloadState.progress * 360}deg, 
              transparent ${reloadState.progress * 360}deg 360deg
            )`,
              opacity: 0.7,
            }}
          />

          {/* Inner circle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "7.25vh",
              height: "7.25vh",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(0.25vh)",
            }}
          />

          {/* Crosshair */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "5vh",
              height: "5vh",
            }}
          >
            {/* Horizontal line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                width: "100%",
                height: "0.25vh",
                backgroundColor: isMachineGun && reloadState.isOverheated ? "#ff2222" : "#ff5252",
                transform: "translateY(-50%)",
                boxShadow: "0 0 0.75vh rgba(255,80,80,0.7)",
              }}
            />

            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "50%",
                width: "0.25vh",
                height: "100%",
                backgroundColor: isMachineGun && reloadState.isOverheated ? "#ff2222" : "#ff5252",
                transform: "translateX(-50%)",
                boxShadow: "0 0 0.75vh rgba(255,80,80,0.7)",
              }}
            />

            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "0.5vh",
                height: "0.5vh",
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 1vh rgba(255,255,255,0.9)",
              }}
            />

            {/* Outer ring */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "2vh",
                height: "2vh",
                border: `0.25vh solid ${isMachineGun && reloadState.isOverheated ? "#ff2222" : "#ff5252"}`,
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 0.75vh rgba(255,80,80,0.7)",
              }}
            />
          </div>
        </div>

        {/* Machine Gun Heat Indicator */}
        {isMachineGun && (
          <div
            style={{
              marginTop: "2vh",
              width: "12.5vh",
              position: "relative",
            }}
          >
            {/* Heat bar background */}
            <div
              style={{
                height: "0.75vh",
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "0.5vh",
                overflow: "hidden",
                boxShadow: "0 0 0.75vh rgba(0,0,0,0.5)",
              }}
            >
              {/* Heat level fill */}
              <div
                style={{
                  height: "100%",
                  width: `${reloadState.heatLevel * 100}%`,
                  backgroundColor: getHeatColor(reloadState.heatLevel),
                  borderRadius: "0.5vh",
                  transition: "width 0.1s linear, background-color 0.3s ease",
                  boxShadow: reloadState.heatLevel > 0.7 ? `0 0 1vh ${getHeatColor(reloadState.heatLevel)}` : "none",
                }}
              />
            </div>

            {/* Heat label */}
            <div
              style={{
                fontSize: "1.5vh",
                color: "#fff",
                textAlign: "center",
                marginTop: "0.5vh",
                textShadow: "0 0 0.5vh rgba(0,0,0,0.8)",
                fontWeight: reloadState.heatLevel > 0.7 ? "bold" : "normal",
              }}
            >
              {reloadState.isOverheated ? "OVERHEATED" : "HEAT"}
            </div>
          </div>
        )}
        {/* Sniper Charge Indicator */}
        {turretType === "sniper" && (
          <div
            style={{
              marginTop: "2vh",
              width: "12.5vh",
              position: "relative",
            }}
          >
            {/* Charge bar background */}
            <div
              style={{
                height: "0.75vh",
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "0.5vh",
                overflow: "hidden",
                boxShadow: "0 0 0.75vh rgba(0,0,0,0.5)",
              }}
            >
              {/* Charge level fill */}
              <div
                style={{
                  height: "100%",
                  width: `${reloadState.chargeLevel * 100}%`,
                  backgroundColor: reloadState.isCharging ? "#2196f3" : "#64b5f6",
                  borderRadius: "0.5vh",
                  transition: "width 0.1s linear, background-color 0.3s ease",
                  boxShadow: reloadState.chargeLevel > 0.7 ? `0 0 1vh #2196f3` : "none",
                }}
              />
            </div>

            {/* Charge label */}
            <div
              style={{
                fontSize: "1.5vh",
                color: "#fff",
                textAlign: "center",
                marginTop: "0.5vh",
                textShadow: "0 0 0.5vh rgba(0,0,0,0.8)",
                fontWeight: reloadState.chargeLevel > 0.7 ? "bold" : "normal",
              }}
            >
              {reloadState.isCharging ? "CHARGING" : "CHARGE"}
            </div>
          </div>
        )}
      </div>

      {/* Super Charge Indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "3.75vh",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25vh",
          pointerEvents: "none",
        }}
      >
        {/* Super charge bar */}
        <div
          style={{
            width: "25vh",
            height: "2vh",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "1.25vh",
            overflow: "hidden",
            border: isSuperActive ? "0.25vh solid #ffff00" : "0.25vh solid rgba(255,255,255,0.3)",
            boxShadow: isSuperActive ? "0 0 1.25vh #ffff00" : "none",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${superCharge}%`,
              background: isSuperActive
                ? "linear-gradient(90deg, #ffff00, #ffffff)"
                : superCharge >= 100
                  ? "linear-gradient(90deg, #ffff00, #ffa500)"
                  : "linear-gradient(90deg, #4CAF50, #8BC34A)",
              transition: "width 0.3s ease",
              boxShadow: superCharge >= 100 ? "0 0 1.25vh rgba(255,255,0,0.7)" : "none",
              animation: superCharge >= 100 && !isSuperActive ? "pulse 1.5s infinite" : "none",
            }}
          />
        </div>

        {/* Super charge label */}
        <div
          style={{
            fontSize: "1.75vh",
            color: "#fff",
            textShadow: "0 0 0.75vh rgba(0,0,0,0.8)",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "1vh",
          }}
        >
          {isSuperActive ? (
            <>
              <span style={{ color: "#ffff00" }}>SUPER ACTIVE</span>
              <span>{superTimeLeft.toFixed(1)}s</span>
            </>
          ) : superCharge >= 100 ? (
            <span style={{ color: "#ffff00", animation: "pulse 1.5s infinite" }}>SUPER CHARGED</span>
          ) : (
            <>
              <span>SUPER CHARGE</span>
              <span>{superCharge.toFixed(0)}%</span>
            </>
          )}
        </div>
      </div>

      {/* Enemy Indicators - Left Side */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5vh",
          padding: "2vh",
          background: "linear-gradient(to right, rgba(0,0,0,0.4), transparent)",
          borderRadius: "0 2vh 2vh 0",
        }}
      >
        {enemyIndicators.left.map((indicator) => (
          <div
            key={indicator.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1vh",
              opacity: indicator.active ? 1 : 0.4,
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: indicator.isTank ? "2.5vh" : "2vh",
                height: indicator.isTank ? "2.5vh" : "2vh",
                borderRadius: "0.25vh",
                background: indicator.isBoss ? "#ff0000" : indicator.isTank ? "#ffcc00" : "#2196f3",
                boxShadow: indicator.active
                  ? `0 0 1vh ${indicator.isBoss ? "#ff0000" : indicator.isTank ? "#ffcc00" : "#2196f3"}`
                  : "none",
                animation:
                  indicator.active && (indicator.isTank || indicator.isBoss)
                    ? `${pulseState ? "scale(1.1)" : "scale(1)"}`
                    : "none",
                transition: "transform 0.2s ease",
              }}
            />

            <div
              style={{
                width: 0,
                height: 0,
                borderTop: `${indicator.isTank || indicator.isBoss ? "1.25vh" : "1vh"} solid transparent`,
                borderBottom: `${indicator.isTank || indicator.isBoss ? "1.25vh" : "1vh"} solid transparent`,
                borderRight: `${indicator.isTank || indicator.isBoss ? "2vh" : "1.5vh"} solid ${
                  indicator.isBoss ? "#ff0000" : indicator.isTank ? "#ffcc00" : "#2196f3"
                }`,
                opacity: indicator.active ? 1 : 0.4,
              }}
            />
          </div>
        ))}
      </div>

      {/* Enemy Indicators - Right Side */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5vh",
          padding: "2vh",
          background: "linear-gradient(to left, rgba(0,0,0,0.4), transparent)",
          borderRadius: "2vh 0 0 2vh",
        }}
      >
        {enemyIndicators.right.map((indicator) => (
          <div
            key={indicator.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1vh",
              opacity: indicator.active ? 1 : 0.4,
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: `${indicator.isTank || indicator.isBoss ? "1.25vh" : "1vh"} solid transparent`,
                borderBottom: `${indicator.isTank || indicator.isBoss ? "1.25vh" : "1vh"} solid transparent`,
                borderLeft: `${indicator.isTank || indicator.isBoss ? "2vh" : "1.5vh"} solid ${
                  indicator.isBoss ? "#ff0000" : indicator.isTank ? "#ffcc00" : "#2196f3"
                }`,
                opacity: indicator.active ? 1 : 0.4,
              }}
            />

            <div
              style={{
                width: indicator.isTank || indicator.isBoss ? "2.5vh" : "1vh",
                height: indicator.isTank || indicator.isBoss ? "2.5vh" : "1vh",
                borderRadius: "0.25vh",
                background: indicator.isBoss ? "#ff0000" : indicator.isTank ? "#ffcc00" : "#2196f3",
                boxShadow: indicator.active
                  ? `0 0 0.25vh ${indicator.isBoss ? "#ff0000" : indicator.isTank ? "#ffcc00" : "#2196f3"}`
                  : "none",
                animation:
                  indicator.active && (indicator.isTank || indicator.isBoss)
                    ? `${pulseState ? "scale(1.1)" : "scale(1)"}`
                    : "none",
                transition: "transform 0.2s ease",
              }}
            />
          </div>
        ))}
      </div>

      {/* Overheat Warning */}
      {isMachineGun && reloadState.isOverheated && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "1.25vh 2.5vh",
            background: "rgba(255,0,0,0.2)",
            backdropFilter: "blur(0.75vh)",
            border: "0.25vh solid #ff0000",
            borderRadius: "1vh",
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: "2.25vh",
            textShadow: "0 0 1.25vh rgba(255,0,0,0.9)",
            opacity: pulseState ? 0.9 : 0.7,
            transition: "opacity 0.3s ease",
            boxShadow: "0 0 2vh rgba(255,0,0,0.5)",
            textAlign: "center",
          }}
        >
          WEAPON OVERHEATED
        </div>
      )}

      {/* Upgrade Screen */}
      {showUpgradeScreen && !gameOver && <UpgradeScreen onContinue={() => setShowUpgradeScreen(false)} />}

      {/* Game Over Screen */}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: "blur(0.75vh)",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(30,30,30,0.95)",
              borderRadius: "2vh",
              boxShadow: "0 0 5vh rgba(0,0,0,0.8)",
              padding: "5vh",
              textAlign: "center",
              minWidth: "70vh",
              width: "90%",
              border: "0.25vh solid rgba(255,255,255,0.1)",
            }}
          >
            <h1
              style={{
                color: "#ff5252",
                margin: "0 0 2.5vg",
                fontSize: "5.25vh",
                textShadow: "0 0 1.25vh rgba(255,82,82,0.5)",
                fontWeight: "800",
                letterSpacing: "0.25vh",
              }}
            >
              GAME OVER
            </h1>

            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: "2.5vh 3.75vh",
                borderRadius: "1.5vh",
                marginBottom: "3.75vh",
              }}
            >
              <div
                style={{
                  fontSize: "2.75vh",
                  fontWeight: "600",
                  color: "#e0e0e0",
                  marginBottom: "2vh",
                }}
              >
                STATISTICS
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: "2vh",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "2.25vh",
                      color: "#9e9e9e",
                      marginBottom: "0.75vh",
                    }}
                  >
                    Wave Reached
                  </div>
                  <div
                    style={{
                      fontSize: "4vh",
                      fontWeight: "bold",
                      color: "#64b5f6",
                    }}
                  >
                    {wave}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "2.25vh",
                      color: "#9e9e9e",
                      marginBottom: "0.75vh",
                    }}
                  >
                    Enemies Defeated
                  </div>
                  <div
                    style={{
                      fontSize: "8vh",
                      fontWeight: "bold",
                      color: "#ff5252",
                    }}
                  >
                    {enemiesKilled}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "2vh",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => {
                  SoundEffects.unlockAudio()
                  SoundEffects.playButtonClick()
                  returnToMenu()
                }}
                style={{
                  padding: "1.5vh 3vh",
                  fontSize: "2.25vh",
                  fontWeight: "bold",
                  background: "linear-gradient(to bottom, #3f51b5, #303f9f)",
                  color: "white",
                  border: "none",
                  borderRadius: "1vh",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 0.5vh 2vh rgba(63,81,181,0.4)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-0.25vh)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                Main Menu
              </button>
              <button
                onClick={() => {
                  SoundEffects.unlockAudio()
                  SoundEffects.playButtonClick()
                  setShowLeaderboard(true)
                }}
                style={{
                  padding: "1.5vh 3vh",
                  fontSize: "2.25vh",
                  fontWeight: "bold",
                  background: "linear-gradient(to bottom, #ff9800, #f57c00)",
                  color: "white",
                  border: "none",
                  borderRadius: "1vh",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 0.5vh 2vh rgba(255,152,0,0.4)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-0.25vh)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                Leaderboard
              </button>
            </div>
          </div>
          {showLeaderboard && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: "blur(0.5vh)",
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: "2vh",
                  padding: "3.75vh",
                  minWidth: "70vh",
                  width: "90%",
                  color: "#fff",
                  boxShadow: "0 0 3.75vh rgba(0,0,0,0.7)",
                  textAlign: "center",
                }}
              >
                <h2 style={{ fontSize: "4vh", marginBottom: "2.5vh", color: "#ff9800" }}>LEADERBOARD</h2>

                {/* Difficulty Selector */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobileScreen ? "column" : "row",
                    gap: "1.25vh",
                    marginBottom: "2.5vh",
                  }}
                >
                  {["easy", "medium", "hard", "impossible"].map((difficulty) => {
                    // Color map based on difficulty
                    const difficultyColors = {
                      easy: {
                        gradient: "linear-gradient(to bottom, #4CAF50, #388E3C)",
                        shadow: "0 0 15px rgba(76,175,80,0.4)",
                      },
                      medium: {
                        gradient: "linear-gradient(to bottom, #2196F3, #1976D2)",
                        shadow: "0 0 15px rgba(33,150,243,0.4)",
                      },
                      hard: {
                        gradient: "linear-gradient(to bottom, #FFEB3B, #FBC02D)",
                        shadow: "0 0 15px rgba(255,235,59,0.4)",
                      },
                      impossible: {
                        gradient: "linear-gradient(to bottom, #F44336, #D32F2F)",
                        shadow: "0 0 15px rgba(244,67,54,0.4)",
                      },
                    }

                    const isSelected = selectedDifficulty === difficulty

                    return (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        style={{
                          padding: "1.5vh 2.25vh",
                          background: isSelected ? difficultyColors[difficulty].gradient : "rgba(255,255,255,0.1)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          flex: 1,
                          fontSize: "2vh",
                          fontWeight: isSelected ? "bold" : "normal",
                          boxShadow: isSelected ? difficultyColors[difficulty].shadow : "none",
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.2)"
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)"
                          }
                        }}
                      >
                        {difficulty.toUpperCase()}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => {
                    SoundEffects.playButtonClick()
                    setShowAddForm(true)
                  }}
                  style={{
                    marginBottom: "2.5vh",
                    padding: "1.25vh 2.5vh",
                    fontSize: "2vh",
                    fontWeight: "bold",
                    background: "linear-gradient(to bottom, #9e9e9e, #616161)",
                    color: "white",
                    border: "none",
                    borderRadius: "1vh",
                    cursor: "pointer",
                  }}
                >
                  Add to Leaderboard
                </button>

                {/* Leaderboard Form */}
                {showAddForm && (
                  <div style={{ marginBottom: "2.5vh" }}>
                    <h3 style={{ color: "#ff9800" }}>Enter your details</h3>
                    <form onSubmit={handleAddSubmit}>
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ marginBottom: "1.25vh", padding: "1.25vh", width: "100%" }}
                      />
                      {errorMessage && <p style={{ color: "red", fontSize: "1.75vh" }}>{errorMessage}</p>}
                      <button
                        type="submit"
                        style={{
                          padding: "1.25vh 1.5vh",
                          background: "linear-gradient(to bottom, #4caf50, #388e3c)",
                          color: "white",
                          border: "none",
                          borderRadius: "1vh",
                          cursor: "pointer",
                        }}
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                )}

                {/* Leaderboard Table */}
                {filteredData.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "0.25vh solid #888" }}>
                        <th style={{ padding: "1.25vh", textAlign: "left" }}>Username</th>
                        <th style={{ padding: "1.25vh", textAlign: "center" }}>Difficulty</th>
                        <th style={{ padding: "1.25vh", textAlign: "center" }}>Wave</th>
                        <th style={{ padding: "1.25vh", textAlign: "center" }}>Enemies Defeated</th>
                        <th
                          style={{
                            padding: "1.25vh",
                            textAlign: "center",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleSort("turret")}
                        >
                          Turret
                          {sortField === "turret" && (sortDirection === "asc" ? " ▲" : " ▼")}
                          {sortField !== "turret" && " ↕"}
                        </th>
                        <th
                          style={{
                            padding: "1.25vh",
                            textAlign: "right",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleSort("date_time")}
                        >
                          Date
                          {sortField === "date_time" && (sortDirection === "asc" ? " ▲" : " ▼")}
                          {sortField !== "date_time" && " ↕"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((entry, index) => (
                        <tr key={index} style={{ borderBottom: "0.25vh solid #444" }}>
                          <td style={{ padding: "1vh", textAlign: "left" }}>{entry.username}</td>
                          <td style={{ padding: "1vh", textAlign: "center" }}>{entry.difficulty}</td>
                          <td style={{ padding: "1vh", textAlign: "center" }}>{entry.wave}</td>
                          <td style={{ padding: "1vh", textAlign: "center" }}>{entry.enemies_defeated}</td>
                          <td style={{ padding: "1vh", textAlign: "center" }}>{entry.turret}</td>
                          <td style={{ padding: "1vh", textAlign: "right" }}>
                            {new Date(entry.date_time).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No data for {selectedDifficulty} difficulty!</p>
                )}

                <button
                  onClick={() => {
                    setShowLeaderboard(false)
                  }}
                  style={{
                    marginTop: "2.5vh",
                    padding: "1.25vh 2.5vh",
                    fontSize: "2vh",
                    fontWeight: "bold",
                    background: "linear-gradient(to bottom, #9e9e9e, #616161)",
                    color: "white",
                    border: "none",
                    borderRadius: "1vh",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Super Charge Screen Effect */}
      {isSuperActive && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            boxShadow: `inset 0 0 ${Math.sin(Date.now() * 0.003) * 50 + 100}px rgba(255, 255, 0, 0.15)`,
            zIndex: 5,
            transition: "box-shadow 0.3s ease",
          }}
        >
          {/* Radial pulse effect */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100vw",
              height: "100vh",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(255,255,0,0.1) 0%, rgba(255,255,0,0) 70%)",
              opacity: Math.sin(Date.now() * 0.002) * 0.5 + 0.5,
              pointerEvents: "none",
            }}
          />

          {/* Corner flares */}
          {[
            { top: 0, left: 0 },
            { top: 0, right: 0 },
            { bottom: 0, left: 0 },
            { bottom: 0, right: 0 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "15vh",
                height: "15vh",
                ...pos,
                background: `radial-gradient(circle, rgba(255,255,0,0.3) 0%, rgba(255,255,0,0) 70%)`,
                opacity: Math.sin(Date.now() * 0.002 + i) * 0.5 + 0.5,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Super charge activation message - only show briefly when activated */}
          {superTimeLeft > superActiveDuration - 1 && (
            <div
              style={{
                position: "absolute",
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1.5)",
                color: "#ffff00",
                fontSize: "5vh",
                fontWeight: "bold",
                textShadow: "0 0 10px rgba(255, 255, 0, 0.8), 0 0 20px rgba(255, 255, 0, 0.5)",
                opacity: Math.min(1, superActiveDuration - superTimeLeft),
                transition: "opacity 0.3s ease, transform 0.3s ease",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              SUPER CHARGE ACTIVATED!
            </div>
          )}
        </div>
      )}
      {/* Sniper Zoom Effect Overlay */}
      {turretType === "sniper" && reloadState.isCharging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            border: `${Math.max(0, Math.min(50, reloadState.chargeLevel * 50))}px solid rgba(0,0,0,0.7)`,
            boxSizing: "border-box",
            transition: "border-width 0.1s ease",
            zIndex: 10,
          }}
        ></div>
      )}
      {turretType === "machineGun" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            border: `${Math.max(0, Math.min(20, reloadState.heatLevel * 20))}px solid rgba(255,80,80,0.7)`,
            boxSizing: "border-box",
            transition: "border-width 0.1s ease",
            zIndex: 10,
          }}
        ></div>
      )}

      <ItemsBar />
    </div>
  )
}

// Helper function to get item color
function getItemColor(itemType) {
  const colors = {
    absoluteZero: "#2196f3",
    timeWarp: "#9c27b0",
    radialBlast: "#ff5722",
    shield: "#4caf50",
    empBlast: "#ffc107",
  }
  return colors[itemType] || "#ffffff"
}

// Helper function to get item name
function getItemName(itemType) {
  const names = {
    absoluteZero: "Absolute Zero",
    timeWarp: "Time Warp",
    radialBlast: "Radial Blast",
    shield: "Shield",
    empBlast: "EMP Blast",
  }
  return names[itemType] || itemType
}

// Helper function to get item icon
function getItemIcon(itemType, size = 20) {
  switch (itemType) {
    case "absoluteZero":
      return <span style={{ color: "#2196f3" }}>❄️</span>
    case "timeWarp":
      return <span style={{ color: "#9c27b0" }}>↺</span>
    case "radialBlast":
      return <span style={{ color: "#ff5722" }}>💥</span>
    case "shield":
      return <span style={{ color: "#4caf50" }}>🛡</span>
    case "empBlast":
      return <span style={{ color: "#ffc107" }}>⚡</span>
    default:
      return null
  }
}
