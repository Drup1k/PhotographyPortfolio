import { useState } from 'react'
import PhotoCard from './PhotoCard'
import PhotoViewer from './PhotoViewer'
import { shapeRatios } from '../data/photos'
import { useGalleryMotion } from '../hooks/useGalleryMotion'

// The collage is built from columns. Every column stacks one or two photos (numbers are
// photo ids from photos.js). Columns have different heights and sit at the top, middle
// or bottom, so the seams between photos do not line up. That gives an organic look.
// fill = how much of the gallery height the column uses, align = where it sits.
const collageColumns = [
  { ids: [4], fill: 1, align: 'center' },
  { ids: [2, 3], fill: 0.9, align: 'flex-start' },
  { ids: [1, 5], fill: 0.96, align: 'flex-end' },
  { ids: [8, 10], fill: 0.84, align: 'center' },
  { ids: [6], fill: 0.92, align: 'flex-start' },
  { ids: [7, 11], fill: 1, align: 'center' },
  { ids: [9, 12], fill: 0.88, align: 'flex-end' },
  { ids: [13], fill: 0.97, align: 'flex-start' },
  { ids: [14, 15], fill: 0.85, align: 'center' },
  { ids: [16, 17], fill: 0.94, align: 'flex-end' },
  { ids: [18], fill: 0.9, align: 'center' },
  { ids: [19, 20], fill: 1, align: 'flex-start' },
  { ids: [22], fill: 0.95, align: 'flex-end' },
  { ids: [21, 23], fill: 0.86, align: 'center' },
  { ids: [24], fill: 0.93, align: 'flex-start' },
]

// One column. Its width is calculated in CSS so that the stacked photos together fill
// the column height, while every photo keeps its own proportions.
function CollageColumn({ column, photos, isClone, cardProps }) {
  const columnPhotos = column.ids
    .map((id) => photos.find((photo) => photo.id === id))
    .filter(Boolean)
  const inverseSum = columnPhotos.reduce((sum, photo) => sum + 1 / shapeRatios[photo.shape], 0)

  return (
    <div
      className="collage-column"
      style={{
        '--photo-count': columnPhotos.length,
        '--inverse-sum': inverseSum,
        '--fill': column.fill,
        alignSelf: column.align,
      }}
    >
      {columnPhotos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} isClone={isClone} isInteractive {...cardProps} />
      ))}
    </div>
  )
}

function MovingGallery({ photos }) {
  const { viewportRef, trackRef, groupRef, setPauseReason, setMousePosition, revealElement } =
    useGalleryMotion()
  const [isPausedByUser, setIsPausedByUser] = useState(false)
  const [openPhoto, setOpenPhoto] = useState(null)

  function handleToggle() {
    setPauseReason('user', !isPausedByUser)
    setIsPausedByUser(!isPausedByUser)
  }

  function handleOpen(photo) {
    setPauseReason('viewer', true)
    setOpenPhoto(photo)
  }

  function handleClose() {
    setPauseReason('viewer', false)
    setOpenPhoto(null)
  }

  // Step to the previous (-1) or next (1) photo, and loop around at the ends.
  function handleStep(step) {
    const index = photos.findIndex((photo) => photo.id === openPhoto.id)
    setOpenPhoto(photos[(index + step + photos.length) % photos.length])
  }

  function handleKeyboardFocus(element) {
    setPauseReason('focus', true)
    revealElement(element)
  }

  function handleBlur(event) {
    // Keep the pause while focus moves from one photo to the next.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setPauseReason('focus', false)
    }
  }

  // The horizontal mouse position controls the speed (the hook does the maths).
  function handlePointerMove(event) {
    if (event.pointerType !== 'mouse') {
      return
    }
    const box = event.currentTarget.getBoundingClientRect()
    setMousePosition((event.clientX - box.left) / box.width)
  }

  const cardProps = {
    onKeyboardFocus: handleKeyboardFocus,    onOpen: handleOpen,
  }

  // The track holds two identical groups. It moves one group to the left and then
  // starts again at the beginning. The second group looks exactly like the first,
  // so the restart is not visible: no jump and no empty gap.
  // Only the first group is real content; the copy is hidden from screen readers
  // and from the keyboard.
  return (
    <section className="moving-gallery" aria-label="Photo gallery">
      <button
        type="button"
        className="gallery-toggle"
        aria-pressed={isPausedByUser}
        onClick={handleToggle}
      >
        {isPausedByUser ? 'Play gallery' : 'Pause gallery'}
      </button>

      <div
        ref={viewportRef}
        className="gallery-viewport"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setMousePosition(null)}
        onBlur={handleBlur}
      >
        <div ref={trackRef} className="gallery-track">
          {[0, 1].map((group) => (
            <div
              key={group}
              ref={group === 0 ? groupRef : undefined}
              className={group === 1 ? 'gallery-group is-clone-group' : 'gallery-group'}
              aria-hidden={group === 1 ? 'true' : undefined}
            >
              {collageColumns.map((column, index) => (
                <CollageColumn
                  key={index}
                  column={column}
                  photos={photos}
                  isClone={group === 1}
                  cardProps={cardProps}
                />
              ))}
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

