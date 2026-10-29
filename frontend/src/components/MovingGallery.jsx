import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import PhotoCard from './PhotoCard'
import PhotoViewer from './PhotoViewer'

const SPHERE_RADIUS = 8.4
const DEFAULT_BRIGHTNESS = 0.94
const GAP_ANGLE = 0.018
const ROW_WEIGHTS = [0.8, 1.3, 0.9, 1.2, 1.0, 1.25, 0.85, 1.1]
const COLUMN_ASPECTS = [0.7, 1.6, 1, 1.3, 0.85, 1.9, 1.1, 0.75]
const AUTO_ROTATION = 0.0006
const DRAG_SPEED = 0.006
const CLICK_DISTANCE = 8

const toneGradients = {
  1: ['#2c4a52', '#14242a'],
  2: ['#5a3a52', '#241a2a'],
  3: ['#4a4f66', '#1a1d2b'],
  4: ['#6a4a38', '#2a1c14'],
  5: ['#3d5a45', '#17241b'],
  6: ['#55555a', '#212123'],
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

function createPlaceholderTexture(photo) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  const [start, end] = toneGradients[photo.tone] || toneGradients[1]

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, start)
  gradient.addColorStop(1, end)
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = 'rgba(255, 255, 255, 0.78)'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '600 30px Arial, sans-serif'
  context.fillText(photo.title, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

// Crops the texture coordinates of a patch so the photo fills it without stretching.
function cropUvToCover(geometry, texture, patchAspect) {
  const image = texture.image
  const imageAspect = image.width / image.height
  let scaleU = 1
  let scaleV = 1

  if (imageAspect > patchAspect) {
    scaleU = patchAspect / imageAspect
  } else {
    scaleV = imageAspect / patchAspect
  }

  const uv = geometry.attributes.uv
  for (let index = 0; index < uv.count; index++) {
    uv.setXY(
      index,
      (1 - scaleU) / 2 + uv.getX(index) * scaleU,
      (1 - scaleV) / 2 + uv.getY(index) * scaleV,
    )
  }
  uv.needsUpdate = true
}

function MovingGallery({ photos }) {
  const globeRef = useRef(null)
  const viewerOpenRef = useRef(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [canUseWebGL] = useState(() => supportsWebGL())
  const [openPhoto, setOpenPhoto] = useState(null)

  function handleOpen(photo) {
    setOpenPhoto(photo)
  }

  function handleClose() {
    setOpenPhoto(null)
  }

  function handleStep(step) {
    const index = photos.findIndex((photo) => photo.id === openPhoto.id)
    setOpenPhoto(photos[(index + step + photos.length) % photos.length])
  }

  useEffect(() => {
    viewerOpenRef.current = openPhoto !== null
  }, [openPhoto])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setIsReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!canUseWebGL || !globeRef.current) {
      return undefined
    }

    const container = globeRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 25)

    const globeRoot = new THREE.Group()
    globeRoot.rotation.set(0.15, 0.35, 0)
    scene.add(globeRoot)

    scene.add(new THREE.AmbientLight(0xffffff, 0.92))
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.78)
    keyLight.position.set(8, 6, 10)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xb9c2d7, 0.3)
    fillLight.position.set(-9, -2, -4)
    scene.add(fillLight)

    const textures = []
    const tileMeshes = []
    const tileGeometries = []
    const loader = new THREE.TextureLoader()

    const velocity = { x: 0, y: 0 }
    const pointer = new THREE.Vector2(2, 2)
    const raycaster = new THREE.Raycaster()
    const drag = { active: false, moved: false, x: 0, y: 0, clickX: 0, clickY: 0 }
    let hoveredMesh = null
    let isDestroyed = false
    let frameId = null

    function setHovered(mesh) {
      if (hoveredMesh === mesh) {
        return
      }
      if (hoveredMesh) {
        hoveredMesh.material.color.setScalar(DEFAULT_BRIGHTNESS)
      }
      hoveredMesh = mesh
      if (hoveredMesh) {
        hoveredMesh.material.color.setScalar(1)
      }
    }

    function resize() {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) {
        return
      }
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    function pointerToNdc(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    function getIntersectedMesh() {
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(tileMeshes, false)
      return hits.length > 0 ? hits[0].object : null
    }

    function onPointerDown(event) {
      drag.active = true
      drag.moved = false
      drag.x = event.clientX
      drag.y = event.clientY
      drag.clickX = event.clientX
      drag.clickY = event.clientY
      renderer.domElement.setPointerCapture?.(event.pointerId)
    }

    function onPointerMove(event) {
      pointerToNdc(event.clientX, event.clientY)

      if (drag.active) {
        const deltaX = event.clientX - drag.x
        const deltaY = event.clientY - drag.y
        drag.x = event.clientX
        drag.y = event.clientY

        if (Math.hypot(event.clientX - drag.clickX, event.clientY - drag.clickY) > CLICK_DISTANCE) {
          drag.moved = true
        }

        globeRoot.rotation.y += deltaX * DRAG_SPEED
        globeRoot.rotation.x += deltaY * DRAG_SPEED * 0.7
        globeRoot.rotation.x = Math.max(-1.05, Math.min(1.05, globeRoot.rotation.x))

        velocity.x = deltaY * 0.00055
        velocity.y = deltaX * 0.00075
      } else {
        setHovered(getIntersectedMesh())
      }
    }

    function onPointerUp(event) {
      pointerToNdc(event.clientX, event.clientY)
      const wasDrag = drag.moved
      drag.active = false
      renderer.domElement.releasePointerCapture?.(event.pointerId)

      if (!wasDrag) {
        const intersected = getIntersectedMesh()
        if (intersected?.userData?.photo) {
          handleOpen(intersected.userData.photo)
        }
      }
    }

    function onPointerLeave() {
      drag.active = false
      setHovered(null)
    }

    async function loadTextures() {
      const loaded = []
      for (let index = 0; index < photos.length; index++) {
        const photo = photos[index]
        let texture

        if (photo.src) {
          try {
            texture = await loader.loadAsync(photo.src)
            texture.colorSpace = THREE.SRGBColorSpace
            texture.anisotropy = 4
          } catch {
            texture = createPlaceholderTexture(photo)
          }
        } else {
          texture = createPlaceholderTexture(photo)
        }

        if (isDestroyed) {
          texture.dispose()
          return
        }

        textures.push(texture)
        loaded.push(texture)
      }

      buildTiles(loaded)
    }

    function buildTiles(loaded) {
      const weightSum = ROW_WEIGHTS.reduce((sum, weight) => sum + weight, 0)
      let thetaCursor = 0
      let photoIndex = 0

      for (let row = 0; row < ROW_WEIGHTS.length; row++) {
        const rowAngle = (ROW_WEIGHTS[row] / weightSum) * Math.PI
        const centerTheta = thetaCursor + rowAngle / 2
        const thetaStart = thetaCursor + GAP_ANGLE / 2
        const thetaLength = rowAngle - GAP_ANGLE
        thetaCursor += rowAngle

        const circumference = 2 * Math.PI * Math.sin(centerTheta)
        const columns = Math.max(3, Math.round(circumference / (rowAngle * 1.15)))
        const aspects = []
        for (let column = 0; column < columns; column++) {
          aspects.push(COLUMN_ASPECTS[(row * 3 + column) % COLUMN_ASPECTS.length])
        }
        const aspectSum = aspects.reduce((sum, aspect) => sum + aspect, 0)
        const gapPhi = GAP_ANGLE / Math.max(Math.sin(centerTheta), 0.3)
        let phiCursor = row * 1.9

        for (let column = 0; column < columns; column++) {
          const phiSpan = (aspects[column] / aspectSum) * 2 * Math.PI
          const photoNumber = (photoIndex * 7) % photos.length
          const photo = photos[photoNumber]
          const texture = loaded[photoNumber]
          photoIndex++

          const geometry = new THREE.SphereGeometry(
            SPHERE_RADIUS,
            12,
            8,
            phiCursor + gapPhi / 2,
            phiSpan - gapPhi,
            thetaStart,
            thetaLength,
          )
          phiCursor += phiSpan
          cropUvToCover(geometry, texture, (phiSpan * Math.sin(centerTheta)) / rowAngle)
          tileGeometries.push(geometry)

          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.FrontSide,
            color: new THREE.Color(DEFAULT_BRIGHTNESS, DEFAULT_BRIGHTNESS, DEFAULT_BRIGHTNESS),
          })

          const mesh = new THREE.Mesh(geometry, material)
          mesh.userData.photo = photo
          globeRoot.add(mesh)
          tileMeshes.push(mesh)
        }
      }

      animate()
    }

    function animate() {
      if (isDestroyed) {
        return
      }

      if (!drag.active) {
        if (!isReducedMotion && !viewerOpenRef.current) {
          globeRoot.rotation.y += AUTO_ROTATION
        }

        globeRoot.rotation.x += velocity.x
        globeRoot.rotation.y += velocity.y
        globeRoot.rotation.x = Math.max(-1.05, Math.min(1.05, globeRoot.rotation.x))
        velocity.x *= 0.93
        velocity.y *= 0.93
      }

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointerleave', onPointerLeave)
    loadTextures()

    return () => {
      isDestroyed = true
      window.removeEventListener('resize', resize)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }

      tileMeshes.forEach((mesh) => {
        mesh.material.dispose()
      })
      tileGeometries.forEach((geometry) => geometry.dispose())
      textures.forEach((texture) => texture.dispose())

      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [photos, canUseWebGL, isReducedMotion])

  const useFallback = !canUseWebGL || isReducedMotion

  return (
    <section className="moving-gallery globe-gallery" aria-label="Photo globe gallery">
      <div className="gallery-viewport globe-viewport">
        {useFallback ? (
          <div className="globe-fallback" role="list" aria-label="Photo globe fallback">
            {photos.map((photo) => (
              <div key={photo.id} className="globe-fallback-item" role="listitem">
                <PhotoCard photo={photo} isInteractive onOpen={handleOpen} />
              </div>
            ))}
          </div>
        ) : (
          <div ref={globeRef} className="globe-canvas" aria-label="Interactive 3D photo globe" />
        )}
      </div>

      {openPhoto && (
        <PhotoViewer
          photo={openPhoto}
          onClose={handleClose}
          onPrevious={() => handleStep(-1)}
          onNext={() => handleStep(1)}
        />
      )}
    </section>
  )
}

export default MovingGallery
