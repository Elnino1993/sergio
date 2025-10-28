"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface Pumpkin {
  id: number
  x: number
  y: number
  rotation: number
  velocityY: number
  velocityX: number
}

export default function PumpkinGame() {
  const [pumpkins, setPumpkins] = useState<Pumpkin[]>([])
  const [gameStarted, setGameStarted] = useState(false)

  const PUMPKIN_SIZE = 60
  const GROUND_HEIGHT = 100

  const CHARACTER_BOX = {
    x: window.innerWidth / 2 - 120, // Narrower box for just the character
    y: window.innerHeight - 280, // Moved down to only cover character's body
    width: 240,
    height: 180, // Reduced height to avoid collision at top
  }

  useEffect(() => {
    if (!gameStarted) return

    const interval = setInterval(() => {
      setPumpkins((prev) =>
        prev.map((pumpkin, index) => {
          let newY = pumpkin.y + pumpkin.velocityY
          let newX = pumpkin.x + pumpkin.velocityX
          let newVelocityY = pumpkin.velocityY + 0.5 // gravity
          let newVelocityX = pumpkin.velocityX
          const newRotation = pumpkin.rotation + 5

          const pumpkinCenterX = newX + PUMPKIN_SIZE / 2
          const pumpkinCenterY = newY + PUMPKIN_SIZE / 2

          if (
            pumpkinCenterX > CHARACTER_BOX.x &&
            pumpkinCenterX < CHARACTER_BOX.x + CHARACTER_BOX.width &&
            pumpkinCenterY > CHARACTER_BOX.y &&
            pumpkinCenterY < CHARACTER_BOX.y + CHARACTER_BOX.height
          ) {
            // Determine which side of the character was hit
            const fromLeft = pumpkinCenterX < CHARACTER_BOX.x + CHARACTER_BOX.width / 2
            const fromTop = pumpkinCenterY < CHARACTER_BOX.y + CHARACTER_BOX.height / 2

            if (fromTop) {
              // Stop on top instead of bouncing
              newY = CHARACTER_BOX.y - PUMPKIN_SIZE
              newVelocityY = 0
              newVelocityX = newVelocityX * 0.3 // Slow down horizontal movement
            } else {
              // Slide off sides
              if (fromLeft) {
                newX = CHARACTER_BOX.x - PUMPKIN_SIZE
                newVelocityX = -2
              } else {
                newX = CHARACTER_BOX.x + CHARACTER_BOX.width
                newVelocityX = 2
              }
              newVelocityY = Math.min(newVelocityY, 3) // Continue falling but not too fast
            }
          }

          if (newY >= window.innerHeight - GROUND_HEIGHT - PUMPKIN_SIZE) {
            newY = window.innerHeight - GROUND_HEIGHT - PUMPKIN_SIZE
            newVelocityY = 0
            newVelocityX = 0
          }

          for (let i = 0; i < prev.length; i++) {
            if (i === index) continue

            const other = prev[i]
            const dx = newX - other.x
            const dy = newY - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < PUMPKIN_SIZE) {
              if (pumpkin.y < other.y) {
                newY = other.y - PUMPKIN_SIZE
                newVelocityY = 0
                newVelocityX = 0
              }
            }
          }

          return {
            ...pumpkin,
            y: newY,
            x: newX,
            velocityY: newVelocityY,
            velocityX: newVelocityX,
            rotation: newRotation,
          }
        }),
      )
    }, 16)

    return () => clearInterval(interval)
  }, [gameStarted])

  const handleClick = (e: React.MouseEvent) => {
    if (!gameStarted) {
      setGameStarted(true)
    }

    const newPumpkin: Pumpkin = {
      id: Date.now(),
      x: e.clientX - PUMPKIN_SIZE / 2,
      y: 0,
      rotation: Math.random() * 360,
      velocityY: 2,
      velocityX: (Math.random() - 0.5) * 3,
    }

    setPumpkins((prev) => [...prev, newPumpkin])
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-green-500 cursor-crosshair" onClick={handleClick}>
      {/* Target Image */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%D0%91%D0%B5%D0%B7%20%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%20%282%29-8NfyeuzTSKCMtfTp2mCIzXQnF9a3Tb.png"
          alt="Target"
          className="w-80 h-auto pointer-events-none select-none"
        />
      </div>

      {/* Pumpkins */}
      {pumpkins.map((pumpkin) => (
        <div
          key={pumpkin.id}
          className="absolute pointer-events-none z-30 transition-transform"
          style={{
            left: `${pumpkin.x}px`,
            top: `${pumpkin.y}px`,
            transform: `rotate(${pumpkin.rotation}deg)`,
          }}
        >
          <div className="text-6xl drop-shadow-lg">🎃</div>
        </div>
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-700 to-green-600 z-0" />
    </div>
  )
}
