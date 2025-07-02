/*
	Installed from https://reactbits.dev/tailwind/
*/

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TextCursor = ({
  text = '⚛️',
  imageSrc = '/img.png',
  delay = 0.01,
  spacing = 100,
  followMouseDirection = true,
  randomFloat = true,
  exitDuration = 0.5,
  removalInterval = 30,
  maxPoints = 5,
}) => {
  const [trail, setTrail] = useState([])
  const containerRef = useRef(null)
  const lastMoveTimeRef = useRef(Date.now())
  const idCounter = useRef(0)

  // Mousemove handler
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTrail((prev) => {
      let newTrail = [...prev]
      if (newTrail.length === 0) {
        newTrail.push({
          id: idCounter.current++,
          x: mouseX,
          y: mouseY,
          angle: 0,
          ...(randomFloat && {
            randomX: Math.random() * 10 - 5,
            randomY: Math.random() * 10 - 5,
            randomRotate: Math.random() * 10 - 5,
          }),
        })
      } else {
        const last = newTrail[newTrail.length - 1]
        const dx = mouseX - last.x
        const dy = mouseY - last.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance >= spacing) {
          let rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI
          if (rawAngle > 90) rawAngle -= 180
          else if (rawAngle < -90) rawAngle += 180
          const computedAngle = followMouseDirection ? rawAngle : 0
          const steps = Math.floor(distance / spacing)
          for (let i = 1; i <= steps; i++) {
            const t = (spacing * i) / distance
            const newX = last.x + dx * t
            const newY = last.y + dy * t
            newTrail.push({
              id: idCounter.current++,
              x: newX,
              y: newY,
              angle: computedAngle,
              ...(randomFloat && {
                randomX: Math.random() * 10 - 5,
                randomY: Math.random() * 10 - 5,
                randomRotate: Math.random() * 10 - 5,
              }),
            })
          }
        }
      }
      if (newTrail.length > maxPoints) {
        newTrail = newTrail.slice(newTrail.length - maxPoints)
      }
      return newTrail
    })
    lastMoveTimeRef.current = Date.now()
  }

  // Attach mousemove to the whole window for global effect
  useEffect(() => {
    const handle = (e) => handleMouseMove(e)
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
    // eslint-disable-next-line
  }, [spacing, followMouseDirection, randomFloat, maxPoints])

  // Remove trail points over time
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail((prev) => (prev.length > 0 ? prev.slice(1) : prev))
      }
    }, removalInterval)
    return () => clearInterval(interval)
  }, [removalInterval])

  return (
    <div ref={containerRef} className="w-full h-full pointer-events-none">
      <AnimatePresence>
        {trail.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 1, x: 0, y: 0, rotate: item.angle }}
            animate={{
              opacity: 1,
              scale: 1,
              x: randomFloat ? [0, item.randomX || 0, 0] : 0,
              y: randomFloat ? [0, item.randomY || 0, 0] : 0,
              rotate: randomFloat
                ? [
                    item.angle,
                    item.angle + (item.randomRotate || 0),
                    item.angle,
                  ]
                : item.angle,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              opacity: { duration: exitDuration, ease: 'easeOut', delay },
              ...(randomFloat && {
                x: {
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                },
                y: {
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                },
                rotate: {
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'mirror',
                },
              }),
            }}
            className="absolute select-none whitespace-nowrap text-6xl pointer-events-none"
            style={{ left: item.x, top: item.y }}
          >
            {imageSrc ? (
              <img src={imageSrc} alt="" className="w-8 h-8" />
            ) : (
              <span className="text-6xl">{text}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TextCursor
