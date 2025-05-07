import { useState, useRef, useEffect, Suspense } from "react"
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, useGLTF, Sky, shaderMaterial } from "@react-three/drei"
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import * as THREE from "three"
import { gsap } from "gsap"

// List of available models
const models = [
  { path: "/models/turrets/normal.glb", name: "Standard Turret" },
  { path: "/models/turrets/sniper.glb", name: "Sniper Turret" },
  { path: "/models/turrets/machineGun.glb", name: "Machine Gun Turret" },
  { path: "/models/enemies/enemy1.glb", name: "Regular Enemy" },
  { path: "/models/enemies/enemy2.glb", name: "Tank Enemy" },
  { path: "/models/enemies/boss.glb", name: "Boss Enemy" },
  { path: "/models/projectile.glb", name: "Projectile" },
]

// Create a custom shader material
const HologramMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0xff3333),
    intensity: 1.0,
    gridSize: 20.0,
    pulseSpeed: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    uniform float gridSize;
    uniform float pulseSpeed;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Create a pulsing rim light effect
      float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
      rim = pow(rim, 2.0) * sin(time * pulseSpeed) * 0.5 + 0.5;
      
      // Create a holographic grid pattern
      float gridX = step(0.98, fract(vUv.x * gridSize));
      float gridY = step(0.98, fract(vUv.y * gridSize));
      float grid = 0.15 * (gridX + gridY);
      
      // Add scan line effect
      float scanLine = 0.15 * step(0.98, fract(vPosition.y * 10.0 - time));
      
      // Add noise
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      noise = noise * 0.1;
      
      // Combine effects
      vec3 baseColor = color * intensity;
      vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), grid + scanLine + rim + noise);
      
      // Add transparency based on rim and grid
      float alpha = 0.7 + 0.3 * (rim + grid);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
)

// Extend Three.js with custom material
extend({ HologramMaterial })

// Advanced model component with custom shader, explode view, and animations
function AdvancedModel({ modelPath, wireframe, glow, useShader, shaderParams, explodeView }) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef()
  const [clonedScene, setClonedScene] = useState(null)
  const [originalPositions, setOriginalPositions] = useState({})
  const [originalRotations, setOriginalRotations] = useState({})
  const [partsMap, setPartsMap] = useState({})
  const shaderRef = useRef()
  const { clock } = useThree()

  // Deep clone of the scene when the component mounts or modelPath changes
  useEffect(() => {
    if (scene) {
      const newClonedScene = scene.clone(true)
      setClonedScene(newClonedScene)

      // Store original positions and rotations for explode view
      const positions = {}
      const rotations = {}
      const parts = {}

      newClonedScene.traverse((node) => {
        if (node.isMesh) {
          positions[node.uuid] = node.position.clone()
          rotations[node.uuid] = node.rotation.clone()
          parts[node.uuid] = node
        }
      })

      setOriginalPositions(positions)
      setOriginalRotations(rotations)
      setPartsMap(parts)

      // Cleanup function
      return () => {
        if (newClonedScene) {
          newClonedScene.traverse((node) => {
            if (node.isMesh) {
              if (node.material) {
                if (Array.isArray(node.material)) {
                  node.material.forEach((material) => material.dispose())
                } else {
                  node.material.dispose()
                }
              }
              if (node.geometry) {
                node.geometry.dispose()
              }
            }
          })
        }
      }
    }
  }, [scene, modelPath])

  // Apply material based on selected mode (wireframe, glow, shader)
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((node) => {
        if (node.isMesh) {
          // Store the original material if not already stored
          if (!node.userData.originalMaterial) {
            node.userData.originalMaterial = node.material.clone()
          }

          if (useShader) {
            // Create hologram shader material
            const hologramMaterial = new HologramMaterial({
              color: new THREE.Color(shaderParams.color),
              intensity: shaderParams.intensity,
              gridSize: shaderParams.gridSize,
              pulseSpeed: shaderParams.pulseSpeed,
              transparent: true,
              side: THREE.DoubleSide,
            })
            node.material = hologramMaterial
          } else if (wireframe) {
            // Create wireframe material with higher brightness and opacity
            const wireframeMaterial = new THREE.MeshBasicMaterial({
              color: 0xff1a1a,
              wireframe: true,
              transparent: true,
              opacity: 1.0,
              emissive: 0xff1a1a,
              emissiveIntensity: 1.0,
            })
            node.material = wireframeMaterial
          } else if (glow) {
            // Create glowing material
            const glowMaterial = new THREE.MeshStandardMaterial({
              color: node.userData.originalMaterial.color || 0xffffff,
              emissive: 0xff3333,
              emissiveIntensity: 2.0,
              metalness: 0.2,
              roughness: 0.1,
            })
            node.material = glowMaterial
          } else {
            // Restore original material
            if (node.userData.originalMaterial) {
              node.material = node.userData.originalMaterial
            }
          }
        }
      })
    }
  }, [clonedScene, wireframe, glow, useShader, shaderParams])

  // Handle explode view animation
  useEffect(() => {
    if (!clonedScene || Object.keys(originalPositions).length === 0) return

    Object.keys(partsMap).forEach((uuid) => {
      const node = partsMap[uuid]
      if (node) {
        if (explodeView) {
          // Get direction from center (0,0,0) to the part's original position
          const direction = new THREE.Vector3().copy(originalPositions[uuid]).normalize()

          // Animate to exploded position
          gsap.to(node.position, {
            x: originalPositions[uuid].x + direction.x * 15,
            y: originalPositions[uuid].y + direction.y * 2,
            z: originalPositions[uuid].z + direction.z * 15,
            duration: 1,
            ease: "power2.out",
          })
        } else {
          // Reset to original positions with a bouncy effect
          gsap.to(node.position, {
            x: originalPositions[uuid].x,
            y: originalPositions[uuid].y,
            z: originalPositions[uuid].z,
            duration: 1,
            ease: "elastic.out(1, 0.3)",
          })
        }
      }
    })
  }, [explodeView, clonedScene, originalPositions, originalRotations, partsMap])

  // Update shader uniforms and handle animations
  useFrame(() => {
    if (modelRef.current) {
      // Basic rotation animation
      modelRef.current.rotation.y += 0.005

      // Floating effect
      if (!explodeView) {
        modelRef.current.position.y = -1 + Math.sin(clock.getElapsedTime()) * 0.1
      }

      // Update shader uniforms
      if (useShader) {
        clonedScene.traverse((node) => {
          if (node.isMesh && node.material.type === "ShaderMaterial") {
            node.material.uniforms.time.value = clock.getElapsedTime()
            node.material.uniforms.color.value = new THREE.Color(shaderParams.color)
            node.material.uniforms.intensity.value = shaderParams.intensity
            node.material.uniforms.gridSize.value = shaderParams.gridSize
            node.material.uniforms.pulseSpeed.value = shaderParams.pulseSpeed
          }
        })
      }
    }
  })

  return (
    <group ref={modelRef}>{clonedScene && <primitive object={clonedScene} scale={1} position={[0, -1, 0]} />}</group>
  )
}

function ThumbnailModel({ modelPath }) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef()
  const [clonedScene, setClonedScene] = useState(null)

  // Create a deep clone of the scene when the component mounts or modelPath changes
  useEffect(() => {
    if (scene) {
      const newClonedScene = scene.clone(true)
      setClonedScene(newClonedScene)

      // Cleanup function
      return () => {
        if (newClonedScene) {
          newClonedScene.traverse((node) => {
            if (node.isMesh) {
              if (node.material) {
                if (Array.isArray(node.material)) {
                  node.material.forEach((material) => material.dispose())
                } else {
                  node.material.dispose()
                }
              }
              if (node.geometry) {
                node.geometry.dispose()
              }
            }
          })
        }
      }
    }
  }, [scene, modelPath])

  // Simple rotation for thumbnails
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={modelRef}>{clonedScene && <primitive object={clonedScene} scale={0.8} position={[0, -1, 0]} />}</group>
  )
}

function ModelThumbnail({ modelPath, isSelected, onClick, name }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "12vh",
        height: "12vh",
        margin: "0 1vh",
        border: isSelected ? "0.25vh solid #ff1a1a" : "0.25vh solid rgba(255,255,255,0.2)",
        borderRadius: "1vh",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: isSelected ? "scale(1.1)" : "scale(1)",
        boxShadow: isSelected ? "0 0 2vh rgba(255, 0, 0, 0.5)" : "none",
        position: "relative",
      }}
    >
      <Canvas shadows={false} camera={{ position: [3, 2, 3], fov: 40 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <ThumbnailModel modelPath={modelPath} />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          background: "rgba(0,0,0,0.7)",
          padding: "0.5vh",
          fontSize: "1.2vh",
          textAlign: "center",
          color: isSelected ? "#ff1a1a" : "#ffffff",
        }}
      >
        {name}
      </div>
    </div>
  )
}

// Toggle button component for mode selection
function ModeToggleButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "1.5vh",
        width: "100%",
        fontSize: "2vh",
        fontWeight: "bold",
        background: isActive ? "rgba(255, 0, 0, 0.3)" : "rgba(0,0,0,0.5)",
        color: isActive ? "#ff1a1a" : "#ffffff",
        border: isActive ? "0.15vh solid #ff1a1a" : "0.15vh solid rgba(255,255,255,0.3)",
        borderRadius: "1vh",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isActive ? "0 0 2vh rgba(255, 0, 0, 0.5)" : "none",
        marginBottom: "1vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1vh",
      }}
    >
      {label}
    </button>
  )
}

// Shader controls component
function ShaderControls({ params, onChange }) {
  return (
    <div style={{ marginTop: "1vh" }} id="shader-controls">
      <h3 style={{ fontSize: "2vh", color: "#ff1a1a", marginBottom: "1vh" }}>Shader Parameters</h3>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>Color</label>
        <input
          type="color"
          value={params.color}
          onChange={(e) => onChange({ ...params, color: e.target.value })}
          style={{ width: "100%", height: "3vh", background: "none", border: "none" }}
        />
      </div>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>
          Intensity: {params.intensity.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={params.intensity}
          onChange={(e) => onChange({ ...params, intensity: Number.parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#ff1a1a" }}
        />
      </div>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>
          Grid Size: {params.gridSize.toFixed(0)}
        </label>
        <input
          type="range"
          min="5"
          max="50"
          step="1"
          value={params.gridSize}
          onChange={(e) => onChange({ ...params, gridSize: Number.parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#ff1a1a" }}
        />
      </div>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>
          Pulse Speed: {params.pulseSpeed.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={params.pulseSpeed}
          onChange={(e) => onChange({ ...params, pulseSpeed: Number.parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#ff1a1a" }}
        />
      </div>
    </div>
  )
}

// Post-processing controls component
function PostProcessingControls({ params, onChange }) {
  return (
    <div style={{ marginTop: "1vh" }} id="post-processing-controls">
      <h3 style={{ fontSize: "2vh", color: "#ff1a1a", marginBottom: "1vh" }}>Post-Processing</h3>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>
          Bloom Intensity: {params.bloomIntensity.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={params.bloomIntensity}
          onChange={(e) => onChange({ ...params, bloomIntensity: Number.parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#ff1a1a" }}
        />
      </div>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>
          Chromatic Aberration: {params.chromaticAberration.toFixed(3)}
        </label>
        <input
          type="range"
          min="0"
          max="0.01"
          step="0.001"
          value={params.chromaticAberration}
          onChange={(e) => onChange({ ...params, chromaticAberration: Number.parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#ff1a1a" }}
        />
      </div>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>
          Noise: {params.noise.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={params.noise}
          onChange={(e) => onChange({ ...params, noise: Number.parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#ff1a1a" }}
        />
      </div>

      <div style={{ marginBottom: "1vh" }}>
        <label style={{ display: "block", fontSize: "1.6vh", marginBottom: "0.5vh" }}>
          Vignette: {params.vignette.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.1"
          value={params.vignette}
          onChange={(e) => onChange({ ...params, vignette: Number.parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#ff1a1a" }}
        />
      </div>
    </div>
  )
}

// Main ModelViewerPage component
export default function ModelViewerPage({ returnToMenu }) {
  const [wireframe, setWireframe] = useState(false)
  const [isNightMode, setIsNightMode] = useState(false)
  const [spotlightEffect, setSpotlightEffect] = useState(false)
  const [selectedModel, setSelectedModel] = useState("/models/turrets/normal.glb")
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // State for the glow effect
  const [glowEffect, setGlowEffect] = useState(false)

  const [useShader, setUseShader] = useState(false)
  const [usePostProcessing, setUsePostProcessing] = useState(false)
  const [explodeView, setExplodeView] = useState(false)

  const controlsPanelRef = useRef(null)

  // Shader parameters
  const [shaderParams, setShaderParams] = useState({
    color: "#ff3333",
    intensity: 1.0,
    gridSize: 20.0,
    pulseSpeed: 1.0,
  })

  // Post-processing parameters
  const [postProcessingParams, setPostProcessingParams] = useState({
    bloomIntensity: 1.5,
    chromaticAberration: 0.005,
    noise: 0.2,
    vignette: 1.1,
  })

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Get the name of the currently selected model
  const getSelectedModelName = () => {
    const model = models.find((m) => m.path === selectedModel)
    return model ? model.name : "Unknown Model"
  }

  // Determine if it's small screen
  const isSmallScreen = windowDimensions.width < 768
  const isMobileScreen = windowDimensions.width < 480

  // Function to handle rendering mode changes
  const setRenderingMode = (mode) => {
    // Reset all modes
    setWireframe(false)
    setGlowEffect(false)
    setUseShader(false)

    // Set the selected mode
    if (mode === "wireframe") setWireframe(true)
    if (mode === "glow") setGlowEffect(true)
    if (mode === "shader") {
      setUseShader(true)
      
      // Scroll to shader controls after a short delay to ensure they're rendered
      setTimeout(() => {
        const shaderControls = document.getElementById("shader-controls")
        if (shaderControls && controlsPanelRef.current) {
          controlsPanelRef.current.scrollTo({
            top: shaderControls.offsetTop - 20,
            behavior: "smooth"
          })
        }
      }, 100)
    }
  }

  // Function to handle post-processing toggle
  const togglePostProcessing = () => {
    const newState = !usePostProcessing
    setUsePostProcessing(newState)
    
    // Scroll to post-processing controls if enabled
    if (newState) {
      setTimeout(() => {
        const postProcessingControls = document.getElementById("post-processing-controls")
        if (postProcessingControls && controlsPanelRef.current) {
          controlsPanelRef.current.scrollTo({
            top: postProcessingControls.offsetTop - 20,
            behavior: "smooth"
          })
        }
      }, 100)
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #121212 0%, #1E1E1E 100%)",
        color: "white",
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
        padding: isMobileScreen ? "1vh" : "2vh",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2vh",
          flexWrap: "wrap",
          gap: "1vh",
        }}
      >
        <h1
          style={{
            fontSize: isMobileScreen ? "3vh" : "4vh",
            margin: 0,
            background: "linear-gradient(to bottom, #ff1a1a, #cc0000)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 2vh rgba(255,0,0,0.4)",
            fontWeight: "900",
          }}
        >
          MODEL VIEWER
        </h1>
        <button
          onClick={returnToMenu}
          style={{
            padding: "1vh 2vh",
            fontSize: "1.8vh",
            fontWeight: "bold",
            background: "linear-gradient(to bottom, #ff1a1a, #cc0000)",
            color: "white",
            border: "none",
            borderRadius: "1vh",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 0.5vh 1.8vh rgba(255,152,0,0.4)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-0.25vh)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Return to Menu
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: "2vh",
          height: "calc(100% - 18vh)",
          overflow: "hidden",
        }}
      >
        {/* Left panel - Controls */}
        <div
          ref={controlsPanelRef}
          style={{
            width: isSmallScreen ? "100%" : "25%",
            minWidth: isSmallScreen ? "auto" : "250px",
            background: "rgba(20,20,20,0.6)",
            backdropFilter: "blur(1vh)",
            padding: "2vh",
            borderRadius: "1.6vh",
            border: "0.1vh solid rgba(255,255,255,0.1)",
            boxShadow: "0 2vh 4vh rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "2vh",
            overflowY: "auto",
            maxHeight: isSmallScreen ? "30vh" : "75vh",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "2.5vh",
                marginTop: 0,
                marginBottom: "1.5vh",
                color: "#ff1a1a",
              }}
            >
              Lighting Mode
            </h2>
            <ModeToggleButton label="Day Mode" isActive={!isNightMode} onClick={() => setIsNightMode(false)} />
            <ModeToggleButton label="Night Mode" isActive={isNightMode} onClick={() => setIsNightMode(true)} />
          </div>

          <div>
            <h2
              style={{
                fontSize: "2.5vh",
                marginTop: "1vh",
                marginBottom: "1.5vh",
                color: "#ff1a1a",
              }}
            >
              Rendering Options
            </h2>
            <ModeToggleButton
              label="Wireframe Mode"
              isActive={wireframe}
              onClick={() => setRenderingMode("wireframe")}
            />
            <ModeToggleButton label="Glow Effect" isActive={glowEffect} onClick={() => setRenderingMode("glow")} />
            <ModeToggleButton label="Hologram Shader" isActive={useShader} onClick={() => setRenderingMode("shader")} />

            {isNightMode && (
              <div style={{ marginTop: "1vh" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1vh",
                    padding: "1.5vh",
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "1vh",
                    border: spotlightEffect ? "0.15vh solid #ff1a1a" : "0.15vh solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={spotlightEffect}
                    onChange={() => setSpotlightEffect(!spotlightEffect)}
                    style={{ accentColor: "#ff1a1a", width: "2vh", height: "2vh" }}
                  />
                  <span style={{ fontSize: "2vh", color: spotlightEffect ? "#ff1a1a" : "#ffffff" }}>
                    Intense Lighting
                  </span>
                </label>
              </div>
            )}

            <div style={{ marginTop: "1vh" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1vh",
                  padding: "1.5vh",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "1vh",
                  border: usePostProcessing ? "0.15vh solid #ff1a1a" : "0.15vh solid rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  checked={usePostProcessing}
                  onChange={togglePostProcessing}
                  style={{ accentColor: "#ff1a1a", width: "2vh", height: "2vh" }}
                />
                <span style={{ fontSize: "2vh", color: usePostProcessing ? "#ff1a1a" : "#ffffff" }}>
                  Post-Processing Effects
                </span>
              </label>
            </div>

            <div style={{ marginTop: "1vh" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1vh",
                  padding: "1.5vh",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "1vh",
                  border: explodeView ? "0.15vh solid #ff1a1a" : "0.15vh solid rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  checked={explodeView}
                  onChange={() => setExplodeView(!explodeView)}
                  style={{ accentColor: "#ff1a1a", width: "2vh", height: "2vh" }}
                />
                <span style={{ fontSize: "2vh", color: explodeView ? "#ff1a1a" : "#ffffff" }}>Explode View</span>
              </label>
            </div>
          </div>

          {/* Shader controls */}
          {useShader && <ShaderControls params={shaderParams} onChange={setShaderParams} />}

          {/* Post-processing controls */}
          {usePostProcessing && (
            <PostProcessingControls params={postProcessingParams} onChange={setPostProcessingParams} />
          )}

          {/* Controls info */}
          {!isMobileScreen && (
            <div>
              <h2
                style={{
                  fontSize: "2.5vh",
                  marginTop: "1vh",
                  marginBottom: "1.5vh",
                  color: "#ff1a1a",
                }}
              >
                Controls
              </h2>
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "1.5vh",
                  borderRadius: "1vh",
                  fontSize: "1.8vh",
                }}
              >
                <p style={{ margin: "0.5vh 0" }}>• Left-click + drag to rotate</p>
                <p style={{ margin: "0.5vh 0" }}>• Right-click + drag to pan</p>
                <p style={{ margin: "0.5vh 0" }}>• Scroll to zoom in/out</p>
              </div>
            </div>
          )}
        </div>

        {/* Main model display */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "linear-gradient(to bottom, #1a1a1a, #0a0a0a)",
            borderRadius: "1.6vh",
            overflow: "hidden",
            boxShadow: "inset 0 0 3vh rgba(0,0,0,0.6)",
            minHeight: isSmallScreen ? "40vh" : "auto",
          }}
        >
          <Canvas shadows={false} camera={{ position: [7, 4, 7], fov: 40 }}>
            <color attach="background" args={[isNightMode ? "#050505" : "#1a1a1a"]} />

            {/* Day/Night lighting */}
            {isNightMode ? (
              <>
                {/* Nigth mode lighting */}
                <ambientLight intensity={0.8} />
                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

                {/* Base lighting */}
                <pointLight position={[-5, 2, -5]} intensity={2.0} color="#ff6060" />
                <pointLight position={[5, 0, 5]} intensity={2.0} color="#60a0ff" />
                <pointLight position={[0, 0, -5]} intensity={1.5} color="#ffffff" />

                {/* Base spotlight for visibility */}
                <spotLight
                  position={[0, 10, 0]}
                  angle={0.6}
                  penumbra={0.8}
                  intensity={3.0}
                  color="#ffffff"
                  castShadow={false}
                />

                {/* Intense spotlight effects when enabled */}
                {spotlightEffect && (
                  <>
                    {/* Ring of spotlights around the model */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
                      const x = 7 * Math.cos(angle * (Math.PI / 180))
                      const z = 7 * Math.sin(angle * (Math.PI / 180))
                      const colors = [
                        "#ff3333",
                        "#ff33ff",
                        "#3333ff",
                        "#33ffff",
                        "#33ff33",
                        "#ffff33",
                        "#ff6600",
                        "#ff0099",
                      ]
                      return (
                        <spotLight
                          key={index}
                          position={[x, 2, z]}
                          angle={0.3}
                          penumbra={0.2}
                          intensity={8.0}
                          color={colors[index % colors.length]}
                          distance={15}
                          castShadow={false}
                        />
                      )
                    })}

                    {/* Vertical spotlights for more drama */}
                    <spotLight
                      position={[0, 8, 0]}
                      angle={0.4}
                      penumbra={0.2}
                      intensity={10.0}
                      color="#ffffff"
                      distance={20}
                      castShadow={false}
                    />
                    <spotLight
                      position={[0, -5, 0]}
                      angle={0.4}
                      penumbra={0.2}
                      intensity={10.0}
                      color="#ff9900"
                      distance={20}
                      castShadow={false}
                    />

                    {/* Pulsing point lights */}
                    <pointLight position={[0, 2, 0]} intensity={5.0} color="#ffffff" distance={10} />
                    <pointLight position={[3, 0, 3]} intensity={4.0} color="#ff00ff" distance={8} />
                    <pointLight position={[-3, 0, -3]} intensity={4.0} color="#00ffff" distance={8} />
                  </>
                )}

                {/* Rim light */}
                <pointLight position={[0, 0, 10]} intensity={2.0} color="#ffffff" distance={20} />
              </>
            ) : (
              <>
                {/* Day mode lighting */}
                <ambientLight intensity={1} />
                <Sky distance={450000} sunPosition={[100, 100, 20]} inclination={0.5} azimuth={0.25} />
                <directionalLight position={[5, 10, 5]} intensity={2.0} castShadow={false} />
                <spotLight
                  position={[3, 10, 3]}
                  angle={0.4}
                  penumbra={0.8}
                  intensity={2.5}
                  color="#f0f0ff"
                  castShadow={false}
                />
              </>
            )}

            <Suspense fallback={null}>
              <AdvancedModel
                modelPath={selectedModel}
                wireframe={wireframe}
                glow={glowEffect}
                useShader={useShader}
                shaderParams={shaderParams}
                explodeView={explodeView}
              />
            </Suspense>
            <OrbitControls minDistance={3} maxDistance={50} enablePan={true} />

            {/* Post-processing effects */}
            {usePostProcessing && (
              <EffectComposer>
                <Bloom
                  intensity={postProcessingParams.bloomIntensity}
                  luminanceThreshold={0.2}
                  luminanceSmoothing={0.9}
                  height={300}
                />
                <ChromaticAberration
                  offset={[postProcessingParams.chromaticAberration, postProcessingParams.chromaticAberration]}
                  blendFunction={BlendFunction.NORMAL}
                />
                <Noise opacity={postProcessingParams.noise} />
                <Vignette eskil={false} offset={0.1} darkness={postProcessingParams.vignette} />
              </EffectComposer>
            )}
          </Canvas>

          <div
            style={{
              position: "absolute",
              bottom: "1.5vh",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "1vh 2vh",
              background: "rgba(0,0,0,0.7)",
              color: "#ffffff",
              borderRadius: "1vh",
              fontSize: "2vh",
              fontWeight: "bold",
            }}
          >
            {getSelectedModelName()}
          </div>
        </div>
      </div>

      {/* Model selection thumbnails */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1.5vh",
          marginTop: "2vh",
          background: "rgba(0,0,0,0.5)",
          borderRadius: "1vh",
          overflowX: "auto",
          gap: "1vh",
          flexWrap: "nowrap",
          minHeight: "14vh",
        }}
      >
        {models.map((model) => (
          <ModelThumbnail
            key={model.path}
            modelPath={model.path}
            name={model.name.split(" ")[0]}
            isSelected={selectedModel === model.path}
            onClick={() => setSelectedModel(model.path)}
          />
        ))}
      </div>
    </div>
  )
}

models.forEach((model) => {
  useGLTF.preload(model.path)
})
