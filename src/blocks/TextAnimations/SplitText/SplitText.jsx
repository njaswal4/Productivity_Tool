/*
    Installed from https://reactbits.dev/tailwind/
*/

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, GSAPSplitText)

const SplitText = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
  disableScrollTrigger = false,
}) => {
  const ref = useRef(null)
  const animationCompletedRef = useRef(false)
  const splitterRef = useRef(null)
  const tlRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Cleanup previous animation and SplitText instance
    if (tlRef.current) {
      tlRef.current.kill()
      tlRef.current = null
    }
    if (splitterRef.current) {
      splitterRef.current.revert()
      splitterRef.current = null
    }
    animationCompletedRef.current = false

    const absoluteLines = splitType === 'lines'
    if (absoluteLines) el.style.position = 'relative'

    const splitter = new GSAPSplitText(el, {
      type: splitType,
      absolute: absoluteLines,
      linesClass: 'split-line',
    })
    splitterRef.current = splitter

    let targets
    switch (splitType) {
      case 'lines':
        targets = splitter.lines
        break
      case 'words':
        targets = splitter.words
        break
      case 'words, chars':
        targets = [...splitter.words, ...splitter.chars]
        break
      default:
        targets = splitter.chars
    }

    targets.forEach((t) => {
      t.style.willChange = 'transform, opacity'
    })

    const startPct = (1 - threshold) * 100
    const m = /^(-?\d+)px$/.exec(rootMargin)
    const raw = m ? parseInt(m[1], 10) : 0
    const sign = raw < 0 ? `-=${Math.abs(raw)}px` : `+=${raw}px`
    const start = `top ${startPct}%${sign}`

    const tlConfig = {
      smoothChildTiming: true,
      onComplete: () => {
        animationCompletedRef.current = true
        gsap.set(targets, {
          ...to,
          clearProps: 'willChange',
          immediateRender: true,
        })
        onLetterAnimationComplete?.()
      },
    }

    if (!disableScrollTrigger) {
      tlConfig.scrollTrigger = {
        trigger: el,
        start,
        toggleActions: 'play none none none',
        once: true,
      }
    }

    const tl = gsap.timeline(tlConfig)
    tlRef.current = tl

    tl.set(targets, { ...from, immediateRender: false, force3D: true })
    tl.to(targets, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      force3D: true,
    })

    return () => {
      if (tlRef.current) tlRef.current.kill()
      if (!disableScrollTrigger) {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
      gsap.killTweensOf(targets)
      if (splitterRef.current) splitterRef.current.revert()
    }
  }, [
    text,
    delay,
    duration,
    ease,
    splitType,
    from,
    to,
    threshold,
    rootMargin,
    onLetterAnimationComplete,
    ref,
    disableScrollTrigger,
  ])

  return (
    <p
      ref={ref}
      className={`split-parent inline-block overflow-hidden whitespace-normal ${className}`}
      style={{
        textAlign,
        wordWrap: 'break-word',
      }}
    >
      {text}
    </p>
  )
}

export default SplitText
