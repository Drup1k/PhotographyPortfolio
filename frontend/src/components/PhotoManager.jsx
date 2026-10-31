import { useRef } from 'react'

// Local-only editing tools: add, describe, replace and delete photos.
// Shown only in development mode. This is NOT admin security; real accounts come with the backend phase.
function PhotoManager({ library }) {
  const addInputRef = useRef(null)
  const replaceInputRef = useRef(null)
  const replaceIdRef = useRef(null)
  const { photos, error, addFiles, replacePhoto, deletePhoto, updateAlt } = library

  async function handleAdd(event) {
    const files = Array.from(event.target.files)
    event.target.value = ''
    await addFiles(files)
  }

  function handleReplaceClick(id) {
    replaceIdRef.current = id
    replaceInputRef.current.click()
  }

  async function handleReplace(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) {
      await replacePhoto(replaceIdRef.current, file)
    }
  }

  function handleDelete(photo) {
    if (window.confirm(`Delete ${photo.title}?`)) {
      deletePhoto(photo.id)
    }
  }

  return (
    <section className="photo-manager" aria-label="Local photo tools">
      <h2>Local photo tools (development only)</h2>
      <p className="photo-manager-note">
        Photos are stored only in this browser (IndexedDB). They are not saved on GitHub or a
        server, are not synced and are not backed up.
      </p>

      <input
        ref={addInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={handleAdd}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={handleReplace}
      />
      <button type="button" className="photo-manager-button" onClick={() => addInputRef.current.click()}>
        Add photos
      </button>

      {error && (
        <p className="photo-manager-error" role="alert">
          {error}
        </p>
      )}

      <ul className="photo-manager-list">
        {photos.map((photo) => (
          <li key={photo.id} className="photo-manager-item">
            <img src={photo.src} alt="" />
            <div className="photo-manager-fields">
              <label>
                Description (alt text)
                <input
                  type="text"
                  defaultValue={photo.alt}
                  maxLength={200}
                  onBlur={(event) => {
                    if (event.target.value !== photo.alt) {
                      updateAlt(photo.id, event.target.value)
                    }
                  }}
                />
              </label>
              <div>
                <button type="button" className="photo-manager-button" onClick={() => handleReplaceClick(photo.id)}>
                  Replace
                </button>
                <button type="button" className="photo-manager-button" onClick={() => handleDelete(photo)}>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PhotoManager
