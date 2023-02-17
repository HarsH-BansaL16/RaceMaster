import * as THREE from 'three'

// Defining Constants
const vehicleColors = [0xa52523, 0xbdbdb638, 0x0da2ff, 0xf05e16, 0xff69b4]
const trackRadius = 100
const trackWidth = 25
const innerTrackRadius = trackRadius - trackWidth
const outerTrackRadius = trackRadius + trackWidth

// Setting up the Scene
const scene = new THREE.Scene()

const playerCar = Car()
playerCar.position.x = -trackRadius
playerCar.position.y = 0
playerCar.rotation.z = Math.PI / 2
scene.add(playerCar)

// Set up Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
dirLight.position.set(100, -300, 400)
scene.add(dirLight)

// Set up Camera
const aspectRatio = window.innerWidth / window.innerHeight
const cameraWidth = 960
const cameraHeight = cameraWidth / aspectRatio

const camera = new THREE.OrthographicCamera(
  cameraWidth / -2,
  cameraWidth / 2,
  cameraHeight / 2,
  cameraHeight / -2,
  0,
  1000
)

camera.position.set(0, -210, 300)
camera.lookAt(0, 0, 0)

renderMap(cameraWidth, cameraHeight * 2)

// Set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

document.body.appendChild(renderer.domElement)

// Rendering the Car
function Car() {
  const car = new THREE.Group()

  const backWheel = Wheel()
  backWheel.position.x = -18
  car.add(backWheel)

  const frontWheel = Wheel()
  frontWheel.position.x = 18
  car.add(frontWheel)

  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color: pickRandom(vehicleColors) })
  )
  main.position.z = 12
  car.add(main)

  const carFrontTexture = getCarFrontTexture()
  carFrontTexture.center = new THREE.Vector2(0.5, 0.5)
  carFrontTexture.rotation = -Math.PI / 2

  const carBackTexture = getCarFrontTexture()
  carBackTexture.center = new THREE.Vector2(0.5, 0.5)
  carBackTexture.rotation = -Math.PI / 2

  const carRightSideTexture = getCarSideTexture()

  const carLeftSideTexture = getCarSideTexture()
  carLeftSideTexture.flipY = false

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(33, 24, 12), [
    new THREE.MeshLambertMaterial({ map: carFrontTexture }),
    new THREE.MeshLambertMaterial({ map: carBackTexture }),
    new THREE.MeshLambertMaterial({ map: carRightSideTexture }),
    new THREE.MeshLambertMaterial({ map: carLeftSideTexture }),
    new THREE.MeshLambertMaterial({ color: 0xaffffff }),
    new THREE.MeshLambertMaterial({ color: 0xaffffff }),
  ])
  cabin.position.x = -6
  cabin.position.z = 25.5
  car.add(cabin)

  car.scale.set(0.3, 0.3, 0.3)

  return car
}

function Wheel() {
  const wheel = new THREE.Mesh(
    new THREE.BoxGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  )
  wheel.position.z = 6
  return wheel
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getCarFrontTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 32
  const context = canvas.getContext('2d')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 64, 32)

  context.fillStyle = '#666666'
  context.fillRect(8, 8, 48, 24)

  return new THREE.CanvasTexture(canvas)
}

function getCarSideTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 32
  const context = canvas.getContext('2d')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 128, 32)

  context.fillStyle = '#666666'
  context.fillRect(10, 8, 38, 24)
  context.fillRect(58, 8, 60, 24)

  return new THREE.CanvasTexture(canvas)
}

// Rendering the Track
function renderMap(mapWidth, mapHeight) {
  // Plane with Line Markings
  const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight)

  const planeGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight)
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0x546e90,
    map: lineMarkingsTexture,
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  scene.add(plane)

  // Extruded Geometry
  const middleIsland = getMiddleIsland()
  const outerField = getOuterField(mapWidth, mapHeight)

  const fieldGeometry = new THREE.ExtrudeGeometry([middleIsland, outerField], {
    depth: 6,
    bevelEnabled: false,
  })

  const fieldMesh = new THREE.Mesh(fieldGeometry, [
    new THREE.MeshLambertMaterial({ color: 0x67c240 }),
    new THREE.MeshLambertMaterial({ color: 0x23311c }),
  ])

  scene.add(fieldMesh)
}

function getLineMarkings(mapWidth, mapHeight) {
  const canvas = document.createElement('canvas')
  canvas.width = mapWidth
  canvas.height = mapHeight
  const context = canvas.getContext('2d')

  context.fillStyle = '#546E90'
  context.fillRect(0, 0, mapWidth, mapHeight)

  context.lineWidth = 2
  context.strokeStyle = '#E0FFFF'
  context.setLineDash([10, 14])

  context.beginPath()
  context.arc(mapWidth / 2, mapHeight / 2, trackRadius, 0, Math.PI * 2)
  context.stroke()

  return new THREE.CanvasTexture(canvas)
}

function getMiddleIsland() {
  const islandMiddle = new THREE.Shape()

  islandMiddle.absarc(0, 0, innerTrackRadius, 0, Math.PI, true)
  islandMiddle.absarc(0, 0, innerTrackRadius, Math.PI, Math.PI * 2, true)

  return islandMiddle
}

function getOuterField(mapWidth, mapHeight) {
  const field = new THREE.Shape()

  field.moveTo(-mapWidth / 2, -mapHeight / 2)

  field.lineTo(0, -mapHeight / 2)
  field.lineTo(0, -trackRadius)
  field.absarc(0, 0, outerTrackRadius, 0, Math.PI * 2, true)
  field.lineTo(0, -mapHeight / 2)
  field.lineTo(mapWidth / 2, -mapHeight / 2)
  field.lineTo(mapWidth / 2, mapHeight / 2)
  field.lineTo(-mapWidth / 2, mapHeight / 2)
  field.lineTo(-mapWidth / 2, -mapHeight / 2)

  return field
}

window.addEventListener('resize', () => {
  console.log('resize', window.innerWidth, window.innerHeight)

  // Adjust camera
  const newAspectRatio = window.innerWidth / window.innerHeight
  const adjustedCameraHeight = cameraWidth / newAspectRatio

  camera.top = adjustedCameraHeight / 2
  camera.bottom = adjustedCameraHeight / -2
  camera.updateProjectionMatrix() // Must be called after change

  // Reset renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.render(scene, camera)
})
