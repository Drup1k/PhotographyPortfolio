import MovingGallery from '../components/MovingGallery'
import { placeholderPhotos } from '../data/placeholderPhotos'

function HomePage({ library }) {
  const photos = library.photos.length > 0 ? library.photos : placeholderPhotos

  return (
	<>
	  <h1 className="visually-hidden">Angelique Vi. Photography Portfolio</h1>
	  <MovingGallery photos={photos} />
	</>
  )
}

export default HomePage
