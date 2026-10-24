import PhotoCard from '../components/PhotoCard'
import { photos } from '../data/photos'

function PortfolioPage() {
  return (
    <div className="page-portfolio">
      <h1 className="page-title">Portfolio</h1>
      <div className="masonry">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
    </div>
  )
}

export default PortfolioPage
