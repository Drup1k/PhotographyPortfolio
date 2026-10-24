import { useEffect, useRef, useState } from 'react'
import { shapeRatios } from '../data/photos'

// Duration of the animations in milliseconds (keep in sync with Gallery.css).
const CLOSE_TIME = 250
const SWAP_TIME = 125 // out + in = about 250 ms

// A large view of one photo, using the built-in <dialog> element.
// The browser already provides: focus inside the dialog and a backdrop.
// onPrevious / onNext are optional: without them the arrows are not shown.
//
// Animations are done in CSS. This component only switches classes:
//   is-visible  = faded in (opening) / removed = fading out (closing)
//   is-swap-out / is-swap-in = the photo slides and fades away / in while switching
function PhotoViewer({ photo, onClose, onPrevious, onNext }) {
  const dialogRef = useRef(null)
  const timerRef = useRef(null)
  const isBusyRef = useRef(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  // null = photo shown, 'out' = fading out and sliding away, 'in' = new photo sliding in. swapDirection is 1 for next and -1 for previous.
  const [swapPhase, setSwapPhase] = useState(null)
  const [swapDirection, setSwapDirection] = useState(1)

  // Open the dialog, then start the fade-in on the next frame.
  // There is NO dialog.close() in the cleanup on purpose: it fires the close event
  // and React runs effects twice in development, which would close the viewer again.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) {
      dialog.showModal()
    }
    const frameId = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // Visitors who prefer reduced motion get no waiting time at all.
  function getDelay(milliseconds) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : milliseconds
  }

  // Fade out first, then close the dialog (this also returns focus to the photo)
  // and tell the gallery.
  function requestClose() {
    if (isClosing) {
      return
    }
    setIsClosing(true)
    setIsVisible(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      dialogRef.current?.close()
      onClose()
    }, getDelay(CLOSE_TIME))
  }

  // Fade the current photo out, show the next one, and fade it in.
  function step(change, direction) {
    if (!change || isBusyRef.current || isClosing) {
      return
    }
    isBusyRef.current = true
    setSwapDirection(direction)
    setSwapPhase('out')
    timerRef.current = setTimeout(() => {
      change()
      setSwapPhase('in')
      // The new photo slides in with a CSS animation, then the viewer is free again.
      timerRef.current = setTimeout(() => {
        setSwapPhase(null)
        isBusyRef.current = false
      }, getDelay(SWAP_TIME))
    }, getDelay(SWAP_TIME))
  }

  function handleBackdropClick(event) {
    // A click on the dialog itself (not on its content) is a click on the backdrop.
    if (event.target === dialogRef.current) {
      requestClose()
    }
  }

  function handleCancel(event) {
    // Escape: use our own fade-out instead of closing immediately.
    event.preventDefault()
    requestClose()
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(onPrevious, -1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(onNext, 1)
    }
  }

  const classNames = ['photo-viewer']
  if (isVisible) {
    classNames.push('is-visible')
  }
  if (isClosing) {
    classNames.push('is-closing')
  }
  if (swapPhase) {
    classNames.push(`is-swap-${swapPhase}`)
  }

  return (
    <dialog
      ref={dialogRef}
      className={classNames.join(' ')}
      style={{ '--slide': `${swapDirection * 1.5}rem` }}
      aria-label={photo.alt || photo.title}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="photo-viewer-frame" style={{ '--ratio': shapeRatios[photo.shape] }}>
        {photo.src ? (
          <img src={photo.src} alt={photo.alt} />
        ) : (
          <span className={`photo-placeholder tone-${photo.tone}`}>
            <span>{photo.title}</span>
          </span>
        )}
      </div>
      {onPrevious && (
        <button
          type="button"
          className="photo-viewer-arrow is-previous"
          aria-label="Previous photo"
          onClick={() => step(onPrevious, -1)}
        >
          &#8249;
        </button>
      )}
      {onNext && (
        <button
          type="button"
          className="photo-viewer-arrow is-next"
          aria-label="Next photo"
          onClick={() => step(onNext, 1)}
        >
          &#8250;
        </button>
      )}
      <button
        type="button"
        className="photo-viewer-close"
        aria-label="Close photo"
        onClick={requestClose}
      >
        &times;
      </button>
    </dialog>
  )
}

export default PhotoViewer
