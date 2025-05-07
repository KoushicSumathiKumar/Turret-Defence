import { useGLTF } from "@react-three/drei"
import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

export default function Projectile({
  position,
  turretType = "normal",
  timeOfDay = 0,
  isSuperActive = false,
  ...props
}) {
  // useGLTF instead of useLoader for better material support
  const { scene } = useGLTF("/models/projectile.glb")
  const lightRef = useRef()
  const modelRef = useRef()
  const trailRef = useRef()
  const [trailPositions, setTrailPositions] = useState([])

  // Different projectile scaling based on turret type and charge level
  let scale = [0.75, 0.75, 0.75]

  if (turretType === "sniper") {
    // Check if this is a charged shot
    const isCharged = props.charged || false
    const chargeLevel = props.chargeLevel || 0

    if (isCharged) {
      // Scale up based on charge level
      const chargeScale = 1 + chargeLevel * 0.5
      scale = [1 * chargeScale, 1 * chargeScale, 1.5 * chargeScale]
    } else {
      scale = [1, 1, 1]
    }
  } else if (turretType === "machineGun") {
    scale = [0.5, 0.5, 0.5]
  }

  // If super active, make projectiles larger
  if (isSuperActive) {
    scale = [scale[0] * 1.5, scale[1] * 1.5, scale[2] * 1.5]
  }

  // Calculate glow intensity based on time of day
  // More intense at night (timeOfDay closer to 1)
  const glowIntensity = Math.min(1, 0.5 + timeOfDay * 2)

  // Get projectile color based on turret type
  let projectileColor = "#00ff00"
  if (turretType === "sniper") {
    // Check if this is a charged shot
    const isCharged = props.charged || false
    const chargeLevel = props.chargeLevel || 0

    if (isCharged) {
      // More intense blue for charged shots
      projectileColor = chargeLevel > 0.7 ? "#00bfff" : "#2196f3"
    } else {
      projectileColor = "#2196f3"
    }
  }
  if (turretType === "machineGun") projectileColor = "#ff5722"

  // Override color if super active
  if (isSuperActive) {
    projectileColor = "#ffffff"
  }

  // Glow effect based on time of day
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((node) => {
        if (node.isMesh) {
          // Clone the material to avoid modifying the original
          if (!node.material.userData.original) {
            node.material = node.material.clone()
            node.material.userData.original = true
          }

          // Set emissive properties based on time of day
          node.material.emissive = new THREE.Color(projectileColor)
          node.material.emissiveIntensity = glowIntensity * (isSuperActive ? 2 : 1)
        }
      })
    }

    // Update light intensity
    if (lightRef.current) {
      lightRef.current.intensity = (0.5 + glowIntensity * 1.5) * (isSuperActive ? 2 : 1)
      lightRef.current.distance = (2 + glowIntensity * 4) * (isSuperActive ? 1.5 : 1)

      // Increase light intensity for charged shots
      if (turretType === "sniper" && props.charged) {
        const chargeLevel = props.chargeLevel || 0
        lightRef.current.intensity = (0.5 + glowIntensity * 1.5) * (1 + chargeLevel) * (isSuperActive ? 2 : 1)
        lightRef.current.distance = (2 + glowIntensity * 4) * (1 + chargeLevel) * (isSuperActive ? 1.5 : 1)
      }
    }

    // Initialize trail positions
    if (isSuperActive) {
      setTrailPositions([position, position, position, position, position])
    }
  }, [modelRef, projectileColor, glowIntensity, props.charged, props.chargeLevel, turretType, isSuperActive, position])

  // Update trail positions
  useFrame(() => {
    if (isSuperActive && trailPositions.length > 0) {
      setTrailPositions((prev) => {
        const newPositions = [...prev]
        newPositions.pop()
        newPositions.unshift([...position])
        return newPositions
      })
    }
  })

  // Clone the model to avoid modifying the original
  const model = scene.clone()

  return (
    <>
      {/* Point light to enhance the glow effect */}
      <pointLight
        ref={lightRef}
        position={position}
        distance={2 + glowIntensity * 4}
        intensity={0.5 + glowIntensity * 1.5}
        color={projectileColor}
      />

      {/* Trail effect for super active projectiles */}
      {isSuperActive && trailPositions.length > 0 && (
        <group ref={trailRef}>
          {trailPositions.map((pos, index) => (
            <mesh
              key={index}
              position={pos}
              scale={[scale[0] * (1 - index * 0.15), scale[1] * (1 - index * 0.15), scale[2] * (1 - index * 0.15)]}
            >
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshBasicMaterial
                color={projectileColor}
                transparent={true}
                opacity={0.3 - index * 0.05}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      )}

      <primitive ref={modelRef} object={model} position={position} scale={scale} />
    </>
  )
}
