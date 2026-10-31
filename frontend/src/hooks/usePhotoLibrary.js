import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addPhotoRecord,
  deletePhotoRecord,
  getAllPhotoRecords,
  savePhotoRecord,
} from '../lib/photoStorage'
import { createThumbnail, readImageRatio, validateImageFile } from '../lib/imageFiles'

// The one shared photo collection (kept in IndexedDB, see photoStorage.js).
export function usePhotoLibrary() {
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const recordsRef = useRef(new Map()) // id -> stored record (with the image blob)
  const urlsRef = useRef(new Map()) // id -> object URL used as <img src>

  const makePhoto = useCallback((record) => {
    const oldUrl = urlsRef.current.get(record.id)
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl)
    }
    const oldThumbUrl = urlsRef.current.get(`thumb-${record.id}`)
    if (oldThumbUrl) {
      URL.revokeObjectURL(oldThumbUrl)
    }
    const url = URL.createObjectURL(record.blob)
    // Small copy for cards; older records without one use the original.
    const thumbUrl = record.thumbnail ? URL.createObjectURL(record.thumbnail) : url
    recordsRef.current.set(record.id, record)
    urlsRef.current.set(record.id, url)
    urlsRef.current.set(`thumb-${record.id}`, thumbUrl)
    return {
      id: record.id,
      title: record.name,
      alt: record.alt,
      ratio: record.ratio,
      src: url,
      thumbSrc: thumbUrl,
    }
  }, [])

  useEffect(() => {
    const urls = urlsRef.current
    let isCancelled = false

    // Older records have no thumbnail: create them one by one in the background.
    async function addMissingThumbnails(records) {
      for (const record of records) {
        if (record.thumbnail) {
          continue
        }
        try {
          const updated = { ...record, thumbnail: await createThumbnail(record.blob) }
          await savePhotoRecord(updated)
          if (isCancelled) {
            return
          }
          const photo = makePhoto(updated)
          setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, thumbSrc: photo.thumbSrc } : item)))
        } catch {
          // Keep using the original image for this photo.
        }
      }
    }

    getAllPhotoRecords()
      .then((records) => {
        if (!isCancelled) {
          setPhotos(records.map(makePhoto))
          addMissingThumbnails(records)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError('Local photo storage is not available. Photos cannot be saved.')
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [makePhoto])

  // Checks a file and reads its proportions. Throws an Error with a readable message.
  async function prepareFile(file) {
    const problem = validateImageFile(file)
    if (problem) {
      throw new Error(problem)
    }
    return readImageRatio(file)
  }

  async function saveWithMessage(action) {
    try {
      return await action()
    } catch {
      throw new Error('could not be saved in the browser storage (is it full?).')
    }
  }

  const addFiles = async (files) => {
    const problems = []
    const added = []

    for (const file of files) {
      try {
        const ratio = await prepareFile(file)
        const thumbnail = await createThumbnail(file).catch(() => undefined)
        const record = { name: file.name, alt: '', ratio, blob: file, thumbnail }
        record.id = await saveWithMessage(() => addPhotoRecord(record))
        added.push(makePhoto(record))
      } catch (caught) {
        problems.push(`${file.name} ${caught.message}`)
      }
    }

    if (added.length > 0) {
      setPhotos((current) => [...current, ...added])
    }
    setError(problems.join(' '))
  }

  const replacePhoto = async (id, file) => {
    try {
      const ratio = await prepareFile(file)
      const thumbnail = await createThumbnail(file).catch(() => undefined)
      const record = { ...recordsRef.current.get(id), name: file.name, ratio, blob: file, thumbnail }
      await saveWithMessage(() => savePhotoRecord(record))
      const photo = makePhoto(record)
      setPhotos((current) => current.map((item) => (item.id === id ? photo : item)))
      setError('')
    } catch (caught) {
      setError(`${file.name} ${caught.message}`)
    }
  }

  const deletePhoto = async (id) => {
    try {
      await deletePhotoRecord(id)
      URL.revokeObjectURL(urlsRef.current.get(id))
      URL.revokeObjectURL(urlsRef.current.get(`thumb-${id}`))
      urlsRef.current.delete(id)
      urlsRef.current.delete(`thumb-${id}`)
      recordsRef.current.delete(id)
      setPhotos((current) => current.filter((item) => item.id !== id))
      setError('')
    } catch {
      setError('The photo could not be deleted.')
    }
  }

  const updateAlt = async (id, alt) => {
    const record = { ...recordsRef.current.get(id), alt }
    try {
      await savePhotoRecord(record)
      recordsRef.current.set(id, record)
      setPhotos((current) => current.map((item) => (item.id === id ? { ...item, alt } : item)))
      setError('')
    } catch {
      setError('The description could not be saved.')
    }
  }

  return { photos, isLoading, error, addFiles, replacePhoto, deletePhoto, updateAlt }
}
