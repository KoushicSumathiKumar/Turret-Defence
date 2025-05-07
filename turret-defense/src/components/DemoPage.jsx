import { useEffect } from "react"
import { SoundEffects } from "../utils/sound"
import { X } from 'lucide-react'

export default function DemoPage({ returnToMenu }) {
  // Pause main menu music when demo page is shown
  useEffect(() => {
    SoundEffects.stopMainMenuMusic()
    
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        SoundEffects.playButtonClick()
        returnToMenu()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    
    return () => {
      // Resume main menu music when leaving the demo page
      SoundEffects.playMainMenuMusic()
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [returnToMenu])

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #121212 0%, #1E1E1E 100%)",
        color: "white",
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
        padding: "2vh 2vw",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Background vignette */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(90vw, 120vh)",
          maxWidth: "90vw",
          maxHeight: "90vh",
          background: "rgba(20,20,20,0.6)",
          backdropFilter: "blur(10px)",
          padding: "3vh 3vw",
          borderRadius: "1vh",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 2vh 4vh rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            SoundEffects.playButtonClick()
            returnToMenu()
          }}
          style={{
            position: "absolute",
            top: "1.5vh",
            right: "1.5vh",
            background: "rgba(255,85,85,0.2)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "5vh",
            height: "5vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10,
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,85,85,0.4)"
            e.currentTarget.style.transform = "scale(1.1)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,85,85,0.2)"
            e.currentTarget.style.transform = "scale(1)"
          }}
          aria-label="Close demo"
        >
          <X size="2.5vh" />
        </button>

        <h1
          style={{
            fontSize: "min(4vh, 6vw)",
            margin: "0 0 3vh 0",
            background: "linear-gradient(to bottom, #ff5555, #ff2222)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 2vh rgba(255,85,85,0.4)",
            fontWeight: "900",
            letterSpacing: "0.2vh",
            textAlign: "center",
          }}
        >
          GAME DEMO
        </h1>

        <div
          style={{
            width: "100%",
            height: "0",
            paddingBottom: "56.25%", // 16:9 aspect ratio
            position: "relative",
            borderRadius: "1vh",
            overflow: "hidden",
            boxShadow: "0 1vh 3vh rgba(0,0,0,0.5)",
            marginBottom: "3vh",
            background: "#000",
          }}
        >
          <video
            controls
            autoPlay
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            src="/demo/demo.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "auto",
            paddingTop: "2vh",
          }}
        >
          <p
            style={{
              fontSize: "min(1.8vh, 2.5vw)",
              opacity: 0.7,
              marginBottom: "2vh",
            }}
          >
            Press ESC key or click the X button to return to the main menu.
          </p>
        </div>
      </div>
    </div>
  )
}