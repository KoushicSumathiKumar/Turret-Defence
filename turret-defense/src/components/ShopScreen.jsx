import { useGameStore } from "../store"
import { useState } from "react"
import { SoundEffects } from "../utils/sound"
import { Clock, Shield, Zap, RotateCcw, ArrowLeft, ShoppingBag } from "lucide-react"

export default function ShopScreen({ onBack }) {
  const coins = useGameStore((state) => state.coins)
  const shopItems = useGameStore((state) => state.shopItems)
  const purchaseShopItem = useGameStore((state) => state.purchaseShopItem)
  const wave = useGameStore((state) => state.wave)

  // Animation state
  const [animatingItem, setAnimatingItem] = useState(null)

  // Item definitions
  const items = [
    {
      id: "absoluteZero",
      name: "Absolute Zero",
      description: "Slows down all enemies for 10 seconds",
      cost: 30,
      icon: <Clock size={32} />,
      color: "#2196f3",
    },
    {
      id: "timeWarp",
      name: "Time Warp",
      description: "Resets all enemies to their spawn positions",
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

  const handlePurchase = (itemId) => {
    SoundEffects.unlockAudio()
    const success = purchaseShopItem(itemId)

    if (success) {
      SoundEffects.playUpgrade()
      // Trigger animation
      setAnimatingItem(itemId)
      setTimeout(() => setAnimatingItem(null), 500)
    }
  }

  const handleBack = () => {
    SoundEffects.unlockAudio()
    SoundEffects.playButtonClick()
    onBack()
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(30,30,30,0.95)",
        borderRadius: "2vh",
        boxShadow: "0 0 5vh rgba(0,0,0,0.8)",
        padding: "5vh",
        textAlign: "center",
        maxWidth: "90vh",
        width: "90%",
        border: "0.2vh solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3vh" }}>
        <button
          onClick={handleBack}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "50%",
            width: "5vh",
            height: "5vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            fontSize: "2.5vh",
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1
          style={{
            color: "#ff9800",
            margin: 0,
            fontSize: "4.5vh",
            textShadow: "0 0 1.2vh rgba(255,152,0,0.5)",
            fontWeight: "800",
            letterSpacing: "0.25vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5vh",
          }}
        >
          <ShoppingBag size={32} color="#ff9800" />
          ITEM SHOP
        </h1>
        <div style={{ width: "5vh" }}></div> {/* Empty div for flex spacing */}
      </div>

      <div
        style={{
          fontSize: "2.2vh",
          color: "#e0e0e0",
          marginBottom: "3.5vh",
        }}
      >
        Purchase special items to help you survive the next waves!
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.2vh",
          marginBottom: "3.5vh",
          background: "rgba(255,152,0,0.1)",
          padding: "1.2vh 2.5vh",
          borderRadius: "1vh",
          border: "0.2vh solid rgba(255,152,0,0.3)",
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(27vh, 1fr))",
          gap: "2.5vh",
          marginBottom: "3.5vh",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "1.5vh",
              padding: "2.5vh",
              border: animatingItem === item.id ? `0.25vh solid ${item.color}` : "0.12vh solid rgba(255,255,255,0.1)",
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
  )
}
