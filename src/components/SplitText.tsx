import { type CSSProperties, type ElementType, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP)

type SplitInstanceElement = HTMLElement & {
  _rbsplitInstance?: GSAPSplitText | null
}

type SplitTextProps = {
  tag?: ElementType
  text: string
  className?: string
  style?: CSSProperties
  delay?: number
  duration?: number
  ease?: string
  splitType?: string
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  rootMargin?: string
  triggerOnView?: boolean
  textAlign?: CSSProperties['textAlign']
  onLetterAnimationComplete?: () => void
}

export default function SplitText({
  text,
  className = '',
  style,
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  triggerOnView = true,
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<SplitInstanceElement | null>(null)
  const animationCompletedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true)
      return
    }

    document.fonts.ready.then(() => setFontsLoaded(true))
  }, [])

  useGSAP(
    () => {
      const el = ref.current
      if (!el || !text || !fontsLoaded || animationCompletedRef.current) return

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert()
        } catch {
          // GSAP can throw if a previous split was already reverted.
        }
        el._rbsplitInstance = null
      }

      const startPct = (1 - threshold) * 100
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px'
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`
      const start = `top ${startPct}%${sign}`

      let targets: Element[] | undefined
      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars
        if (!targets && splitType.includes('words') && self.words.length) targets = self.words
        if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines
        if (!targets) targets = self.chars.length ? self.chars : self.words.length ? self.words : self.lines
      }

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self) => {
          assignTargets(self)
          return gsap.fromTo(targets ?? el, { ...from }, {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            scrollTrigger: triggerOnView
              ? {
                  trigger: el,
                  start,
                  once: true,
                  fastScrollEnd: true,
                  anticipatePin: 0.4,
                }
              : undefined,
            onComplete: () => {
              animationCompletedRef.current = true
              onCompleteRef.current?.()
            },
            willChange: 'transform, opacity',
            force3D: true,
          })
        },
      })

      el._rbsplitInstance = splitInstance

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === el) trigger.kill()
        })
        try {
          splitInstance.revert()
        } catch {
          // Already reverted.
        }
        el._rbsplitInstance = null
      }
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        triggerOnView,
        fontsLoaded,
      ],
      scope: ref,
    },
  )

  const Tag = tag || 'p'

  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: 'hidden',
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {text}
    </Tag>
  )
}
