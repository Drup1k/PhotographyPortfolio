import { useEffect, useRef, useState } from 'react'
import { getCardRatio } from '../lib/collageLayout'

const ENLARGE_DELAY = 200

// Zoom depends on photo size relative to screen height: small photos grow more.
const LARGE_SIZE = 0.62
const LARGE_SCALE = 1.35
const SMALL_SIZE = 0.36
const SMALL_SCALE = 1.9

function getAdaptiveScale(box) {
  const size = Math.max(box.width, box.height) / window.innerHeight
  const amount = Math.min(Math.max((size - SMALL_SIZE) / (LARGE_SIZE - SMALL_SIZE), 0), 1)
  return SMALL_SCALE + (LARGE_SCALE - SMALL_SCALE) * amount
}

// Minimum space between an enlarged photo and the screen edge.
const EDGE_MARGIN = 12

// One photo, or a placeholder when there is no image.
// With isInteractive it is a button: hover/focus enlarges it, click opens the viewer.
function PhotoCard({
  photo,
  isInteractive = false,
  isClone = false,
  onKeyboardFocus,
  onOpen,
}) {
  const cardRef = useRef(null)
  const zoomRef = useRef(null)
  const timerRef = useRef(null)
  const [isEnlarged, setIsEnlarged] = useState(false)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // Enlarges the photo and shifts it back inside the screen if needed.
  function enlarge() {
    const card = cardRef.current
    const zoom = zoomRef.current
    const viewport = card.closest('.gallery-viewport')
    const box = card.getBoundingClientRect()
    const area = viewport ? viewport.getBoundingClientRect() : { left: 0, right: window.innerWidth }

    // Limit the scale so the photo never gets larger than the screen.
    const maxScale = Math.min(
      (window.innerHeight - 2 * EDGE_MARGIN) / box.height,
      (window.innerWidth - 2 * EDGE_MARGIN) / box.width,
    )
    const scale = Math.max(1, Math.min(getAdaptiveScale(box), maxScale))

    // Keep enlarged photos out from under the fixed sidebar.
    const sidebar = document.querySelector('.sidebar')
    const sidebarRight =
      sidebar && getComputedStyle(sidebar).position === 'fixed'
        ? sidebar.getBoundingClientRect().right
        : 0

    const extraWidth = (box.width * (scale - 1)) / 2
    const extraHeight = (box.height * (scale - 1)) / 2
    const minLeft = Math.max(area.left, 0, sidebarRight) + EDGE_MARGIN
    const maxRight = Math.min(area.right, window.innerWidth) - EDGE_MARGIN
    const minTop = EDGE_MARGIN
    const maxBottom = window.innerHeight - EDGE_MARGIN

    let shiftX = 0
    let shiftY = 0
    if (box.left - extraWidth < minLeft) {
      shiftX = minLeft - (box.left - extraWidth)
    } else if (box.right + extraWidth > maxRight) {
      shiftX = maxRight - (box.right + extraWidth)
    }
    if (box.top - extraHeight < minTop) {
      shiftY = minTop - (box.top - extraHeight)
    } else if (box.bottom + extraHeight > maxBottom) {
      shiftY = maxBottom - (box.bottom + extraHeight)
    }

    zoom.style.setProperty('--scale', scale)
    zoom.style.setProperty('--shift-x', `${shiftX}px`)
    zoom.style.setProperty('--shift-y', `${shiftY}px`)
    setIsEnlarged(true)
  }

  function handlePointerEnter(event) {
    // Only a mouse hover enlarges.
    if (event.pointerType !== 'mouse') {
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(enlarge, ENLARGE_DELAY)
  }

  function handlePointerLeave(event) {
    if (event.pointerType !== 'mouse') {
      return
    }
    clearTimeout(timerRef.current)
    setIsEnlarged(false)
  }

  function handleFocus(event) {
    // Only keyboard focus, not mouse clicks.
    if (event.target.matches(':focus-visible')) {
      onKeyboardFocus?.(cardRef.current)
      enlarge()
    }
  }

  const classNames = ['photo-card']
  if (isEnlarged) {
    classNames.push('is-enlarged')
  }

  const content = photo.src ? (
    <img
      src={photo.thumbSrc || photo.src}
      alt={isInteractive ? '' : photo.alt}
      loading="lazy"
      decoding="async"
      draggable="false"
    />
  ) : (
    <span className={`photo-placeholder tone-${photo.tone}`}>
      <span>{photo.title}</span>
    </span>
  )

  return (
    <figure
      ref={cardRef}
      className={classNames.join(' ')}
      style={{ '--ratio': getCardRatio(photo) }}
      onPointerEnter={isInteractive ? handlePointerEnter : undefined}      onPointerLeave={isInteractive ? handlePointerLeave : undefined}
    >
      <div ref={zoomRef} className="photo-zoom">
        {isInteractive ? (
          <button
            type="button"
            className="photo-button"
            tabIndex={isClone ? -1 : 0}
            aria-label={`${photo.alt || photo.title}. Open larger photo`}
            onClick={() => onOpen?.(photo)}
            onFocus={handleFocus}
            onBlur={() => setIsEnlarged(false)}
          >
            {content}
          </button>
        ) : (
          content
        )}
      </div>
    </figure>
  )
}

export default PhotoCard

