import { useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function Boss({
  position,
  health,
  maxHealth,
  hasShield = false,
  shieldHealth = 0,
  shieldMaxHealth = 1,
}) {
  const healthRef = useRef()
  const shieldRef = useRef()
  const bossRef = useRef()
  const modelRef = useRef()
  const { camera } = useThree()

  const shieldEffectRef = useRef()

  const { scene: originalScene } = useGLTF("/models/enemies/boss.glb")

  // Clone the model scene to avoid sharing ID issues
  const model = originalScene.clone(true)

  // Calculate health percentage
  const healthPercent = health / maxHealth
  const shieldPercent = shieldHealth / shieldMaxHealth

  // Make boss look at center and health bar look at camera
  useFrame((state, delta) => {
    if (bossRef.current) {
      const bossY = bossRef.current.position.y
      bossRef.current.lookAt(0, bossY, 0)
    }

    if (healthRef.current) {
      healthRef.current.lookAt(camera.position)
    }

    if (shieldRef.current) {
      shieldRef.current.lookAt(camera.position)
    }

    // Shield animation
    if (shieldEffectRef.current) {
      shieldEffectRef.current.rotation.y += delta * 0.5
      shieldEffectRef.current.rotation.z += delta * 0.3

      // Pulse effect
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
      shieldEffectRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group ref={bossRef} position={position} scale={[1, 1, 1]}>
      <group ref={modelRef}>
        <primitive object={model} scale={[0.5, 0.5, 0.5]} position={[0, 4, 0]} />
      </group>

      {/* Shield effect */}
      {hasShield && (
        <group ref={shieldEffectRef}>
          <mesh>
            <sphereGeometry args={[14.6, 32, 32]} />
            <meshStandardMaterial
              color={new THREE.Color("#00aaff")}
              emissive={new THREE.Color("#00aaff")}
              emissiveIntensity={0.5}
              transparent={true}
              opacity={0.3}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[15, 16, 16]} />
            <meshBasicMaterial color={new THREE.Color("#00aaff")} wireframe={true} transparent={true} opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Health bar - always show for boss */}
      <group ref={healthRef} position={[0, 3, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.25, 0.1]} />
          <meshStandardMaterial color="black" />
        </mesh>

        <mesh position={[(healthPercent - 1) * 0.75, 0, 0.05]} scale={[healthPercent, 1, 1]}>
          <boxGeometry args={[1.5, 0.25, 0.1]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Shield bar - only show if shield is active */}
      {hasShield && (
        <group ref={shieldRef} position={[0, 3.4, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 0.25, 0.1]} />
            <meshStandardMaterial color="black" />
          </mesh>

          <mesh position={[(shieldPercent - 1) * 0.75, 0, 0.05]} scale={[shieldPercent, 1, 1]}>
            <boxGeometry args={[1.5, 0.25, 0.1]} />
            <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      <pointLight position={[0, 2, 0]} color={new THREE.Color(0xff0000)} intensity={1} distance={10} decay={2} />
    </group>
  )
}

useGLTF.preload("/models/enemies/boss.glb")
