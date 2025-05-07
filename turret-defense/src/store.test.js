import { describe, test, expect, beforeEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useGameStore } from "./store"

// Mock SoundEffects
vi.mock("./utils/sound", () => ({
  SoundEffects: {
    unlockAudio: vi.fn(),
    playWaveCompleted: vi.fn(),
    playButtonClick: vi.fn(),
    playUpgrade: vi.fn(),
    playSuperChargeActivate: vi.fn(),
    playSuperChargeReady: vi.fn(),
    playGameOver: vi.fn(),
    playBossWave: vi.fn(),
    playMainMenuMusic: vi.fn().mockReturnValue({
      play: vi.fn().mockReturnValue(Promise.resolve()),
      pause: vi.fn(),
    }),
    stopMainMenuMusic: vi.fn(),
  },
}))

// Reset the store before each test
beforeEach(() => {
  const { result } = renderHook(() => useGameStore())
  act(() => {
    result.current.fullReset()
  })
  // Clear all mocks between tests
  vi.clearAllMocks()
})

describe("Game Store - Basic State", () => {
  test("initial state should be correctly set", () => {
    const { result } = renderHook(() => useGameStore())

    expect(result.current.wave).toBe(1)
    expect(result.current.gameOver).toBe(false)
    expect(result.current.enemiesKilled).toBe(0)
    expect(result.current.enemiesRemaining).toBe(5)
    expect(result.current.coins).toBe(0)
    expect(result.current.superCharge).toBe(0)
  })

  test("fullReset should reset all state values", () => {
    const { result } = renderHook(() => useGameStore())

    // Change some values first
    act(() => {
      result.current.setWave(5)
      result.current.addCoins(100)
      result.current.setGameOver(true)
    })

    // Verify values changed
    expect(result.current.wave).toBe(5)
    expect(result.current.coins).toBe(100)
    expect(result.current.gameOver).toBe(true)

    // Reset and verify
    act(() => {
      result.current.fullReset()
    })

    expect(result.current.wave).toBe(1)
    expect(result.current.gameOver).toBe(false)
    expect(result.current.coins).toBe(0)
  })
})

describe("Game Store - Enemy Management", () => {
  test("killEnemy should increment kills and decrement remaining enemies", () => {
    const { result } = renderHook(() => useGameStore())

    act(() => {
      result.current.killEnemy("normal")
    })

    expect(result.current.enemiesKilled).toBe(1)
    expect(result.current.enemiesRemaining).toBe(4)
  })

  test("killEnemy should add correct coins based on enemy type", () => {
    const { result } = renderHook(() => useGameStore())

    act(() => {
      result.current.killEnemy("normal") // Should add 5 coins
    })
    expect(result.current.coins).toBe(5)

    act(() => {
      result.current.killEnemy("tank") // Should add 10 coins
    })
    expect(result.current.coins).toBe(15)

    act(() => {
      result.current.killEnemy("boss") // Should add 25 coins
    })
    expect(result.current.coins).toBe(40)
  })

  test("killEnemy should increase super charge based on enemy type", () => {
    const { result } = renderHook(() => useGameStore())

    act(() => {
      result.current.killEnemy("normal") // Should add 4% super charge
    })
    expect(result.current.superCharge).toBe(4)

    act(() => {
      result.current.killEnemy("tank") // Should add 8% super charge
    })
    expect(result.current.superCharge).toBe(12)

    act(() => {
      result.current.killEnemy("boss") // Should add 15% super charge
    })
    expect(result.current.superCharge).toBe(27)
  })

  test("super charge should not exceed 100%", () => {
    const { result } = renderHook(() => useGameStore())

    // Kill enough enemies to exceed 100% super charge
    for (let i = 0; i < 30; i++) {
      act(() => {
        result.current.killEnemy("normal")
      })
    }

    expect(result.current.superCharge).toBe(100)
  })
})

describe("Game Store - Upgrade System", () => {
  test("purchaseUpgrade should deduct correct coins and increase upgrade level", () => {
    const { result } = renderHook(() => useGameStore())

    // Add coins first
    act(() => {
      result.current.addCoins(50)
    })

    // Purchase upgrade
    act(() => {
      const success = result.current.purchaseUpgrade("damage")
      expect(success).toBe(true)
    })

    // Verify upgrade level increased and coins deducted (first level costs 10)
    expect(result.current.upgrades.damage).toBe(1)
    expect(result.current.coins).toBe(40)

    // Purchase another level
    act(() => {
      const success = result.current.purchaseUpgrade("damage")
      expect(success).toBe(true)
    })

    // Verify upgrade level increased and coins deducted (second level costs 20)
    expect(result.current.upgrades.damage).toBe(2)
    expect(result.current.coins).toBe(20)
  })

  test("purchaseUpgrade should fail if not enough coins", () => {
    const { result } = renderHook(() => useGameStore())

    // Add only 5 coins (not enough for first upgrade which costs 10)
    act(() => {
      result.current.addCoins(5)
    })

    // Attempt to purchase upgrade
    act(() => {
      const success = result.current.purchaseUpgrade("damage")
      expect(success).toBe(false)
    })

    // Verify upgrade level did not increase and coins were not deducted
    expect(result.current.upgrades.damage).toBe(0)
    expect(result.current.coins).toBe(5)
  })

  test("purchaseUpgrade should fail if already at max level", () => {
    const { result } = renderHook(() => useGameStore())

    // Add lots of coins
    act(() => {
      result.current.addCoins(1000)
    })

    // Purchase 5 levels (max)
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.purchaseUpgrade("damage")
      })
    }

    // Verify at max level
    expect(result.current.upgrades.damage).toBe(5)

    // Try to purchase another level
    act(() => {
      const success = result.current.purchaseUpgrade("damage")
      expect(success).toBe(false)
    })

    // Verify level didn't increase
    expect(result.current.upgrades.damage).toBe(5)
  })
})

describe("Game Store - Shop Items", () => {
  test("purchaseShopItem should deduct correct coins and add item", () => {
    const { result } = renderHook(() => useGameStore())

    // Add coins
    act(() => {
      result.current.addCoins(100)
    })

    // Purchase item
    act(() => {
      const success = result.current.purchaseShopItem("shield")
      expect(success).toBe(true)
    })

    // Verify item count increased and coins deducted
    expect(result.current.shopItems.shield).toBe(1)
    expect(result.current.coins).toBe(40) // 100 - 60 (shield cost)
  })

  test("activateItem should consume item and set active state", () => {
    const { result } = renderHook(() => useGameStore())

    // Add coins and purchase item
    act(() => {
      result.current.addCoins(100)
      result.current.purchaseShopItem("shield")
    })

    // Mock Date.now to return a consistent value for testing
    const originalDateNow = Date.now
    Date.now = vi.fn(() => 1000)

    // Activate item
    act(() => {
      const success = result.current.activateItem("shield")
      expect(success).toBe(true)
    })

    // Restore original Date.now
    Date.now = originalDateNow

    // Verify item was consumed and is active
    expect(result.current.shopItems.shield).toBe(0)
    expect(result.current.activeItems.shield).toBe(true)
    expect(result.current.itemCooldowns.shield).toBeGreaterThan(0)
  })

  test("activateItem should fail if no items available", () => {
    const { result } = renderHook(() => useGameStore())

    // Try to activate item without having any
    act(() => {
      const success = result.current.activateItem("shield")
      expect(success).toBe(false)
    })

    // Verify nothing changed
    expect(result.current.shopItems.shield).toBe(0)
    expect(result.current.activeItems.shield).toBe(false)
  })

  test("updateItemCooldowns should reduce cooldowns over time", () => {
    const { result } = renderHook(() => useGameStore())

    // Add coins, purchase and activate item
    act(() => {
      result.current.addCoins(100)
      result.current.purchaseShopItem("shield")
      result.current.activateItem("shield")
    })

    // Get initial cooldown
    const initialCooldown = result.current.itemCooldowns.shield

    // Update cooldowns with a delta of 1 second
    act(() => {
      result.current.updateItemCooldowns(1)
    })

    // Verify cooldown decreased
    expect(result.current.itemCooldowns.shield).toBe(initialCooldown - 1)
  })
})

describe("Game Store - Super Charge", () => {
  test("activateSuperCharge should reset charge and set active state", () => {
    const { result } = renderHook(() => useGameStore())

    // Mock Date.now to return a consistent value for testing
    const originalDateNow = Date.now
    Date.now = vi.fn(() => 1000)

    // Fill super charge
    act(() => {
      // Kill enough enemies to reach 100% super charge
      for (let i = 0; i < 25; i++) {
        result.current.killEnemy("normal")
      }
    })

    // Verify super charge is full
    expect(result.current.superCharge).toBe(100)

    // Activate super charge
    act(() => {
      const success = result.current.activateSuperCharge()
      expect(success).toBe(true)
    })

    // Restore original Date.now
    Date.now = originalDateNow

    // Verify super charge was reset and is active
    expect(result.current.superCharge).toBe(0)
    expect(result.current.isSuperActive).toBe(true)
    expect(result.current.superActiveStartTime).toBeGreaterThan(0)
  })

  test("activateSuperCharge should fail if not fully charged", () => {
    const { result } = renderHook(() => useGameStore())

    // Kill only one enemy (not enough for full charge)
    act(() => {
      result.current.killEnemy("normal")
    })

    // Verify super charge is not full
    expect(result.current.superCharge).toBe(4)

    // Try to activate super charge
    act(() => {
      const success = result.current.activateSuperCharge()
      expect(success).toBe(false)
    })

    // Verify nothing changed
    expect(result.current.superCharge).toBe(4)
    expect(result.current.isSuperActive).toBe(false)
  })

  test("getUpgradeMultiplier should return enhanced values during super charge", () => {
    const { result } = renderHook(() => useGameStore())

    // Get normal multiplier
    const normalMultiplier = result.current.getUpgradeMultiplier("damage")

    // Mock Date.now to return a consistent value for testing
    const originalDateNow = Date.now
    Date.now = vi.fn(() => 1000)

    // Fill super charge and activate
    act(() => {
      // Kill enough enemies to reach 100% super charge
      for (let i = 0; i < 25; i++) {
        result.current.killEnemy("normal")
      }
      result.current.activateSuperCharge()
    })

    // Restore original Date.now
    Date.now = originalDateNow

    // Get super charge multiplier
    const superMultiplier = result.current.getUpgradeMultiplier("damage")

    // Verify super multiplier is higher
    expect(superMultiplier).toBeGreaterThan(normalMultiplier)
    expect(superMultiplier).toBe(2.2) // Super damage multiplier is 2.2
  })
})
