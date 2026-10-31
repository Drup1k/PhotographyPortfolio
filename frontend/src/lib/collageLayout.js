const MIN_CARD_RATIO = 0.5
const MAX_CARD_RATIO = 2.5
const TARGET_COLUMN_RATIO = 0.75 // a column stops growing once it is about this wide / high
const MAX_PHOTOS_PER_COLUMN = 3
const MIN_GROUP_WIDTH = 5 // group width in gallery heights, so a short list still fills the screen

// Extreme proportions get limited, so very thin photos do not break the layout.
export function getCardRatio(photo) {
  return Math.min(Math.max(photo.ratio, MIN_CARD_RATIO), MAX_CARD_RATIO)
}

// Groups photos (in order) into columns of 1-3 photos and tells how often the list
// must repeat to be wide enough. Every column fills the full gallery height.
export function buildCollage(photos) {
  const columns = []
  let current = []
  let inverseSum = 0

  for (const photo of photos) {
    current.push(photo)
    inverseSum += 1 / getCardRatio(photo)
    if (1 / inverseSum <= TARGET_COLUMN_RATIO || current.length === MAX_PHOTOS_PER_COLUMN) {
      columns.push({ photos: current, inverseSum })
      current = []
      inverseSum = 0
    }
  }
  if (current.length > 0) {
    columns.push({ photos: current, inverseSum })
  }

  const totalWidth = columns.reduce((sum, column) => sum + 1 / column.inverseSum, 0)
  const repeats = totalWidth > 0 ? Math.max(1, Math.ceil(MIN_GROUP_WIDTH / totalWidth)) : 1
  return { columns, repeats }
}
