const sounds = {
    buttonClick: new Audio("/sound-effects/button-click.mp3"),
    buttonSwitching: new Audio("/sound-effects/button-switching.mp3"),
    mainMenuBackground: new Audio("/sound-effects/main-menu-background.mp3"),
    shooting: new Audio("/sound-effects/shooting.mp3"),
    superChargeActivate: new Audio("/sound-effects/super-charge-activate.mp3"),
    playSuperChargeReady: new Audio("/sound-effects/super-charge.mp3"),
    upgrade: new Audio("/sound-effects/upgrade.mp3"),
    waveCompleted: new Audio("/sound-effects/wave-completed.mp3"),
    gameOver: new Audio("/sound-effects/game-over.mp3"),
    bossWave: new Audio("/sound-effects/boss-wave.mp3"),
  }
  
  // Configure audio settings
  sounds.mainMenuBackground.loop = true
  sounds.mainMenuBackground.volume = 0.5
  sounds.shooting.volume = 0.8
  sounds.superChargeActivate.volume = 1.0
  sounds.upgrade.volume = 1.0
  sounds.waveCompleted.volume = 1.0
  
  // Track if audio context is unlocked
  let audioContextUnlocked = false
  
  // Utility functions
  const playSound = (sound) => {
    try {
      // Create a new audio instance to allow overlapping sounds
      const audio = sound.cloneNode()
  
      // Only attempt to play if had user interaction
      if (audioContextUnlocked) {
        audio.play().catch((err) => console.error("Error playing sound:", err))
      }
  
      return audio
    } catch (err) {
      console.error("Error playing sound:", err)
      return null
    }
  }
  
  const stopSound = (sound) => {
    try {
      sound.pause()
      sound.currentTime = 0
    } catch (err) {
      console.error("Error stopping sound:", err)
    }
  }
  
  // Function to unlock audio context after user interaction
  const unlockAudioContext = () => {
    audioContextUnlocked = true
  
    // Try to play a silent sound to unlock audio
    const silentSound = new Audio()
    silentSound.play().catch(() => {})
  
    // Remove the event listeners once unlocked
    document.removeEventListener("click", unlockAudioContext)
    document.removeEventListener("keydown", unlockAudioContext)
    document.removeEventListener("touchstart", unlockAudioContext)
  }
  
  // Event listeners to unlock audio context on user interaction
  document.addEventListener("click", unlockAudioContext)
  document.addEventListener("keydown", unlockAudioContext)
  document.addEventListener("touchstart", unlockAudioContext)
  
  export const SoundEffects = {
    playButtonClick: () => playSound(sounds.buttonClick),
    playButtonSwitch: () => playSound(sounds.buttonSwitching),
    playMainMenuMusic: () => {
      try {
        if (audioContextUnlocked) {
          sounds.mainMenuBackground.play().catch((err) => console.error("Error playing menu music:", err))
        }
        return sounds.mainMenuBackground
      } catch (err) {
        console.error("Error playing menu music:", err)
        return null
      }
    },
    stopMainMenuMusic: () => stopSound(sounds.mainMenuBackground),
    playShooting: () => playSound(sounds.shooting),
    playSuperChargeActivate: () => playSound(sounds.superChargeActivate),
    playUpgrade: () => playSound(sounds.upgrade),
    playWaveCompleted: () => playSound(sounds.waveCompleted),
    playGameOver: () => playSound(sounds.gameOver),
    playSuperChargeReady: () => playSound(sounds.playSuperChargeReady),
    playBossWave: () => playSound(sounds.bossWave),

    // Method to manually trigger audio context unlock (for buttons)
    unlockAudio: unlockAudioContext,
  }
  