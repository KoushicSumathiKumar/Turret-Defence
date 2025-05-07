import { useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"

export default function Enemy({ position, health, maxHealth, enemyType = "normal" }) {
  const healthRef = useRef()
  const enemyRef = useRef()
  const modelRef = useRef()
  const { camera } = useThree()

  const modelPath = enemyType === "tank" ? "/models/enemies/enemy2.glb" : "/models/enemies/enemy1.glb"
  const { scene: originalScene } = useGLTF(modelPath)

  // Clone the model scene to avoid sharing ID issues
  const model = originalScene.clone(true)

  // Calculate health percentage
  const healthPercent = health / maxHealth

  const isTank = enemyType === "tank"

  // Make enemy look at center and health bar look at camera
  useFrame((state, delta) => {
    if (enemyRef.current) {
      const enemyY = enemyRef.current.position.y
      enemyRef.current.lookAt(0, enemyY, 0)
    }

    if (healthRef.current) {
      healthRef.current.lookAt(camera.position)
    }

    if (modelRef.current && !isTank) {
      modelRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={enemyRef} position={position}>
      <group ref={modelRef}>
        <primitive object={model} scale={[0.5, 0.5, 0.5]} position={[0, 1, 0]} />
      </group>

      {/* Health bar - only show if damaged */}
      {healthPercent < 1 && (
        <group ref={healthRef} position={[0, isTank ? 5 : 3, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.2, 0.1]} />
            <meshStandardMaterial color="black" />
          </mesh>

          <mesh position={[(healthPercent - 1) * 0.6, 0, 0.05]} scale={[healthPercent, 1, 1]}>
            <boxGeometry args={[1.2, 0.2, 0.1]} />
            <meshStandardMaterial
              color={isTank ? "orange" : "green"}
              emissive={isTank ? "orange" : "green"}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      )}

      <mesh position={[0, isTank ? 0 : 1.5, 0]}>
        <sphereGeometry args={[isTank ? 0 : 1.5, 32, 32]} />
        <meshStandardMaterial
          color={isTank ? "#ff6600" : "#00ff00"}
          transparent={true}
          opacity={0.15}
          emissive={isTank ? "#ff6600" : "#00ff00"}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload("/models/enemies/enemy1.glb")
useGLTF.preload("/models/enemies/enemy2.glb")
