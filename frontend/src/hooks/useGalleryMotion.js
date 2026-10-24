import { useCallback, useEffect, useRef } from 'react'

// Normal speed of the gallery in pixels per second. Calm and cinematic.
const BASE_SPEED = 24

// Time (in milliseconds) to slow down to a stop, and to speed up again.
const EASE_DURATION = 900

// Touch screens and visitors who prefer reduced motion get a scrollable gallery instead.
const NO_MOTION_QUERY = '(prefers-reduced-motion: reduce), (hover: none)'

// Starts fast and ends slowly, so the movement feels natural.
function easeOut(progress) {
  return 1 - Math.pow(1 - progress, 3)
}

// Moves the whole gallery with ONE shared animation loop.
//
// Instead of pausing CSS animations (which stops everything instantly), we change
// the position ourselves on every frame. A shared "speed" (1 = normal, 0 = stopped)
// slowly eases towards its new value, so the photos glide to a stop and glide back.
//
// Everything is kept in a ref, so React does not re-render during the animation.
export function useGalleryMotion() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const groupRef = useRef(null)

  const motion = useRef({
    position: 0, // how many pixels the track has moved to the left
    groupWidth: 0, // width of one group of photos = the distance of one full loop
    speed: 1, // current speed factor
    speedFrom: 1, // speed factor when the last change started
    speedTarget: 1, // speed factor we are heading to
    changedAt: 0, // time of the last change
    lastFrame: 0,
    frameId: null,
    isEnabled: false,
    reasons: new Set(), // why the gallery is paused: 'user', 'hover', 'focus', 'viewer'
  })

  const applyPosition = useCallback(() => {
    const state = motion.current
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-state.position}px, 0, 0)`
    }
  }, [])

  const runFrame = useCallback(
    function runFrame(now) {
      const state = motion.current
      const seconds = Math.min(now - state.lastFrame, 50) / 1000
      state.lastFrame = now

      const progress = Math.min((now - state.changedAt) / EASE_DURATION, 1)
      state.speed = state.speedFrom + (state.speedTarget - state.speedFrom) * easeOut(progress)

      state.position += BASE_SPEED * state.speed * seconds

      // The second group looks exactly like the first one, so jumping back
      // by one group width is not visible.
      if (state.groupWidth > 0 && state.position >= state.groupWidth) {
        state.position -= state.groupWidth
      }
      if (state.position < 0 && state.groupWidth > 0) {
        state.position += state.groupWidth
      }
      applyPosition()

      const isStopped = state.speedTarget === 0 && progress >= 1
      state.frameId = isStopped ? null : requestAnimationFrame(runFrame)
    },
    [applyPosition],
  )

  const startLoop = useCallback(() => {
    const state = motion.current
    if (state.isEnabled && state.frameId === null) {
      state.lastFrame = performance.now()
      state.frameId = requestAnimationFrame(runFrame)
    }
  }, [runFrame])

  // Pause or continue for one reason. The gallery only moves when there is no reason left.
  const setPauseReason = useCallback(
    (reason, isActive) => {
      const state = motion.current
      if (isActive) {
        state.reasons.add(reason)
      } else {
        state.reasons.delete(reason)
      }

      const newTarget = state.reasons.size > 0 ? 0 : 1
      if (newTarget !== state.speedTarget) {
        state.speedFrom = state.speed
        state.speedTarget = newTarget
        state.changedAt = performance.now()
        startLoop()
      }
    },
    [startLoop],
  )

  // Moves the gallery a little, only when a photo that gets keyboard focus is outside the screen.
  const revealElement = useCallback(
    (element) => {
      if (!viewportRef.current) {
        return
      }
      const margin = 48
      const view = viewportRef.current.getBoundingClientRect()
      const box = element.getBoundingClientRect()

      if (box.left < view.left + margin) {
        motion.current.position += box.left - (view.left + margin)
        applyPosition()
      } else if (box.right > view.right - margin) {
        motion.current.position += box.right - (view.right - margin)
        applyPosition()
      }

      const { groupWidth } = motion.current
      if (groupWidth > 0 && motion.current.position < 0) {
        motion.current.position += groupWidth
        applyPosition()
      }
    },
    [applyPosition],
  )

  // Start and stop the loop, depending on the screen and the visitor's settings.
  useEffect(() => {
    const state = motion.current
    const query = window.matchMedia(NO_MOTION_QUERY)

    function updateEnabled() {
      state.isEnabled = !query.matches
      if (state.isEnabled) {
        startLoop()
      } else {
        if (state.frameId !== null) {
          cancelAnimationFrame(state.frameId)
          state.frameId = null
        }
        state.position = 0
        if (trackRef.current) {
          trackRef.current.style.transform = ''
        }
      }
    }

    updateEnabled()
    query.addEventListener('change', updateEnabled)

    return () => {
      query.removeEventListener('change', updateEnabled)
      if (state.frameId !== null) {
        cancelAnimationFrame(state.frameId)
        state.frameId = null
      }
    }
  }, [startLoop])

  // Remember the width of one group (it changes when the window is resized).
  useEffect(() => {
    const group = groupRef.current
    if (!group) {
      return undefined
    }

    const observer = new ResizeObserver(() => {
      motion.current.groupWidth = group.offsetWidth
    })
    observer.observe(group)
    motion.current.groupWidth = group.offsetWidth

    return () => observer.disconnect()
  }, [])

  return { viewportRef, trackRef, groupRef, setPauseReason, revealElement }
}
