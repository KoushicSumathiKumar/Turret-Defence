import { useGameStore } from "../store"
import { useState, useEffect, useRef } from "react"
import { SoundEffects } from "../utils/sound"
import { Zap, Snowflake, Clock, RotateCcw, Shield, ShoppingBag, ArrowDown, ArrowUp } from "lucide-react"

export default function UpgradeScreen({ onContinue }) {
  const coins = useGameStore((state) => state.coins)
  const upgrades = useGameStore((state) => state.upgrades)
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade)
  const wave = useGameStore((state) => state.wave)
  const setGamePaused = useGameStore((state) => state.setGamePaused)
  const setShowUpgradeScreen = useGameStore((state) => state.setShowUpgradeScreen)
  const shopItems = useGameStore((state) => state.shopItems)
  const purchaseShopItem = useGameStore((state) => state.purchaseShopItem)

  // Animation states
  const [animatingUpgrade, setAnimatingUpgrade] = useState(null)
  const [animatingItem, setAnimatingItem] = useState(null)

  const containerRef = useRef(null)

  // Ensure game is paused when upgrade screen is shown
  useEffect(() => {
    setGamePaused(true)
    return () => setGamePaused(false)
  }, [setGamePaused])

  // Calculate costs for each upgrade level
  const getCost = (currentLevel) => {
    const costs = [10, 20, 40, 80, 160]
    return currentLevel < 5 ? costs[currentLevel] : "MAX"
  }

  // Get the description for each upgrade
  const getUpgradeDescription = (type, level) => {
    switch (type) {
      case "damage":
        return `+${level * 20}% damage`
      case "reloadTime":
        return `-${level * 10}% reload time`
      case "bulletSpeed":
        return `+${level * 20}% bullet speed`
      case "superChargeDuration":
        return `+${level * 20}% duration`
      default:
        return ""
    }
  }

  // Get the next level description
  const getNextLevelDescription = (type, level) => {
    if (level >= 5) return "MAX LEVEL"

    switch (type) {
      case "damage":
        return `+${(level + 1) * 20}% damage`
      case "reloadTime":
        return `-${(level + 1) * 10}% reload time`
      case "bulletSpeed":
        return `+${(level + 1) * 20}% bullet speed`
      case "superChargeDuration":
        return `+${(level + 1) * 20}% duration`
      default:
        return ""
    }
  }

  // Handle upgrade purchase
  const handleUpgrade = (type) => {
    SoundEffects.unlockAudio()
    const success = purchaseUpgrade(type)

    if (success) {
      SoundEffects.playUpgrade()
      setAnimatingUpgrade(type)
      setTimeout(() => setAnimatingUpgrade(null), 500)
    }
  }

  // Handle shop item purchase
  const handlePurchase = (itemId) => {
    SoundEffects.unlockAudio()
    const success = purchaseShopItem(itemId)

    if (success) {
      SoundEffects.playUpgrade()
      setAnimatingItem(itemId)
      setTimeout(() => setAnimatingItem(null), 500)
    }
  }

  // Handle continue button
  const handleContinue = () => {
    SoundEffects.unlockAudio()
    SoundEffects.playButtonClick()
    setShowUpgradeScreen(false)
    setGamePaused(false)
    onContinue()
  }

  // Shop item definitions
  const shopItemsData = [
    {
      id: "absoluteZero",
      name: "Absolute Zero",
      description: "Slows down all enemies for 10 seconds",
      cost: 30,
      icon: <Snowflake size={32} />,
      color: "#2196f3",
    },
    {
      id: "timeWarp",
      name: "Time Warp",
      description: "Resets all enemies to their spawn",
      cost: 50,
      icon: <RotateCcw size={32} />,
      color: "#9c27b0",
    },
    {
      id: "shield",
      name: "Shield",
      description: "Temporary invulnerability for 5 seconds",
      cost: 60,
      icon: <Shield size={32} />,
      color: "#4caf50",
    },
    {
      id: "empBlast",
      name: "EMP Blast",
      description: "Temporarily stuns all enemies for 3 seconds",
      cost: 45,
      icon: <Zap size={32} />,
      color: "#ffc107",
    },
  ]

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropFilter: "blur(1vh)",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "auto",
        zIndex: 100,
        padding: "2.5vh",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(30,30,30,0.95)",
          borderRadius: "2vh",
          boxShadow: "0 0 5vh rgba(0,0,0,0.8)",
          padding: "5vh",
          textAlign: "center",
          maxWidth: "100vh",
          width: "90%",
          border: "0.2vh solid rgba(255,255,255,0.1)",
          position: "relative",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "2.5vh" }}>
          <h1
            style={{
              color: "#ffd700",
              margin: 0,
              fontSize: "4.5vh",
              textShadow: "0 0 1.2vh rgba(255,215,0,0.5)",
              fontWeight: "800",
              letterSpacing: "0.25vh",
            }}
          >
            UPGRADE & SHOP
          </h1>
        </div>

        <div
          style={{
            fontSize: "2.2vh",
            color: "#e0e0e0",
            marginBottom: "3.5vh",
          }}
        >
          Wave {wave - 1} completed! Upgrade your turret and buy items before the next wave!
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.2vh",
            marginBottom: "3.5vh",
            background: "rgba(255,215,0,0.1)",
            padding: "1.2vh 2.5vh",
            borderRadius: "1vh",
            border: "0.2vh solid rgba(255,215,0,0.3)",
          }}
        >
          <div
            style={{
              width: "3vh",
              height: "3vh",
              borderRadius: "50%",
              background: "#ffd700",
              boxShadow: "0 0 1.2vh rgba(255,215,0,0.7)",
            }}
          />
          <div
            style={{
              fontSize: "3vh",
              fontWeight: "bold",
              color: "#ffd700",
              textShadow: "0 0 0.6vh rgba(255,215,0,0.5)",
            }}
          >
            {coins} Coins
          </div>
        </div>

        {/* Scrollable container for upgrades and shop items */}
        <div
          ref={containerRef}
          style={{
            overflowY: "auto",
            maxHeight: "50vh",
            paddingRight: "1vh",
            marginBottom: "3vh",
          }}
        >
          {/* UPGRADES SECTION */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2vh",
            }}
          >
            <h2
              style={{
                color: "#ff9800",
                fontSize: "3vh",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "1vh",
              }}
            >
              <Zap size={24} color="#ff9800" /> Turret Upgrades
            </h2>

            <button
              onClick={() => {
                SoundEffects.unlockAudio()
                SoundEffects.playButtonClick()
                // Scroll to shop section
                const shopSection = document.getElementById("shop-section")
                if (shopSection) {
                  shopSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5vh",
                background: "rgba(255,152,0,0.2)",
                border: "none",
                borderRadius: "1vh",
                padding: "1vh 2vh",
                cursor: "pointer",
                color: "#ff9800",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,152,0,0.3)"
                e.currentTarget.style.transform = "translateY(0.25vh)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,152,0,0.2)"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <ArrowDown size={20} color="#ffd700" />
              <span style={{ fontSize: "1.8vh", fontWeight: "bold" }}>SHOP</span>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(27vh, 1fr))",
              gap: "2.5vh",
              marginBottom: "3.5vh",
              padding: "1vh 1.5vh",
            }}
          >
            {/* Damage Upgrade */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "1.5vh",
                padding: "2.5vh",
                border: animatingUpgrade === "damage" ? "0.25vh solid #ff5252" : "0.12vh solid rgba(255,82,82,0.3)",
                transition: "all 0.3s ease",
                transform: animatingUpgrade === "damage" ? "scale(1.05)" : "scale(1)",
                boxShadow: animatingUpgrade === "damage" ? "0 0 2.5vh rgba(255,82,82,0.5)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.8vh",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5vh",
                    fontWeight: "bold",
                    color: "#ff5252",
                    display: "flex",
                    alignItems: "center",
                    gap: "1vh",
                  }}
                >
                  <Zap size={24} color="#ff5252" />
                  Damage
                </div>
              </div>

              <div
                style={{
                  fontSize: "2vh",
                  color: "#e0e0e0",
                  marginBottom: "1.8vh",
                  height: "6vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div>Current: {getUpgradeDescription("damage", upgrades.damage)}</div>
                <div>Next: {getNextLevelDescription("damage", upgrades.damage)}</div>
              </div>

              {/* Level Indicator */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.6vh",
                  marginBottom: "2.5vh",
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "1.8vh",
                      height: "1.8vh",
                      borderRadius: "50%",
                      background: i < upgrades.damage ? "#ff5252" : "rgba(255,82,82,0.2)",
                      boxShadow: i < upgrades.damage ? "0 0 0.6vh rgba(255,82,82,0.7)" : "none",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => handleUpgrade("damage")}
                disabled={upgrades.damage >= 5 || coins < getCost(upgrades.damage)}
                style={{
                  padding: "1.2vh 2.5vh",
                  fontSize: "2vh",
                  fontWeight: "bold",
                  background:
                    upgrades.damage >= 5
                      ? "rgba(100,100,100,0.3)"
                      : coins < getCost(upgrades.damage)
                        ? "rgba(255,82,82,0.3)"
                        : "linear-gradient(to bottom, #ff5252, #d32f2f)",
                  color: "white",
                  border: "none",
                  borderRadius: "1vh",
                  cursor: upgrades.damage >= 5 || coins < getCost(upgrades.damage) ? "not-allowed" : "pointer",
                  opacity: upgrades.damage >= 5 || coins < getCost(upgrades.damage) ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                {upgrades.damage >= 5 ? "MAXED" : `Upgrade (${getCost(upgrades.damage)} coins)`}
              </button>
            </div>

            {/* Reload Time Upgrade */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "1.5vh",
                padding: "2.5vh",
                border:
                  animatingUpgrade === "reloadTime" ? "0.25vh solid #2196f3" : "0.12vh solid rgba(33,150,243,0.3)",
                transition: "all 0.3s ease",
                transform: animatingUpgrade === "reloadTime" ? "scale(1.05)" : "scale(1)",
                boxShadow: animatingUpgrade === "reloadTime" ? "0 0 2.5vh rgba(33,150,243,0.5)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.8vh",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5vh",
                    fontWeight: "bold",
                    color: "#2196f3",
                    display: "flex",
                    alignItems: "center",
                    gap: "1vh",
                  }}
                >
                  <Clock size={24} color="#2196f3" />
                  Reload Speed
                </div>
              </div>

              <div
                style={{
                  fontSize: "2vh",
                  color: "#e0e0e0",
                  marginBottom: "1.8vh",
                  height: "6vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div>Current: {getUpgradeDescription("reloadTime", upgrades.reloadTime)}</div>
                <div>Next: {getNextLevelDescription("reloadTime", upgrades.reloadTime)}</div>
              </div>

              {/* Level Indicator */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.6vh",
                  marginBottom: "2.5vh",
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "1.8vh",
                      height: "1.8vh",
                      borderRadius: "50%",
                      background: i < upgrades.reloadTime ? "#2196f3" : "rgba(33,150,243,0.2)",
                      boxShadow: i < upgrades.reloadTime ? "0 0 0.6vh rgba(33,150,243,0.7)" : "none",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => handleUpgrade("reloadTime")}
                disabled={upgrades.reloadTime >= 5 || coins < getCost(upgrades.reloadTime)}
                style={{
                  padding: "1.2vh 2.5vh",
                  fontSize: "2vh",
                  fontWeight: "bold",
                  background:
                    upgrades.reloadTime >= 5
                      ? "rgba(100,100,100,0.3)"
                      : coins < getCost(upgrades.reloadTime)
                        ? "rgba(33,150,243,0.3)"
                        : "linear-gradient(to bottom, #2196f3, #1976d2)",
                  color: "white",
                  border: "none",
                  borderRadius: "1vh",
                  cursor: upgrades.reloadTime >= 5 || coins < getCost(upgrades.reloadTime) ? "not-allowed" : "pointer",
                  opacity: upgrades.reloadTime >= 5 || coins < getCost(upgrades.reloadTime) ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                {upgrades.reloadTime >= 5 ? "MAXED" : `Upgrade (${getCost(upgrades.reloadTime)} coins)`}
              </button>
            </div>

            {/* Bullet Speed Upgrade */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "1.5vh",
                padding: "2.5vh",
                border:
                  animatingUpgrade === "bulletSpeed" ? "0.25vh solid #4caf50" : "0.12vh solid rgba(76,175,80,0.3)",
                transition: "all 0.3s ease",
                transform: animatingUpgrade === "bulletSpeed" ? "scale(1.05)" : "scale(1)",
                boxShadow: animatingUpgrade === "bulletSpeed" ? "0 0 2.5vh rgba(76,175,80,0.5)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.8vh",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5vh",
                    fontWeight: "bold",
                    color: "#4caf50",
                    display: "flex",
                    alignItems: "center",
                    gap: "1vh",
                  }}
                >
                  <RotateCcw size={24} color="#4caf50" />
                  Bullet Speed
                </div>
              </div>

              <div
                style={{
                  fontSize: "2vh",
                  color: "#e0e0e0",
                  marginBottom: "1.8vh",
                  height: "6vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div>Current: {getUpgradeDescription("bulletSpeed", upgrades.bulletSpeed)}</div>
                <div>Next: {getNextLevelDescription("bulletSpeed", upgrades.bulletSpeed)}</div>
              </div>

              {/* Level Indicator */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.6vh",
                  marginBottom: "2.5vh",
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "1.8vh",
                      height: "1.8vh",
                      borderRadius: "50%",
                      background: i < upgrades.bulletSpeed ? "#4caf50" : "rgba(76,175,80,0.2)",
                      boxShadow: i < upgrades.bulletSpeed ? "0 0 0.6vh rgba(76,175,80,0.7)" : "none",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => handleUpgrade("bulletSpeed")}
                disabled={upgrades.bulletSpeed >= 5 || coins < getCost(upgrades.bulletSpeed)}
                style={{
                  padding: "1.2vh 2.5vh",
                  fontSize: "2vh",
                  fontWeight: "bold",
                  background:
                    upgrades.bulletSpeed >= 5
                      ? "rgba(100,100,100,0.3)"
                      : coins < getCost(upgrades.bulletSpeed)
                        ? "rgba(76,175,80,0.3)"
                        : "linear-gradient(to bottom, #4caf50, #388e3c)",
                  color: "white",
                  border: "none",
                  borderRadius: "1vh",
                  cursor:
                    upgrades.bulletSpeed >= 5 || coins < getCost(upgrades.bulletSpeed) ? "not-allowed" : "pointer",
                  opacity: upgrades.bulletSpeed >= 5 || coins < getCost(upgrades.bulletSpeed) ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                {upgrades.bulletSpeed >= 5 ? "MAXED" : `Upgrade (${getCost(upgrades.bulletSpeed)} coins)`}
              </button>
            </div>
            {/* Super Charge Duration Upgrade */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "1.5vh",
                padding: "2.5vh",
                border:
                  animatingUpgrade === "superChargeDuration"
                    ? "0.25vh solid #ffff00"
                    : "0.12vh solid rgba(255,255,0,0.3)",
                transition: "all 0.3s ease",
                transform: animatingUpgrade === "superChargeDuration" ? "scale(1.05)" : "scale(1)",
                boxShadow: animatingUpgrade === "superChargeDuration" ? "0 0 2.5vh rgba(255,255,0,0.5)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.8vh",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5vh",
                    fontWeight: "bold",
                    color: "#ffff00",
                    display: "flex",
                    alignItems: "center",
                    gap: "1vh",
                  }}
                >
                  <Zap size={24} color="#ffff00" />
                  Super Charge Duration
                </div>
              </div>

              <div
                style={{
                  fontSize: "2vh",
                  color: "#e0e0e0",
                  marginBottom: "1.8vh",
                  height: "6vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div>Current: {getUpgradeDescription("superChargeDuration", upgrades.superChargeDuration)}</div>
                <div>Next: {getNextLevelDescription("superChargeDuration", upgrades.superChargeDuration)}</div>
              </div>

              {/* Level Indicator */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.6vh",
                  marginBottom: "2.5vh",
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "1.8vh",
                      height: "1.8vh",
                      borderRadius: "50%",
                      background: i < upgrades.superChargeDuration ? "#ffff00" : "rgba(255,255,0,0.2)",
                      boxShadow: i < upgrades.superChargeDuration ? "0 0 0.6vh rgba(255,255,0,0.7)" : "none",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => handleUpgrade("superChargeDuration")}
                disabled={upgrades.superChargeDuration >= 5 || coins < getCost(upgrades.superChargeDuration)}
                style={{
                  padding: "1.2vh 2.5vh",
                  fontSize: "2vh",
                  fontWeight: "bold",
                  background:
                    upgrades.superChargeDuration >= 5
                      ? "rgba(100,100,100,0.3)"
                      : coins < getCost(upgrades.superChargeDuration)
                        ? "rgba(255,255,0,0.3)"
                        : "linear-gradient(to bottom, #ffff00, #ffd700)",
                  color: "white",
                  border: "none",
                  borderRadius: "1vh",
                  cursor:
                    upgrades.superChargeDuration >= 5 || coins < getCost(upgrades.superChargeDuration)
                      ? "not-allowed"
                      : "pointer",
                  opacity: upgrades.superChargeDuration >= 5 || coins < getCost(upgrades.superChargeDuration) ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
              >
                {upgrades.superChargeDuration >= 5
                  ? "MAXED"
                  : `Upgrade (${getCost(upgrades.superChargeDuration)} coins)`}
              </button>
            </div>
          </div>

          {/* SHOP SECTION */}
          <div
            id="shop-section"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "4vh",
              marginBottom: "2vh",
            }}
          >
            <h2
              style={{
                color: "#ff9800",
                fontSize: "3vh",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "1vh",
              }}
            >
              <ShoppingBag size={24} color="#ff9800" /> Item Shop
            </h2>
            <button
              onClick={() => {
                SoundEffects.unlockAudio()
                SoundEffects.playButtonClick()
                // Scroll to top of container
                if (containerRef.current) {
                  containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5vh",
                background: "rgba(255,152,0,0.2)",
                border: "none",
                borderRadius: "1vh",
                padding: "1vh 2vh",
                cursor: "pointer",
                color: "#ff9800",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,152,0,0.3)"
                e.currentTarget.style.transform = "translateY(0.25vh)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,152,0,0.2)"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <ArrowUp size={20} color="#ffd700" />
              <span style={{ fontSize: "1.8vh", fontWeight: "bold" }}>UPGRADES</span>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(27vh, 1fr))",
              gap: "2.5vh",
              padding: "1vh 1.5vh",
            }}
          >
            {shopItemsData.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "1.5vh",
                  padding: "2.5vh",
                  border:
                    animatingItem === item.id ? `0.25vh solid ${item.color}` : "0.12vh solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                  transform: animatingItem === item.id ? "scale(1.05)" : "scale(1)",
                  boxShadow: animatingItem === item.id ? `0 0 2.5vh ${item.color}80` : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.8vh",
                  }}
                >
                  <div
                    style={{
                      background: `${item.color}20`,
                      borderRadius: "50%",
                      width: "7.5vh",
                      height: "7.5vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "2.5vh",
                    fontWeight: "bold",
                    color: item.color,
                    marginBottom: "1.2vh",
                  }}
                >
                  {item.name}
                </div>

                <div
                  style={{
                    fontSize: "1.8vh",
                    color: "#e0e0e0",
                    marginBottom: "1.8vh",
                    height: "5vh",
                  }}
                >
                  {item.description}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.8vh",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6vh",
                      color: "#ffd700",
                      fontWeight: "bold",
                    }}
                  >
                    <span>{item.cost}</span>
                    <div
                      style={{
                        width: "1.5vh",
                        height: "1.5vh",
                        borderRadius: "50%",
                        background: "#ffd700",
                        boxShadow: "0 0 0.6vh rgba(255,215,0,0.7)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "1vh",
                      padding: "0.6vh 1.2vh",
                      fontSize: "1.8vh",
                    }}
                  >
                    Owned: {shopItems[item.id]}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(item.id)}
                  disabled={coins < item.cost}
                  style={{
                    padding: "1.2vh 2.5vh",
                    fontSize: "2vh",
                    fontWeight: "bold",
                    background:
                      coins < item.cost
                        ? "rgba(255,255,255,0.1)"
                        : `linear-gradient(to bottom, ${item.color}, ${item.color}dd)`,
                    color: "white",
                    border: "none",
                    borderRadius: "1vh",
                    cursor: coins < item.cost ? "not-allowed" : "pointer",
                    opacity: coins < item.cost ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    width: "100%",
                  }}
                >
                  {coins < item.cost ? "Not enough coins" : "Purchase"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleContinue}
          style={{
            padding: "1.8vh 3.5vh",
            fontSize: "2.2vh",
            fontWeight: "bold",
            background: "linear-gradient(to bottom, #ff9800, #f57c00)",
            color: "white",
            border: "none",
            borderRadius: "1vh",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 0.5vh 1.8vh rgba(255,152,0,0.4)",
            marginTop: "auto",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-0.25vh)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Continue to Wave {wave}
        </button>
      </div>
    </div>
  )
}
