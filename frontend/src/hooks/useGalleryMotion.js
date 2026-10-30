import { useCallback, useEffect, useRef } from 'react'

const DRIFT_SPEED = 32
const NUDGE_SMOOTHING = 0.28
const NO_MOTION_QUERY = '(prefers-reduced-motion: reduce), (hover: none)'

// Slow drift to the left; arrow clicks nudge half a viewport and set the drift direction.
export function useGalleryMotion() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const groupRef = useRef(null)

  const motion = useRef({
    position: 0,
    groupWidth: 0,
    driftDirection: 1, // 1 = move left, -1 = move right
    nudgeRemaining: 0,
    lastFrame: 0,
    frameId: null,
    isEnabled: false,
    reasons: new Set(), // pause reasons: 'focus', 'viewer'
  })

  const applyPosition = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-motion.current.position}px, 0, 0)`
    }
  }, [])

  const wrapPosition = useCallback(() => {
    const state = motion.current
    if (state.groupWidth > 0) {
      state.position = ((state.position % state.groupWidth) + state.groupWidth) % state.groupWidth
    }
  }, [])

  const runFrame = useCallback(
    function runFrame(now) {
      const state = motion.current
      const seconds = Math.min(now - state.lastFrame, 50) / 1000
      state.lastFrame = now

      if (state.reasons.size === 0) {
        const drift = DRIFT_SPEED * state.driftDirection * seconds
        let nudge = 0

        if (Math.abs(state.nudgeRemaining) > 0.25) {
          nudge = state.nudgeRemaining * (1 - Math.exp(-seconds / NUDGE_SMOOTHING))
          state.nudgeRemaining -= nudge
        } else {
          state.nudgeRemaining = 0
        }

        state.position += drift + nudge
        wrapPosition()
        applyPosition()
      }

      const isPaused = state.reasons.size > 0
      const hasNudge = Math.abs(state.nudgeRemaining) > 0.25
      if (state.isEnabled && (!isPaused || hasNudge)) {
        state.frameId = requestAnimationFrame(runFrame)
      } else {
        state.frameId = null
      }
    },
    [applyPosition, wrapPosition],
  )

  const startLoop = useCallback(() => {
    const state = motion.current
    if (state.isEnabled && state.frameId === null) {
      state.lastFrame = performance.now()
      state.frameId = requestAnimationFrame(runFrame)
    }
  }, [runFrame])

  const setPauseReason = useCallback(
    (reason, isActive) => {
      const state = motion.current
      if (isActive) {
        state.reasons.add(reason)
      } else {
        state.reasons.delete(reason)
      }
      startLoop()
    },
    [startLoop],
  )

  // direction: 1 = move left, -1 = move right
  const setDirectionAndNudge = useCallback(
    (direction) => {
      const state = motion.current
      const nextDirection = direction >= 0 ? -1 : 1
      const nudgeDistance = (viewportRef.current?.clientWidth ?? 600) * 0.5

      if (Math.sign(state.nudgeRemaining) !== 0 && Math.sign(state.nudgeRemaining) !== nextDirection) {
        state.nudgeRemaining = 0
      }

      state.driftDirection = nextDirection
      state.nudgeRemaining += nextDirection * nudgeDistance
      startLoop()
    },
    [startLoop],
  )

  // Moves the gallery a little when keyboard focus lands on a photo outside the viewport.
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
      } else if (box.right > view.right - margin) {
        motion.current.position += box.right - (view.right - margin)
      }
      wrapPosition()
      applyPosition()
    },
    [applyPosition, wrapPosition],
  )

  useEffect(() => {
    const state = motion.current
    const query = window.matchMedia(NO_MOTION_QUERY)

    function updateEnabled() {
      state.isEnabled = !query.matches
      if (!state.isEnabled) {
        if (state.frameId !== null) {
          cancelAnimationFrame(state.frameId)
          state.frameId = null
        }
        state.position = 0
        state.nudgeRemaining = 0
        if (trackRef.current) {
          trackRef.current.style.transform = ''
        }
      } else {
        startLoop()
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

  return { viewportRef, trackRef, groupRef, setPauseReason, setDirectionAndNudge, revealElement }
}

