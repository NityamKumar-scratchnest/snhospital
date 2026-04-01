import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

const SPRING = { damping: 28, stiffness: 320, mass: 0.35 }

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [pressing, setPressing] = useState(false)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, SPRING)
  const sy = useSpring(my, SPRING)

  useEffect(() => {
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
    if (coarse) return

    const raf = requestAnimationFrame(() => setEnabled(true))
    document.documentElement.classList.add("has-custom-cursor")

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      const target = e.target as HTMLElement | null
      const interactive = target?.closest(
        "a, button, [role='button'], input, textarea, select, [data-cursor='pointer']"
      )
      setHovering(!!interactive)
    }

    const onDown = () => setPressing(true)
    const onUp = () => setPressing(false)
    const onLeave = () => setHovering(false)

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)
    document.body.addEventListener("mouseleave", onLeave)

    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove("has-custom-cursor")
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      document.body.removeEventListener("mouseleave", onLeave)
    }
  }, [mx, my])

  if (!enabled) return null

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-2 w-2 rounded-full bg-scratch-accent"
        style={{ x: mx, y: my, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: pressing ? 0.85 : hovering ? 0.4 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-10 w-10 rounded-full border-[1.5px] border-scratch-accent/45"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: pressing ? 0.92 : hovering ? 1.35 : 1,
          opacity: hovering ? 0.95 : 0.45,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </>
  )
}
