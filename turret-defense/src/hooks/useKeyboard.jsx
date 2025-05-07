import { useState, useEffect } from "react"

// Custom Keyboard Hook
export default function useKeyboard() {
  const [keys, setKeys] = useState({
    a: false,
    d: false,
    s: false,
    q: false,
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      if (keys.hasOwnProperty(key)) {
        setKeys((prevKeys) => ({
          ...prevKeys,
          [key]: true,
        }))
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      if (keys.hasOwnProperty(key)) {
        setKeys((prevKeys) => ({
          ...prevKeys,
          [key]: false,
        }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  return keys
}
