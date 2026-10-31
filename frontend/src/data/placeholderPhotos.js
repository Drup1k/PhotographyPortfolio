// Demo photos, only shown while the collection has no real photos.
// Real photos come from the browser storage (see hooks/usePhotoLibrary.js).
// ratio is width divided by height; tone (1 to 6) is the colour of the placeholder.
const placeholderRatios = [0.75, 1.5, 1, 0.6, 1, 0.75, 1.5, 2, 1.5, 1, 0.75, 1]

export const placeholderPhotos = placeholderRatios.map((ratio, index) => ({
  id: `placeholder-${index + 1}`,
  title: `Photo placeholder ${String(index + 1).padStart(2, '0')}`,
  ratio,
  tone: (index % 6) + 1,
  src: null,
  alt: '',
}))
