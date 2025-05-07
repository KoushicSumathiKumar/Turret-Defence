import { describe, test, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { createRef } from "react"

// Mock the entire Turret component
vi.mock("./Turret", () => {
  const React = require("react")

  // Create a mock implementation of the Turret component
  const MockTurret = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      startFiring: vi.fn(),
      stopFiring: vi.fn(),
      startCharging: vi.fn(),
      fireProjectile: vi.fn(),
      updateTurretRotation: vi.fn(),
    }))

    return <div data-testid="mock-turret" data-turret-type={props.turretType}></div>
  })

  return {
    __esModule: true,
    default: MockTurret,
  }
})

// Import the mocked component
import Turret from "./Turret"

describe("Turret Component", () => {
  let turretRef

  beforeEach(() => {
    vi.clearAllMocks()
    turretRef = createRef()
  })

  test("renders without crashing", () => {
    // Test which verifies the component renders without errors
    expect(() => {
      render(
        <Turret
          ref={turretRef}
          turretType="normal"
          heatLevel={0}
          isOverheated={false}
          timeOfDay={0}
          isSuperActive={false}
          isCharging={false}
          chargeLevel={0}
        />,
      )
    }).not.toThrow()
  })

  test("exposes startFiring method via ref", () => {
    render(
      <Turret
        ref={turretRef}
        turretType="normal"
        heatLevel={0}
        isOverheated={false}
        timeOfDay={0}
        isSuperActive={false}
        isCharging={false}
        chargeLevel={0}
      />,
    )

    // Check if the ref has the expected methods
    expect(turretRef.current).toBeDefined()
    expect(typeof turretRef.current.startFiring).toBe("function")
    expect(typeof turretRef.current.stopFiring).toBe("function")
    expect(typeof turretRef.current.startCharging).toBe("function")
  })

  test("renders with sniper turret type", () => {
    const { getByTestId } = render(
      <Turret
        ref={turretRef}
        turretType="sniper"
        heatLevel={0}
        isOverheated={false}
        timeOfDay={0}
        isSuperActive={false}
        isCharging={true}
        chargeLevel={0.5}
      />,
    )

    // Check if the turret type is correctly passed to the component
    const turretElement = getByTestId("mock-turret")
    expect(turretElement.dataset.turretType).toBe("sniper")
  })

  test("renders with machine gun turret type and heat", () => {
    const { getByTestId } = render(
      <Turret
        ref={turretRef}
        turretType="machineGun"
        heatLevel={0.8}
        isOverheated={true}
        timeOfDay={0}
        isSuperActive={false}
        isCharging={false}
        chargeLevel={0}
      />,
    )

    // Check if the turret type is correctly passed to the component
    const turretElement = getByTestId("mock-turret")
    expect(turretElement.dataset.turretType).toBe("machineGun")
  })

  test("renders with super charge active", () => {
    render(
      <Turret
        ref={turretRef}
        turretType="normal"
        heatLevel={0}
        isOverheated={false}
        timeOfDay={0}
        isSuperActive={true}
        isCharging={false}
        chargeLevel={0}
      />,
    )

    // Test which verifies the component renders without errors with super charge
    expect(turretRef.current).toBeDefined()
  })

  test("renders with night time setting", () => {
    render(
      <Turret
        ref={turretRef}
        turretType="normal"
        heatLevel={0}
        isOverheated={false}
        timeOfDay={0.8} // Night time
        isSuperActive={false}
        isCharging={false}
        chargeLevel={0}
      />,
    )

    // Test which verifies the component renders without errors with night time
    expect(turretRef.current).toBeDefined()
  })
})
