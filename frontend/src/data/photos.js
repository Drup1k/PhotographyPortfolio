// All photos of the website live in this list.
//
// Right now every photo is a placeholder (src is null).
// To use a real photograph later:
//   1. Put the image file in src/assets/photos/
//   2. Import it at the top of this file (import photo01 from '../assets/photos/photo-01.jpg')
//   3. Set src: photo01 and write a useful alt text that describes the photo.
//
// shape is one of: 'tall', 'portrait', 'square', 'landscape', 'wide'. It sets the proportions
// (width divided by height) of the photo, see shapeRatios below.
// tone is only used for the colour of a placeholder (1 to 6).
export const shapeRatios = {
  tall: 0.6,
  portrait: 0.75,
  square: 1,
  landscape: 1.5,
  wide: 2,
}

export const photos = [
  { id: 1, title: 'Photo placeholder 01', shape: 'portrait', tone: 1, src: null, alt: '' },
  { id: 2, title: 'Photo placeholder 02', shape: 'landscape', tone: 2, src: null, alt: '' },
  { id: 3, title: 'Photo placeholder 03', shape: 'square', tone: 3, src: null, alt: '' },
  { id: 4, title: 'Photo placeholder 04', shape: 'tall', tone: 4, src: null, alt: '' },
  { id: 5, title: 'Photo placeholder 05', shape: 'square', tone: 5, src: null, alt: '' },
  { id: 6, title: 'Photo placeholder 06', shape: 'portrait', tone: 6, src: null, alt: '' },
  { id: 7, title: 'Photo placeholder 07', shape: 'landscape', tone: 3, src: null, alt: '' },
  { id: 8, title: 'Photo placeholder 08', shape: 'wide', tone: 1, src: null, alt: '' },
  { id: 9, title: 'Photo placeholder 09', shape: 'landscape', tone: 4, src: null, alt: '' },
  { id: 10, title: 'Photo placeholder 10', shape: 'square', tone: 6, src: null, alt: '' },
  { id: 11, title: 'Photo placeholder 11', shape: 'portrait', tone: 2, src: null, alt: '' },
  { id: 12, title: 'Photo placeholder 12', shape: 'square', tone: 5, src: null, alt: '' },
  { id: 13, title: 'Photo placeholder 13', shape: 'tall', tone: 2, src: null, alt: '' },
  { id: 14, title: 'Photo placeholder 14', shape: 'landscape', tone: 5, src: null, alt: '' },
  { id: 15, title: 'Photo placeholder 15', shape: 'square', tone: 1, src: null, alt: '' },
  { id: 16, title: 'Photo placeholder 16', shape: 'portrait', tone: 3, src: null, alt: '' },
  { id: 17, title: 'Photo placeholder 17', shape: 'wide', tone: 6, src: null, alt: '' },
  { id: 18, title: 'Photo placeholder 18', shape: 'portrait', tone: 4, src: null, alt: '' },
  { id: 19, title: 'Photo placeholder 19', shape: 'square', tone: 2, src: null, alt: '' },
  { id: 20, title: 'Photo placeholder 20', shape: 'landscape', tone: 3, src: null, alt: '' },
  { id: 21, title: 'Photo placeholder 21', shape: 'square', tone: 5, src: null, alt: '' },
  { id: 22, title: 'Photo placeholder 22', shape: 'tall', tone: 1, src: null, alt: '' },
  { id: 23, title: 'Photo placeholder 23', shape: 'wide', tone: 4, src: null, alt: '' },
  { id: 24, title: 'Photo placeholder 24', shape: 'portrait', tone: 6, src: null, alt: '' },
]
