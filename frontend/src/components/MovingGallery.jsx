import { useMemo, useState } from 'react'
import PhotoCard from './PhotoCard'
import PhotoViewer from './PhotoViewer'
import { buildCollage } from '../lib/collageLayout'
import { useGalleryMotion } from '../hooks/useGalleryMotion'

// One column; its width is set in CSS so the stacked photos fill the column height.
function CollageColumn({ column, isClone, cardProps }) {
  return (
    <div
      className="collage-column"
      aria-hidden={isClone ? 'true' : undefined}
      style={{ '--photo-count': column.photos.length, '--inverse-sum': column.inverseSum, '--fill': 1 }}
    >
      {column.photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} isClone={isClone} isInteractive {...cardProps} />
      ))}
    </div>
  )
}

function MovingGallery({ photos }) {
  const { viewportRef, trackRef, groupRef, setPauseReason, setDirectionAndNudge, revealElement } =
    useGalleryMotion()
  const [openPhoto, setOpenPhoto] = useState(null)
  const { columns, repeats } = useMemo(() => buildCollage(photos), [photos])

  function handleOpen(photo) {
    setPauseReason('viewer', true)
    setOpenPhoto(photo)
  }

  function handleClose() {
    setPauseReason('viewer', false)
    setOpenPhoto(null)
  }

  // Previous (-1) or next (1) photo, looping at the ends.
  function handleStep(step) {
    const index = photos.findIndex((photo) => photo.id === openPhoto.id)
    setOpenPhoto(photos[(index + step + photos.length) % photos.length])
  }

  function handleKeyboardFocus(element) {
    setPauseReason('focus', true)
    revealElement(element)
  }

  function handleBlur(event) {
    // Stay paused while focus moves between photos.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setPauseReason('focus', false)
    }
  }

  function handleMoveLeft() {
    setDirectionAndNudge(1)
  }

  function handleMoveRight() {
    setDirectionAndNudge(-1)
  }

  const cardProps = {
    onKeyboardFocus: handleKeyboardFocus,
    onOpen: handleOpen,
  }

  // Two identical groups make the loop seamless; the copy is hidden from screen readers and keyboard.
  return (
    <section className="moving-gallery" aria-label="Photo gallery">
      <button
        type="button"
        className="gallery-arrow gallery-arrow-left"
        aria-label="Move gallery left"
        onClick={handleMoveLeft}
      >
        {'\u2190'}
      </button>

      <button
        type="button"
        className="gallery-arrow gallery-arrow-right"
        aria-label="Move gallery right"
        onClick={handleMoveRight}
      >
        {'\u2192'}
      </button>

      <div ref={viewportRef} className="gallery-viewport" onBlur={handleBlur}>
        <div ref={trackRef} className="gallery-track">
          {[0, 1].map((group) => (
            <div
              key={group}
              ref={group === 0 ? groupRef : undefined}
              className={group === 1 ? 'gallery-group is-clone-group' : 'gallery-group'}
              aria-hidden={group === 1 ? 'true' : undefined}
            >
              {Array.from({ length: repeats }, (_, repeat) =>
                columns.map((column, index) => (
                  <CollageColumn
                    key={`${repeat}-${index}`}
                    column={column}
                    isClone={group === 1 || repeat > 0}
                    cardProps={cardProps}
                  />
                )),
              )}
            </div>
          ))}
        </div>
      </div>

      {openPhoto && (
        <PhotoViewer
          photo={openPhoto}
          onClose={handleClose}
          onPrevious={() => handleStep(-1)}
          onNext={() => handleStep(1)}
        />
      )}
    </section>
  )
}

export default MovingGallery

