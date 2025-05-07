import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from "react"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { getTurretSettings } from "../config"
import { useFrame } from "@react-three/fiber"

const Turret = forwardRef(
  (
    {
      turretType = "normal",
      heatLevel = 0,
      isOverheated = false,
      timeOfDay = 0,
      isSuperActive = false,
      isCharging = false,
      chargeLevel = 0,
      ...props
    },
    ref,
  ) => {
    const turretSettings = getTurretSettings(turretType)
    const { scene, animations } = useGLTF(`/models/turrets/${turretType}.glb`)

    const group = useRef()
    const ringRef = useRef()
    const superEffectRef = useRef()
    const superParticlesRef = useRef([])
    const barrelRef = useRef()
    const { actions } = useAnimations(animations, group)

    const [isFiring, setIsFiring] = useState(false)
    const [superEffectScale, setSuperEffectScale] = useState(1)
    const [superParticles, setSuperParticles] = useState([])
    const [recoilAnimation, setRecoilAnimation] = useState({ active: false, progress: 0 })
    const [heatDistortion, setHeatDistortion] = useState(0)

    // Calculate glow intensity based on time of day
    // More intense at night (timeOfDay closer to 1)
    const glowIntensity = Math.min(1, 0.2 + timeOfDay * 2)

    // Super charge effect
    const superChargeEffect = isSuperActive ? 2 : 0

    // Ring color calculation to include super charge effect
    let ringColor = 0x00ff00
    if (turretType === "sniper") ringColor = 0x2196f3
    if (turretType === "machineGun") ringColor = 0xff5722
    // Override with super charge color when active
    if (isSuperActive) ringColor = 0xffff00

    // Expose methods to control firing animation
    useImperativeHandle(ref, () => ({
      startFiring: () => {
        setIsFiring(true)

        // Start recoil animation
        setRecoilAnimation({ active: true, progress: 0 })

        // Play firing animation if available
        const fireAction = actions?.["FireAnimation"]
        if (fireAction) {
          fireAction.reset()
          fireAction.setLoop(THREE.LoopOnce, 1) // Play the animation once
          fireAction.play()
        } else {
          console.warn("FireAnimation action not found.")
        }
      },
      stopFiring: () => setIsFiring(false),
      startCharging: () => {
      },
    }))

    useEffect(() => {
      if (turretType === "sniper" && isFiring) {
        const fireAction = actions?.["FireAnimation"]
        if (fireAction) {
          fireAction.reset()
          fireAction.setLoop(THREE.LoopOnce, 1)
          fireAction.play()
        } else {
          console.warn("FireAnimation action not found.")
        }
      }
    }, [turretType, actions, isFiring])

    // Heat effect for machine gun
    useEffect(() => {
      if (turretType === "machineGun") {
        scene.traverse((node) => {
          if (node.isMesh) {
            node.material.emissiveIntensity = isOverheated ? 1.0 : heatLevel * 0.8
          }
        })

        // Set heat distortion effect
        setHeatDistortion(isOverheated ? 1.0 : heatLevel * 0.5)
      }
    }, [scene, turretType, heatLevel, isOverheated])

    // useEffect for the ring to include super charge effect
    useEffect(() => {
      if (ringRef.current) {
        // Ring material
        ringRef.current.material.color = new THREE.Color(ringColor)
        ringRef.current.material.opacity = 0.3 + glowIntensity * 0.7 + superChargeEffect * 0.3
        ringRef.current.material.emissive = new THREE.Color(ringColor)
        ringRef.current.material.emissiveIntensity = glowIntensity * 1.5 + superChargeEffect

        // Pulse effect when super charged
        if (isSuperActive) {
          const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1
          ringRef.current.scale.set(scale, scale, 1)
        } else {
          ringRef.current.scale.set(1, 1, 1)
        }
      }
    }, [ringRef, turretType, glowIntensity, ringColor, isSuperActive])

    // Handle recoil animation and other effects
    useFrame((state, delta) => {
      // Process recoil animation
      if (recoilAnimation.active) {
        setRecoilAnimation((prev) => {
          const newProgress = prev.progress + delta * 10

          if (newProgress >= 1) {
            // Animation complete
            if (barrelRef.current) {
              barrelRef.current.position.z = 0
            }
            return { active: false, progress: 0 }
          }

          // Apply recoil movement
          if (barrelRef.current) {
            // Move back then forward
            const movement =
              newProgress < 0.5
                ? -Math.sin(newProgress * Math.PI) * 0.1 // Back
                : Math.sin((newProgress - 0.5) * Math.PI) * 0.05 // Forward

            barrelRef.current.position.z = movement
          }

          return { active: true, progress: newProgress }
        })
      }

      // Animate heat distortion for machine gun
      if (turretType === "machineGun" && heatDistortion > 0) {
        // Create heat haze effect above the barrel
        if (barrelRef.current) {
          const distortionAmount = Math.sin(state.clock.elapsedTime * 10) * heatDistortion * 0.01
          barrelRef.current.rotation.x = distortionAmount
        }
      }

      // Animate charging effect for sniper
      if (turretType === "sniper" && isCharging) {
        // Pulse the charging effect
        const chargeIntensity = chargeLevel * (1 + Math.sin(state.clock.elapsedTime * 10) * 0.2)

        if (barrelRef.current) {
          barrelRef.current.traverse((node) => {
            if (node.isMesh && node.material) {
              node.material.emissiveIntensity = chargeIntensity * 2
            }
          })
        }
      }
    })

    // Create a ring around the turret
    const ringGeometry = new THREE.RingGeometry(10, 10.2, 64) // Radius of 10, thickness of 0.2
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: ringColor,
      side: THREE.DoubleSide,
      opacity: 0.3 + glowIntensity * 0.7,
      transparent: true,
      emissive: ringColor,
      emissiveIntensity: glowIntensity * 1.5,
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.ref = ringRef

    // Position the ring around the turret
    ring.rotation.x = Math.PI / 2 // Rotate so it's flat on the ground
    ring.position.y = 0.01 // Slightly above the ground level to avoid clipping with the turret

    // Super charge particles effect
    useEffect(() => {
      if (isSuperActive) {
        // Create particles if they don't exist
        if (superParticles.length === 0) {
          const newParticles = []
          for (let i = 0; i < 30; i++) {
            newParticles.push({
              id: i,
              position: [(Math.random() - 0.5) * 5, Math.random() * 5, (Math.random() - 0.5) * 5],
              scale: 0.1 + Math.random() * 0.3,
              speed: 0.02 + Math.random() * 0.05,
              rotationSpeed: (Math.random() - 0.5) * 0.1,
              angle: Math.random() * Math.PI * 2,
              radius: 2 + Math.random() * 3,
              yOffset: Math.random() * 3,
              phase: Math.random() * Math.PI * 2,
            })
          }
          setSuperParticles(newParticles)
        }

        // Animate the super effect scale
        const interval = setInterval(() => {
          setSuperEffectScale(1 + Math.sin(Date.now() * 0.003) * 0.2)
        }, 50)

        return () => {
          clearInterval(interval)
          setSuperParticles([])
        }
      }
    }, [isSuperActive])

    // Animate super particles
    useFrame((state) => {
      if (isSuperActive && superParticlesRef.current.length > 0) {
        superParticlesRef.current.forEach((particle, i) => {
          if (particle && superParticles[i]) {
            const data = superParticles[i]

            // Orbital motion
            data.angle += data.speed
            const x = Math.cos(data.angle) * data.radius
            const z = Math.sin(data.angle) * data.radius
            const y = data.yOffset + Math.sin(state.clock.elapsedTime * 2 + data.phase) * 0.5

            particle.position.set(x, y, z)
            particle.rotation.y += data.rotationSpeed

            // Pulse scale
            const scale = data.scale * (1 + Math.sin(state.clock.elapsedTime * 3 + data.phase) * 0.3)
            particle.scale.set(scale, scale, scale)
          }
        })
      }
    })

    // Find the barrel in the model for recoil animation
    useEffect(() => {
      if (scene) {
        scene.traverse((node) => {
          if (
            node.name &&
            (node.name.toLowerCase().includes("barrel") ||
              node.name.toLowerCase().includes("gun") ||
              node.name.toLowerCase().includes("cannon"))
          ) {
            barrelRef.current = node
          }
        })

        if (!barrelRef.current) {
          barrelRef.current = scene
        }
      }
    }, [scene])

    return (
      <group {...props}>
        {/* Point light for night time ring glow */}
        {timeOfDay > 0.5 && (
          <pointLight
            position={[0, 0.1, 0]}
            color={new THREE.Color(ringColor)}
            intensity={glowIntensity * 2 + superChargeEffect * 2}
            distance={15 + superChargeEffect * 10}
            decay={2}
          />
        )}

        {/* Super charge effect */}
        {isSuperActive && (
          <>
            {/* Energy field around turret */}
            <mesh
              ref={superEffectRef}
              position={[0, 1, 0]}
              scale={[superEffectScale, superEffectScale, superEffectScale]}
            >
              <sphereGeometry args={[3, 32, 32]} />
              <meshBasicMaterial
                color={0xffff00}
                transparent
                opacity={0.15}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Inner energy core */}
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshStandardMaterial
                color={0xffffff}
                transparent
                opacity={0.9}
                emissive={0xffff00}
                emissiveIntensity={2}
              />
            </mesh>

            {/* Powerful light source */}
            <pointLight position={[0, 2, 0]} color={new THREE.Color(0xffff00)} intensity={3} distance={20} decay={2} />

            {/* Energy particles */}
            {superParticles.map((particle, i) => (
              <mesh
                key={particle.id}
                ref={(el) => {
                  if (el) {
                    superParticlesRef.current[i] = el
                  }
                }}
                position={[particle.position[0], particle.position[1], particle.position[2]]}
              >
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial
                  color={i % 2 === 0 ? 0xffff00 : 0xffffff}
                  transparent
                  opacity={0.8}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            ))}
          </>
        )}

        {/* Charging effect for sniper */}
        {turretType === "sniper" && isCharging && (
          <>
            <pointLight
              position={[0, 1.5, 0]}
              color={new THREE.Color(0x2196f3)}
              intensity={1.0 + chargeLevel * 2}
              distance={5 + chargeLevel * 10}
              decay={2}
            />
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.2 + chargeLevel * 0.3, 16, 16]} />
              <meshBasicMaterial color={0x2196f3} transparent opacity={0.7} />
            </mesh>
          </>
        )}

        {/* Heat distortion effect for machine gun */}
        {turretType === "machineGun" && heatDistortion > 0 && (
          <mesh position={[0, 1.2, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.5, 1]} />
            <meshBasicMaterial
              color={0xff5722}
              transparent
              opacity={heatDistortion * 0.2}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        <group ref={group}>
          <primitive object={scene} />
          {/* Ring around the turret */}
          <primitive ref={ringRef} object={ring} />
        </group>
      </group>
    )
  },
)

useGLTF.preload("/models/turrets/normal.glb")
useGLTF.preload("/models/turrets/sniper.glb")
useGLTF.preload("/models/turrets/machineGun.glb")

export default Turret
