import { useGameStore } from "../store"
import { useEffect } from "react"
import { SoundEffects } from "../utils/sound"
import { Clock, Shield, Zap, RotateCcw } from "lucide-react"

export default function ItemsBar() {
  const shopItems = useGameStore((state) => state.shopItems)
  const activeItems = useGameStore((state) => state.activeItems)
  const itemCooldowns = useGameStore((state) => state.itemCooldowns)
  const activateItem = useGameStore((state) => state.activateItem)
  const gamePaused = useGameStore((state) => state.gamePaused)

  // Item definitions with key bindings
  const items = [
    {
      id: "absoluteZero",
      name: "Absolute Zero",
      key: "1",
      icon: <Clock size={20} />,
      color: "#2196f3",
    },
    {
      id: "timeWarp",
      name: "Time Warp",
      key: "2",
      icon: <RotateCcw size={20} />,
      color: "#9c27b0",
    },
    {
      id: "shield",
      name: "Shield",
      key: "3",
      icon: <Shield size={20} />,
      color: "#4caf50",
    },
    {
      id: "empBlast",
      name: "EMP Blast",
      key: "4",
      icon: <Zap size={20} />,
      color: "#ffc107",
    },
  ]

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't process if game is paused
      if (gamePaused) return

      const key = e.key
      const item = items.find((item) => item.key === key)

      if (item) {
        handleActivateItem(item.id)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gamePaused, shopItems, itemCooldowns])

  const handleActivateItem = (itemId) => {
    SoundEffects.unlockAudio()

    // Check if can activate
    if (shopItems[itemId] <= 0 || itemCooldowns[itemId] > 0) {
      return
    }

    const success = activateItem(itemId)

    if (success) {
      // Play appropriate sound based on item type
      switch (itemId) {
        case "absoluteZero":
          SoundEffects.playButtonClick()
          break
        case "timeWarp":
          SoundEffects.playButtonClick()
          break
        case "shield":
          SoundEffects.playButtonClick()
          break
        case "empBlast":
          SoundEffects.playButtonClick()
          break
        default:
          SoundEffects.playButtonClick()
      }
    }
  }

  // Only show the bar if player has at least one item
  const hasAnyItems = Object.values(shopItems).some((count) => count > 0)

  if (!hasAnyItems) return null

  return (
    <div
      style={{
        position: "absolute",
        bottom: "15vh",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexWrap: "nowrap",
        gap: "1.5vh",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(0.6vh)",
        padding: "1.5vh",
        borderRadius: "1.2vh",
        border: "0.2vh solid rgba(255,255,255,0.1)",
        pointerEvents: "auto",
        width: "60vh",
        maxWidth: "90%",
        justifyContent: "center",
      }}
    >
      {items.map((item) => {
        // Only show items the player has
        if (shopItems[item.id] <= 0) return null

        const isActive = activeItems[item.id]
        const onCooldown = itemCooldowns[item.id] > 0
        const cooldownPercent = onCooldown ? (itemCooldowns[item.id] / getItemCooldown(item.id)) * 100 : 0

        return (
          <div
            key={item.id}
            onClick={() => handleActivateItem(item.id)}
            style={{
              width: "6vh",
              height: "6vh",
              borderRadius: "1vh",
              background: isActive ? `${item.color}40` : "rgba(30,30,30,0.8)",
              border: `0.2vh solid ${isActive ? item.color : "rgba(255,255,255,0.2)"}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: onCooldown ? "not-allowed" : "pointer",
              position: "relative",
              overflow: "hidden",
              boxShadow: isActive ? `0 0 1.2vh ${item.color}80` : "none",
              transition: "all 0.2s ease",
            }}
          >
            {/* Cooldown overlay */}
            {onCooldown && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: `${cooldownPercent}%`,
                  background: "rgba(0,0,0,0.7)",
                  zIndex: 1,
                }}
              />
            )}

            {/* Icon */}
            <div
              style={{
                color: isActive ? item.color : "white",
                opacity: onCooldown ? 0.5 : 1,
                zIndex: 2,
              }}
            >
              {item.icon}
            </div>

            {/* Count */}
            <div
              style={{
                fontSize: "1.5vh",
                fontWeight: "bold",
                color: isActive ? item.color : "white",
                opacity: onCooldown ? 0.5 : 1,
                zIndex: 2,
              }}
            >
              {shopItems[item.id]}
            </div>

            {/* Key binding */}
            <div
              style={{
                position: "absolute",
                top: "0.25vh",
                right: "0.25vh",
                fontSize: "1.2vh",
                background: "rgba(0,0,0,0.5)",
                color: "white",
                width: "1.8vh",
                height: "1.8vh",
                borderRadius: "0.4vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              {item.key}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Helper function to get item cooldown duration
function getItemCooldown(itemType) {
  const cooldowns = {
    absoluteZero: 15,
    timeWarp: 5,
    shield: 10,
    empBlast: 8,
  }
  return cooldowns[itemType] || 5
}
