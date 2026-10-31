import PhotoCard from '../components/PhotoCard'
import PhotoManager from '../components/PhotoManager'
import { placeholderPhotos } from '../data/placeholderPhotos'

function PortfolioPage({ library }) {
  const hasPhotos = library.photos.length > 0
  const photos = hasPhotos ? library.photos : placeholderPhotos

  return (
	<div className="page-portfolio">
	  <h1 className="page-title">Portfolio</h1>
	  {import.meta.env.DEV && <PhotoManager library={library} />}
	  <div className="masonry">
		{photos.map((photo) => (
		  <PhotoCard key={photo.id} photo={photo} />
		))}
	  </div>
	</div>
  )
}

export default PortfolioPage
