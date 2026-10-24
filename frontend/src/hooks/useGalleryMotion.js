import { useCallback, useEffect, useRef } from 'react'

// Top speed of the gallery in pixels per second (at the very edge).
const MAX_SPEED = 500

// Part of the gallery (left and right of the centre) where nothing moves: 8% each side.
const DEAD_ZONE = 0.08

// Time (in seconds) the speed needs to follow the mouse. Short, so it feels direct.
const SPEED_SMOOTHING = 0.07

// Calm speed (as a factor of MAX_SPEED) when the mouse is outside the gallery.
const AUTO_SPEED_FACTOR = 0.06

// Visitors who prefer
const NO_MOTION_QUERY = '(prefers-reduced-motion: reduce), (hover: none)'

// Turns the mouse position (0 = left edge, 1 = right edge) into a speed factor
// between -1 and 1. The centre gives exactly 0. Right of the centre the gallery moves
// left (positive), left of the centre it moves right (negative).
// The speed grows progressively (curved) towards the edges.
function getSpeedFactor(relativeX) {
  const offset = (relativeX - 0.5) * 2 // -1 at the left edge, 1 at the right edge
  const distance = Math.abs(offset)
  if (distance <= DEAD_ZONE) {
    return 0
  }
  const amount = Math.min((distance - DEAD_ZONE) / (1 - DEAD_ZONE), 1)
  return Math.sign(offset) * amount * amount
}

// Moves the gallery with ONE shared animation loop, controlled by the mouse.
// Nothing moves by itself: the speed always follows the mouse position.
//
// Everything is kept in a ref, so React does not re-render while the gallery moves.
export function useGalleryMotion() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const groupRef = useRef(null)

  const motion = useRef({
    position: 0, // how many pixels the track has moved to the left
    groupWidth: 0, // width of one group of photos = the distance of one full loop
    speed: 0, // current speed factor (-1 to 1)
    speedTarget: AUTO_SPEED_FACTOR, // speed factor wanted right now (calm drift at the start)
    direction: 1, // last direction chosen by the mouse: 1 = right to left, -1 = left to right
    lastFrame: 0,
    frameId: null,
    isEnabled: false,
    reasons: new Set(), // why the gallery is paused: 'user', 'focus', 'viewer'
  })

  const applyPosition = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-motion.current.position}px, 0, 0)`
    }
  }, [])

  // Keeps the position between 0 and one group width. The second group looks exactly
  // like the first, so jumping by one group width is not visible, in both directions.
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

      // A short smoothing step, so starting and stopping is quick but never harsh.
      const target = state.reasons.size > 0 ? 0 : state.speedTarget
      state.speed += (target - state.speed) * (1 - Math.exp(-seconds / SPEED_SMOOTHING))

      const isStopped = target === 0 && Math.abs(state.speed) < 0.0005
      if (isStopped) {
        state.speed = 0
        state.frameId = null
        return
      }

      state.position += MAX_SPEED * state.speed * seconds
      wrapPosition()
      applyPosition()
      state.frameId = requestAnimationFrame(runFrame)
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

  // Pause or continue for one reason. The gallery only moves when there is no reason left.
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

  // Called when the mouse moves over the gallery (relativeX: 0 = left, 1 = right).
  // Pass null when the mouse leaves: the gallery then drifts calmly in the last direction.
  const setMousePosition = useCallback(
    (relativeX) => {
      const state = motion.current
      if (relativeX === null) {
        state.speedTarget = state.direction * AUTO_SPEED_FACTOR
      } else {
        const factor = getSpeedFactor(relativeX)
        if (factor !== 0) {
          state.direction = Math.sign(factor)
        }
        state.speedTarget = factor
      }
      startLoop()
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
      } else if (box.right > view.right - margin) {
        motion.current.position += box.right - (view.right - margin)
      }
      wrapPosition()
      applyPosition()
    },
    [applyPosition, wrapPosition],
  )

  // Start and stop the loop, depending on the screen and the visitor's settings.
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
        state.speed = 0
        if (trackRef.current) {
          trackRef.current.style.transform = ''
        }
      } else {
        state.speedTarget = state.direction * AUTO_SPEED_FACTOR
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

  // Remember
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

  return { viewportRef, trackRef, groupRef, setPauseReason, setMousePosition, revealElement }
}

