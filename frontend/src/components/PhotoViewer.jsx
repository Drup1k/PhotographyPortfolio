import { useEffect, useRef } from 'react'
import { shapeRatios } from '../data/photos'

// A simple larger view of one photo, using the built-in <dialog> element.
// The browser already provides: focus inside the dialog, Escape to close, and a backdrop.
function PhotoViewer({ photo, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  function handleBackdropClick(event) {
    // A click on the dialog itself (not on its content) is a click on the backdrop.
    if (event.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="photo-viewer"
      aria-label={photo.alt || photo.title}
      onClose={onClose}
      onClick={handleBackdropClick}
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
      <button type="button" className="photo-viewer-close" onClick={onClose}>
        Close
      </button>
    </dialog>
  )
}

export default PhotoViewer
