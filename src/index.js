import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// Defining Constants
const vehicleColors = [0xa52523, 0xbdbdb638, 0x0da2ff, 0xf05e16, 0xff69b4]
const treeCrownColor = 0x498c2c
const treeTrunkColor = 0x4b3f2f
const trackRadius = 120
const trackWidth = 50
const innerTrackRadius = trackRadius - trackWidth
const outerTrackRadius = trackRadius + trackWidth
let ready
const playerAngleInitial = Math.PI
let playerAngleMoved
let playerCarRadius = trackRadius
let playerCarBB
const speed = 0.0005
let score
let countOtherVehicles = 0
let otherVehicles = []
let otherVehiclesBB = []
let lastTimeStamp
let accelerate = false
let decelerate = false
let cameraType = 0
let playerVehicleType = 'car'

const treeTrunkGeometry = new THREE.BoxGeometry(15, 15, 75)
const treeTrunkMaterial = new THREE.MeshLambertMaterial({
  color: treeTrunkColor,
})
const treeCrownMaterial = new THREE.MeshLambertMaterial({
  color: treeCrownColor,
})

// Setting up the Scene
const scene = new THREE.Scene()

const playerCar = playerVehicleType == 'car' ? Car() : Truck()
playerCar.position.x = -trackRadius
playerCar.position.y = 0
playerCar.rotation.z = Math.PI / 2
scene.add(playerCar)

const treesLeft = []
const numberTreesLeft = 100
for (let i = 0; i < numberTreesLeft; i++) {
  treesLeft[i] = Tree()
  treesLeft[i].position.x = getRandomNumber(-500, -200)
  treesLeft[i].position.y = getRandomNumber(-500, 500)
  treesLeft[i].position.z = 0
  scene.add(treesLeft[i])
}

const treesRight = []
const numberTreesRight = 100
for (let i = 0; i < numberTreesRight; i++) {
  treesRight[i] = Tree()
  treesRight[i].position.x = getRandomNumber(500, 200)
  treesRight[i].position.y = getRandomNumber(-500, 500)
  treesRight[i].position.z = 0
  scene.add(treesRight[i])
}

const treesUp = []
const numberTreesUp = 30
for (let i = 0; i < numberTreesUp; i++) {
  treesUp[i] = Tree()
  treesUp[i].position.x = getRandomNumber(-100, 100)
  treesUp[i].position.y = getRandomNumber(180, 500)
  treesUp[i].position.z = 0
  scene.add(treesUp[i])
}

const treesDown = []
const numberTreesDown = 30
for (let i = 0; i < numberTreesDown; i++) {
  treesDown[i] = Tree()
  treesDown[i].position.x = getRandomNumber(-100, 100)
  treesDown[i].position.y = getRandomNumber(-180, -500)
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

const miniMapCamera = new THREE.OrthographicCamera(
  -180,
  180,
  180,
  -180,
  0,
  1000
)

miniMapCamera.position.set(0, 0, 300)
miniMapCamera.lookAt(0, 0, 0)

renderMap(cameraWidth, cameraHeight * 2)

const POVCamera = new THREE.PerspectiveCamera(110, aspectRatio, 0.1, 1000)
POVCamera.up.set(0, 0, 1)

const carReverseCamera = new THREE.PerspectiveCamera(
  110,
  aspectRatio,
  0.1,
  1000
)
carReverseCamera.up.set(0, 0, 1)

const carCamera = new THREE.PerspectiveCamera(110, aspectRatio, 0.1, 1000)
carCamera.up.set(0, 0, 1)

// Set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

reset()

// MiniMap Renderer
const miniMapRenderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
})

miniMapRenderer.setSize(window.innerWidth / 4, window.innerHeight / 4)
miniMapRenderer.shadowMap.enabled = true
miniMapRenderer.domElement.style.position = 'absolute'
miniMapRenderer.domElement.style.bottom = 0
miniMapRenderer.domElement.style.border = '5px solid white'
miniMapRenderer.domElement.style.borderRadius = '100%'
document.body.appendChild(miniMapRenderer.domElement)

// Reverse Camera Renderer
const reverseCameraRenderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
})

reverseCameraRenderer.setSize(window.innerWidth / 3, window.innerHeight / 6)
reverseCameraRenderer.shadowMap.enabled = true
reverseCameraRenderer.domElement.style.position = 'absolute'
reverseCameraRenderer.domElement.style.top = 0
reverseCameraRenderer.domElement.style.left = '33%'
reverseCameraRenderer.domElement.style.border = '5px solid white'
document.body.appendChild(reverseCameraRenderer.domElement)

// Loading the 3D Human
const loader = new GLTFLoader()
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(1)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(2)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(3)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(4)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(5)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(6)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(7)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(8)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(9)
  human.translateX(185)
  scene.add(gltf.scene)
})
loader.load('human.glb', function (gltf) {
  let human = gltf.scene.children[0]
  human.scale.set(0.15, 0.15, 0.15)
  human.rotateX(Math.PI / 2)
  human.rotateZ(10)
  human.translateX(185)
  scene.add(gltf.scene)
})

// Loading  the Feul Can
// loader.load('fuel.glb', function (gltf) {
//   let feul = gltf.scene.children[0]
//   feul.scale.set(0.15, 0.15, 0.15)
//   feul.rotateX(Math.PI / 2)
//   feul.rotateZ(10)
//   feul.translateX(185)
//   scene.add(gltf.scene)
// })

// Animating the Game Logic
function reset() {
  // Reset Position and Score
  playerAngleMoved = 0
  movePlayerCar(0)
  score = 0
  lastTimeStamp = undefined

  // Remove Other Vehicles
  otherVehicles.forEach((vehicle) => {
    scene.remove(vehicle.mesh)
  })
  otherVehicles = []
  otherVehiclesBB = []

  renderer.render(scene, selectCamera(cameraType))
  ready = true
}
function startGame() {
  if (ready) {
    ready = false
    renderer.setAnimationLoop(animation)
  }
}
window.addEventListener('keydown', function (event) {
  if (event.key == 'ArrowUp') {
    startGame()
    accelerate = true
    return
  }

  if (event.key == 'ArrowDown') {
    decelerate = true
    return
  }

  if (event.key == 'ArrowLeft') {
    playerCarRadius += 3
    playerCarRadius = Math.min(playerCarRadius, outerTrackRadius - 5)
    return
  }

  if (event.key == 'ArrowRight') {
    playerCarRadius -= 3
    playerCarRadius = Math.max(playerCarRadius, innerTrackRadius + 5)
    return
  }

  if (event.key == '1') {
    // Top View
    cameraType = 1
  }

  if (event.key == '2') {
    // Pov Camera
    cameraType = 2
  }

  if (event.key == '3') {
    // Pov Camera
    cameraType = 3
  }

  if (event.key == 'T' || event.key == 't') {
    playerVehicleType = 'truck'
  }

  if (event.key == 'C' || event.key == 'c') {
    playerVehicleType = 'car'
  }

  if (event.key == 'R' || event.key == 'r') {
    reset()
    return
  }
})
window.addEventListener('keyup', function (event) {
  if (event.key == 'ArrowUp') {
    accelerate = false
    return
  }

  if (event.key == 'ArrowDown') {
    decelerate = false
    return
  }
})
function animation(timestamp) {
  if (!lastTimeStamp) {
    lastTimeStamp = timestamp
    return
  }

  const timeDelta = timestamp - lastTimeStamp

  movePlayerCar(timeDelta)
  playerCarBB = new THREE.Box3().setFromObject(playerCar)

  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2))

  if (laps != score) {
    score = laps
  }

  // Add a New Element Every 3nd Lap
  if (otherVehicles.length < (laps + 1) / 3) {
    addVehicle()
  }

  moveOtherVehicles(timeDelta)
  collisionDetection()

  renderer.render(scene, selectCamera(cameraType))
  miniMapRenderer.render(scene, miniMapCamera)
  reverseCameraRenderer.render(scene, carReverseCamera)
  lastTimeStamp = timestamp
}
function collisionDetection() {
  for (let i = 0; i < countOtherVehicles; i++) {
    let newBB = new THREE.Box3().setFromObject(otherVehicles[i].mesh)
    if(playerCarBB.intersectsBox(newBB)){
      console.log(true)
      console.log(i)
    }
  }
}
function selectCamera(cameraType) {
  if (cameraType == 2) {
    return POVCamera
  }
  if (cameraType == 3) {
    return carCamera
  }
  return camera
}
function movePlayerCar(timeDelta) {
  const playerSpeed = getPlayerSpeed()
  playerAngleMoved -= playerSpeed * timeDelta

  const totalPlayerAngle = playerAngleInitial + playerAngleMoved

  const playerX = Math.cos(totalPlayerAngle) * playerCarRadius
  const playerY = Math.sin(totalPlayerAngle) * playerCarRadius

  playerCar.position.x = playerX
  playerCar.position.y = playerY

  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2

  POVCamera.position.set(
    playerX - 0.2 * Math.cos(totalPlayerAngle),
    playerY - 0.2 * Math.sin(totalPlayerAngle),
    15
  )
  POVCamera.lookAt(
    playerX +
      0.2 *
        Math.cos(totalPlayerAngle - Math.PI / 2 - Math.PI / 3 - Math.PI / 7),
    playerY +
      0.2 *
        Math.sin(totalPlayerAngle - Math.PI / 2 - Math.PI / 3 - Math.PI / 7),
    15
  )

  carCamera.position.set(
    playerX - (20 * playerY) / playerCarRadius,
    playerY + (playerX / playerY) * ((20 * playerY) / playerCarRadius),
    20
  )
  carCamera.lookAt(playerX, playerY, 15)

  carReverseCamera.position.set(
    playerX - 2.0 * Math.cos(totalPlayerAngle),
    playerY - 2.0 * Math.sin(totalPlayerAngle),
    15
  )
  carReverseCamera.lookAt(
    playerX + 0.2 * Math.cos(totalPlayerAngle - Math.PI / 2),
    playerY + 0.2 * Math.sin(totalPlayerAngle - Math.PI / 2),
    15
  )
  carReverseCamera.rotateY(Math.PI / 2)
}
function getPlayerSpeed() {
  if (accelerate) {
    return speed * 2
  }
  if (decelerate) {
    return speed * 0.5
  }
  return speed
}
function addVehicle() {
  const vehicleTypes = ['car', 'truck']

  const type = pickRandom(vehicleTypes)
  const mesh = type == 'car' ? Car() : Truck()
  scene.add(mesh)

  const clockwise = Math.random() >= 0.5
  const angle = clockwise ? Math.PI / 2 : -Math.PI / 2

  const speed = getVehicleSpeed(type)

  const pathRadius = getRandomNumber(80, 160)

  countOtherVehicles += 1
  otherVehicles.push({ mesh, type, clockwise, angle, speed, pathRadius })
}
function getVehicleSpeed(type) {
  if (type == 'car') {
    const minimumSpeed = 0.8
    const maximumSpeed = 1.5
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed)
  }
  if (type == 'truck') {
    const minimumSpeed = 0.4
    const maximumSpeed = 1.2
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed)
  }
}
function moveOtherVehicles(timeDelta) {
  otherVehicles.forEach((vehicle) => {
    if (vehicle.clockwise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed
    }

    const vehicleX = Math.cos(vehicle.angle) * vehicle.pathRadius
    const vehicleY = Math.sin(vehicle.angle) * vehicle.pathRadius

    const rotation =
      vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2)

    vehicle.mesh.position.x = vehicleX
    vehicle.mesh.position.y = vehicleY
    vehicle.mesh.rotation.z = rotation
  })
}

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

  truck.scale.set(0.35, 0.35, 0.35)

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
  field.absarc(0, 0, outerTrackRadius + 2, 0, Math.PI * 2, true)
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
  renderer.render(scene, selectCamera(cameraType))
})
