import * as THREE from 'three'

// Defining Constants
const vehicleColors = [0xa52523, 0xbdbdb638, 0x0da2ff, 0xf05e16, 0xff69b4]
const lawnGreen = '#67C240'
const trackColor = '#546E90'
const edgeColor = '#725F48'
const treeCrownColor = 0x498c2c
const treeTrunkColor = 0x4b3f2f
const trackRadius = 100
const trackWidth = 25
const innerTrackRadius = trackRadius - trackWidth
const outerTrackRadius = trackRadius + trackWidth

const treeTrunkGeometry = new THREE.BoxGeometry(15, 15, 30)
const treeTrunkMaterial = new THREE.MeshLambertMaterial({
  color: treeTrunkColor,
})
const treeCrownMaterial = new THREE.MeshLambertMaterial({
  color: treeCrownColor,
})

// Setting up the Scene
const scene = new THREE.Scene()

const playerCar = Car()
playerCar.position.x = -trackRadius
playerCar.position.y = 0
playerCar.rotation.z = Math.PI / 2
scene.add(playerCar)

const truck = Truck()
truck.position.x = -trackRadius
truck.position.y = 60
truck.rotation.z = Math.PI / 3.5
scene.add(truck)

const treesLeft = []
const numberTreesLeft = 300
for (let i = 0; i < numberTreesLeft; i++) {
  treesLeft[i] = Tree()
  treesLeft[i].position.x = getRandomNumber(-1000, -200)
  treesLeft[i].position.y = getRandomNumber(-1000, 1000)
  treesLeft[i].position.z = 0
  scene.add(treesLeft[i])
}

const treesRight = []
const numberTreesRight = 300
for (let i = 0; i < numberTreesRight; i++) {
  treesRight[i] = Tree()
  treesRight[i].position.x = getRandomNumber(1000, 200)
  treesRight[i].position.y = getRandomNumber(-1000, 1000)
  treesRight[i].position.z = 0
  scene.add(treesRight[i])
}

const treesUp = []
const numberTreesUp = 30
for (let i = 0; i < numberTreesUp; i++) {
  treesUp[i] = Tree()
  treesUp[i].position.x = getRandomNumber(-100, 100)
  treesUp[i].position.y = getRandomNumber(150, 1000)
  treesUp[i].position.z = 0
  scene.add(treesUp[i])
}

const treesDown = []
const numberTreesDown = 30
for (let i = 0; i < numberTreesDown; i++) {
  treesDown[i] = Tree()
  treesDown[i].position.x = getRandomNumber(-100, 100)
  treesDown[i].position.y = getRandomNumber(-150, -1000)
  treesDown[i].position.z = 0
  scene.add(treesDown[i])
}

// Set up Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
dirLight.position.set(100, -300, 300)
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
dirLight.shadow.camera.left = -400
dirLight.shadow.camera.right = 350
dirLight.shadow.camera.top = 400
dirLight.shadow.camera.bottom = -300
dirLight.shadow.camera.near = 100
dirLight.shadow.camera.far = 800
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
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.render(scene, camera)

document.body.appendChild(renderer.domElement)

// Random Number Generator
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

// Rendering the Truck
function getTruckFrontTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 32, 32)

  context.fillStyle = '#666666'
  context.fillRect(0, 5, 32, 10)

  return new THREE.CanvasTexture(canvas)
}
function getTruckSideTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 32, 32)

  context.fillStyle = '#666666'
  context.fillRect(17, 5, 15, 10)

  return new THREE.CanvasTexture(canvas)
}
function Truck() {
  const truck = new THREE.Group()
  const color = pickRandom(vehicleColors)

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(100, 25, 5),
    new THREE.MeshLambertMaterial({ color: 0xb4c6fc })
  )
  base.position.z = 10
  truck.add(base)

  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(75, 35, 40),
    new THREE.MeshLambertMaterial({ color: 0xffffff }) // 0xb4c6fc
  )
  cargo.position.x = -15
  cargo.position.z = 30
  cargo.castShadow = true
  cargo.receiveShadow = true
  truck.add(cargo)

  const truckFrontTexture = getTruckFrontTexture()
  truckFrontTexture.center = new THREE.Vector2(0.5, 0.5)
  truckFrontTexture.rotation = Math.PI / 2

  const truckLeftTexture = getTruckSideTexture()
  truckLeftTexture.flipY = false

  const truckRightTexture = getTruckSideTexture()

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(25, 30, 30), [
    new THREE.MeshLambertMaterial({ color, map: truckFrontTexture }),
    new THREE.MeshLambertMaterial({ color }), // back
    new THREE.MeshLambertMaterial({ color, map: truckLeftTexture }),
    new THREE.MeshLambertMaterial({ color, map: truckRightTexture }),
    new THREE.MeshLambertMaterial({ color }), // top
    new THREE.MeshLambertMaterial({ color }), // bottom
  ])
  cabin.position.x = 40
  cabin.position.z = 20
  cabin.castShadow = true
  cabin.receiveShadow = true
  truck.add(cabin)

  const backWheel = Wheel()
  backWheel.position.x = -30
  truck.add(backWheel)

  const middleWheel = Wheel()
  middleWheel.position.x = 10
  truck.add(middleWheel)

  const frontWheel = Wheel()
  frontWheel.position.x = 38
  truck.add(frontWheel)

  truck.scale.set(0.5, 0.5, 0.5)

  return truck
}

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

// Rendering the Trees
function Tree() {
  const tree = new THREE.Group()

  const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial)
  trunk.position.z = 10
  trunk.castShadow = true
  trunk.receiveShadow = true
  trunk.matrixAutoUpdate = false
  tree.add(trunk)

  const treeHeights = [45, 60, 75]
  const height = pickRandom(treeHeights)

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(height / 2, 30, 30),
    treeCrownMaterial
  )
  crown.position.z = height / 2 + 30
  crown.castShadow = true
  crown.receiveShadow = false
  tree.add(crown)

  return tree
}

// Default Handlers
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
