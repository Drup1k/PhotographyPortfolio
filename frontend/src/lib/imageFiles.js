const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_FILE_SIZE = 15 * 1024 * 1024

// Returns an error message, or null when the file is acceptable.
export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'is not a supported image (use JPEG, PNG, WebP or AVIF).'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'is larger than 15 MB.'
  }
  return null
}

// Reads the natural width / height of an image file.
export function readImageRatio(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        resolve(image.naturalWidth / image.naturalHeight)
      } else {
        reject(new Error('has no readable size.'))
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('could not be read as an image.'))
    }
    image.src = url
  })
}

// Makes a small copy (max 800 px wide) of an image file for cards. Resolves with a WebP blob.
const THUMBNAIL_WIDTH = 800

export async function createThumbnail(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, THUMBNAIL_WIDTH / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('no thumbnail'))), 'image/webp', 0.8)
  })
}
