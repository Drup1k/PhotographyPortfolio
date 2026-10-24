import MovingGallery from '../components/MovingGallery'
import { photos } from '../data/photos'

function HomePage() {
  return (
    <>
      <h1 className="visually-hidden">Angelique Vi. Photography Portfolio</h1>
      <MovingGallery photos={photos} />
    </>
  )
}

export default HomePage
