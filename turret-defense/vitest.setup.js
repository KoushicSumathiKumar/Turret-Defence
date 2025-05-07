import { afterEach, beforeAll } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

// Automatically clean up after each test
afterEach(() => {
  cleanup()
})

// Mock Audio API for tests
beforeAll(() => {
  // Create a mock implementation of Audio
  class MockAudio {
    constructor() {
      this.src = ""
      this.volume = 1
      this.loop = false
      this.currentTime = 0
      this.paused = true
    }

    play() {
      this.paused = false
      // Return a resolved promise to match the real Audio API
      return Promise.resolve()
    }

    pause() {
      this.paused = true
    }

    cloneNode() {
      return new MockAudio()
    }
  }

  // Replace global Audio constructor with our mock
  global.Audio = MockAudio

  // Mock other audio-related properties and methods
  Object.defineProperty(global.HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: () => Promise.resolve(),
  })

  Object.defineProperty(global.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: () => {},
  })
})
