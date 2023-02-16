import * as THREE from 'three'

const vehicleColors = [0xa52523, 0xbdbdb638, 0x78b14b, 0x0da2ff, 0xf05e16]

const scene = new THREE.Scene()

const playerCar = Car()
scene.add(playerCar)

// Set up Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
dirLight.position.set(100, -300, 400)
scene.add(dirLight)

// Set up Camera
const aspectRatio = window.innerWidth / window.innerHeight
const cameraWidth = 150
const cameraHeight = cameraWidth / aspectRatio

const camera = new THREE.OrthographicCamera(
  cameraWidth / -2,
  cameraWidth / 2,
  cameraHeight / 2,
  cameraHeight / -2,
  0,
  1000
)

camera.position.set(200, -200, 300)
camera.up.set(0, 0, 1)
camera.lookAt(0, 0, 0)

// Set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

document.body.appendChild(renderer.domElement)

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
