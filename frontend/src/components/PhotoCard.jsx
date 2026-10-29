import { useEffect, useRef, useState } from 'react'
import { shapeRatios } from '../data/photos'

// How much a photo grows, and how long the mouse must stay on it first.
const ENLARGE_SCALE = 1.07
const ENLARGE_DELAY = 200

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
    const maxScale = (window.innerHeight - 2 * EDGE_MARGIN) / box.height
    const scale = Math.max(1, Math.min(ENLARGE_SCALE, maxScale))

    const extraWidth = (box.width * (scale - 1)) / 2
    const extraHeight = (box.height * (scale - 1)) / 2
    const minLeft = Math.max(area.left, 0) + EDGE_MARGIN
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

