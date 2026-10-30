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
  { ids: [2, 3], fill: 1, align: 'center' },
  { ids: [1, 5, 10], fill: 1, align: 'center' },
  { ids: [8, 9], fill: 1, align: 'center' },
  { ids: [6], fill: 1, align: 'center' },
  { ids: [7, 11], fill: 1, align: 'center' },
  { ids: [12, 15, 19], fill: 1, align: 'center' },
  { ids: [13], fill: 1, align: 'center' },
  { ids: [14, 16], fill: 1, align: 'center' },
  { ids: [17, 18], fill: 1, align: 'center' },
  { ids: [20, 21, 24], fill: 1, align: 'center' },
  { ids: [22, 23], fill: 1, align: 'center' },
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
  const { viewportRef, trackRef, groupRef, setPauseReason, setDirectionAndNudge, revealElement } =
    useGalleryMotion()
  const [openPhoto, setOpenPhoto] = useState(null)

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

  // The track holds two identical groups. It moves one group to the left and then
  // starts again at the beginning. The second group looks exactly like the first,
  // so the restart is not visible: no jump and no empty gap.
  // Only the first group is real content; the copy is hidden from screen readers
  // and from the keyboard.
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

