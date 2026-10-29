import { useCallback, useEffect, useRef } from 'react'

// Normal speed (1x) in pixels per second. The gallery always moves from right to left.
const BASE_SPEED = 45

// Top speed of a boost, as a factor of the normal speed (2 = twice as fast).
const BOOST_FACTOR = 2

// A boost stays at top speed until this many milliseconds after the click ...
const BOOST_HOLD_END = 900

// ... and then slows down to normal speed during this many milliseconds.
const BOOST_SLOWDOWN_TIME = 1500

// Total length of a boost in milliseconds (used to show the active state on the button).
export const BOOST_DURATION = BOOST_HOLD_END + BOOST_SLOWDOWN_TIME

// Time (in seconds) the speed needs to reach a new target. Gives a smooth acceleration.
const SPEED_SMOOTHING = 0.15

// Speed factor (1 to 3) at this moment, for a boost that started at boostStart (or null).
// A new click only restarts the timer, so the speed never stacks beyond BOOST_FACTOR.
function getBoostFactor(now, boostStart) {
  if (boostStart === null) {
    return 1
  }
  const elapsed = now - boostStart
  if (elapsed < BOOST_HOLD_END) {
    return BOOST_FACTOR
  }
  const progress = (elapsed - BOOST_HOLD_END) / BOOST_SLOWDOWN_TIME
  if (progress >= 1) {
    return 1
  }
  const eased = progress * progress * (3 - 2 * progress)
  return BOOST_FACTOR - (BOOST_FACTOR - 1) * eased
}

// Visitors who prefer
const NO_MOTION_QUERY = '(prefers-reduced-motion: reduce), (hover: none)'

// Moves the gallery with ONE shared animation loop, automatically from right to left.
// The speed can be changed (multiplier) and boosted (fast-forward) without restarting.
//
// Everything is kept in a ref, so React does not re-render while the gallery moves.
export function useGalleryMotion() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const groupRef = useRef(null)

  const motion = useRef({
    position: 0, // how many pixels the track has moved to the left
    groupWidth: 0, // width of one group of photos = the distance of one full loop
    speed: 0, // current speed in pixels per second
    boostStart: null, // time of the last camera click, or null
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
      const boost = getBoostFactor(now, state.boostStart)
      const target = state.reasons.size > 0 ? 0 : BASE_SPEED * boost
      state.speed += (target - state.speed) * (1 - Math.exp(-seconds / SPEED_SMOOTHING))

      const isStopped = target === 0 && Math.abs(state.speed) < 0.5
      if (isStopped) {
        state.speed = 0
        state.frameId = null
        return
      }

      state.position += state.speed * seconds
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

  // Starts a temporary speed boost: faster, a short hold, then slowly back to normal.
  const triggerBoost = useCallback(() => {
    motion.current.boostStart = performance.now()
    startLoop()
  }, [startLoop])

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

  return {
    viewportRef,
    trackRef,
    groupRef,
    setPauseReason,
    triggerBoost,
    revealElement,
  }
}

