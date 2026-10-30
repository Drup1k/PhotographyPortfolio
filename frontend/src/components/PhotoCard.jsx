import { useEffect, useRef, useState } from 'react'
import { shapeRatios } from '../data/photos'

// How long the mouse must stay on a photo before it grows.
const ENLARGE_DELAY = 200

// The zoom depends on the displayed size of the photo (its longest side compared with
// the screen height): large photos grow a little, small photos grow more.
const LARGE_SIZE = 0.62
const LARGE_SCALE = 1.35
const SMALL_SIZE = 0.36
const SMALL_SCALE = 1.9

function getAdaptiveScale(box) {
  const size = Math.max(box.width, box.height) / window.innerHeight
  const amount = Math.min(Math.max((size - SMALL_SIZE) / (LARGE_SIZE - SMALL_SIZE), 0), 1)
  return SMALL_SCALE + (LARGE_SCALE - SMALL_SCALE) * amount
}

// Space that is always kept free between an enlarged photo and the edge of the screen.
const EDGE_MARGIN = 12

// Shows one photo. While there is no real image, a placeholder is shown instead.
//
// The outer <figure> only reserves the space. The inner .photo-zoom is the part that
// grows, so the enlargement never fights with the moving track.
//
// Without isInteractive (Portfolio page) the card is just a picture.
// With isInteractive (Home page) it is a button: hover or keyboard focus enlarges it,
// and a click or Enter/Space opens the larger photo view.
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

  // Grows the photo. If it would leave the screen, it is shifted back inside.
  function enlarge() {
    const card = cardRef.current
    const zoom = zoomRef.current
    const viewport = card.closest('.gallery-viewport')
    const box = card.getBoundingClientRect()
    const area = viewport ? viewport.getBoundingClientRect() : { left: 0, right: window.innerWidth }

    // Tall photos could become higher than the screen, so the scale is limited.
    const maxScale = Math.min(
      (window.innerHeight - 2 * EDGE_MARGIN) / box.height,
      (window.innerWidth - 2 * EDGE_MARGIN) / box.width,
    )
    const scale = Math.max(1, Math.min(getAdaptiveScale(box), maxScale))

    // A fixed (desktop) sidebar must stay free, so the photo is never enlarged under it.
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
    // Only a real mouse enlarges (touch and pen use the click instead).
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
    // :focus-visible is true for keyboard focus, but not for a mouse click.
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
    <img src={photo.src} alt={isInteractive ? '' : photo.alt} draggable="false" />
  ) : (
    <span className={`photo-placeholder tone-${photo.tone}`}>
      <span>{photo.title}</span>
    </span>
  )

  return (
    <figure
      ref={cardRef}
      className={classNames.join(' ')}
      style={{ '--ratio': shapeRatios[photo.shape] }}
      onPointerEnter={isInteractive ? handlePointerEnter : undefined}
      onPointerLeave={isInteractive ? handlePointerLeave : undefined}
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

