import { useGLTF } from "@react-three/drei"
import { useEffect, useRef } from "react"
import { useGameStore } from "../store"
import * as THREE from "three"

export default function Ground() {
  const { scene } = useGLTF("/models/terrain.glb")
  const groundRef = useRef()
  const timeOfDay = useGameStore((state) => state.getTimeOfDay())

  // Apply lighting effects based on time of day
  useEffect(() => {
    if (groundRef.current) {
      groundRef.current.traverse((node) => {
        if (node.isMesh) {
          // Clone the material to avoid modifying the original
          if (!node.material.userData.original) {
            node.material = node.material.clone()
            node.material.userData.original = true
          }

          // Adjust material properties based on time of day
          if (timeOfDay > 0.7) {
            // Night time - add slight blue tint and glow
            node.material.emissive = new THREE.Color(0x101020)
            node.material.emissiveIntensity = 0.1
          } else if (timeOfDay > 0.4) {
            // Sunset - add orange/red tint
            node.material.emissive = new THREE.Color(0x301505)
            node.material.emissiveIntensity = 0.3
          } else {
            // Daytime - no emissive
            node.material.emissive = new THREE.Color(0x000000)
            node.material.emissiveIntensity = 0
          }
        }
      })
    }
  }, [groundRef, timeOfDay])

  return <primitive ref={groundRef} object={scene} position={[0, 0, 0]} scale={[10, 10, 10]} />
}
