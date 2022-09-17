import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Stats from 'three/examples/jsm/libs/stats.module'

let lastTime = Date.now()

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
let cameraHeight = 2
camera.position.y = cameraHeight
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor('#333333')
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const menuPanel = document.getElementById('menuPanel') as HTMLDivElement
const startButton = document.getElementById('startButton') as HTMLInputElement
startButton.addEventListener(
  'click',
  function () {
    controls.lock()
  },
  false
)

const controls = new PointerLockControls(camera, renderer.domElement)
//controls.addEventListener('change', () => console.log("Controls Change"))
controls.addEventListener('lock', () => {
  menuPanel.style.display = 'none'; lastTime = Date.now()
})
controls.addEventListener('unlock', () => (menuPanel.style.display = 'block'))



window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight

  camera.updateProjectionMatrix()
})

const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50)
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
})
const plane = new THREE.Mesh(planeGeometry, material)
plane.rotateX(-Math.PI / 2)
scene.add(plane)

const cubes: THREE.Mesh[] = []
for (let i = 0; i < 100; i++) {
  const geo = new THREE.BoxGeometry(
    Math.random() * 4,
    Math.random() * 16,
    Math.random() * 4
  )
  const mat = new THREE.MeshBasicMaterial({ wireframe: true })
  switch (i % 3) {
    case 0:
      mat.color = new THREE.Color(0xff0000)
      break
    case 1:
      mat.color = new THREE.Color(0xffff00)
      break
    case 2:
      mat.color = new THREE.Color(0x0000ff)
      break
  }
  const cube = new THREE.Mesh(geo, mat)
  cubes.push(cube)
}
cubes.forEach((c) => {
  c.position.x = Math.random() * 100 - 50
  c.position.z = Math.random() * 100 - 50
  c.geometry.computeBoundingBox()
  c.position.y =
    ((c.geometry.boundingBox as THREE.Box3).max.y -
      (c.geometry.boundingBox as THREE.Box3).min.y) /
    2
  scene.add(c)
})

// first person camera movement

const keys = new Map();

window.addEventListener('keydown', (e) => {
  keys.set(e.key, true)
})

window.addEventListener('keyup', (e) => {
  // remove item from map
  keys.delete(e.key)
})

let cameraBob = 0

let xSpeed = 0
let zSpeed = 0
let y = 0
let ySpeed = 0
let cameraOffset = 0

const playerMovement = function(deltaTime: number) {
  deltaTime /= 1000
  const speed = 100
  const friction = 0.95

  let moving = false
  xSpeed = xSpeed * friction
  zSpeed = zSpeed * friction

  if (keys.get('w')) {
    xSpeed += speed * deltaTime
    moving = true
  }
  if (keys.get('s')) {
    xSpeed -= speed * deltaTime
    moving = true
  }
  if (keys.get('a')) {
    zSpeed -= speed * deltaTime
    moving = true
  }
  if (keys.get('d')) {
    zSpeed += speed * deltaTime
    moving = true
  }

  // if control key pressed then crouch
  if (keys.get('Shift')) {
    cameraHeight = 1.5
  } else {
    cameraHeight = 2
  }

  // r to reset
  if (keys.get('r')) {
    controls.getObject().position.set(0, cameraHeight, 0)
    xSpeed = 0
    zSpeed = 0
    y = 0
    ySpeed = 0
    camera.position.x = 0
    camera.position.z = 0
  }
  
  console.log(keys);

  // jump if on ground and space is pressed
  if (keys.get(' ') && y === 0) {
    ySpeed = 10
    xSpeed += speed * deltaTime * 25
  }

  y += ySpeed * deltaTime
  if (y < 0 && y > -cameraHeight && Math.abs(camera.position.x) < 50 && Math.abs(camera.position.z) < 50) {
    ySpeed = 0
    y = 0
  } else {
    ySpeed -= 25 * deltaTime
  }
    
  controls.moveForward(xSpeed * deltaTime);
  controls.moveRight(zSpeed * deltaTime);

  let realSpeed = Math.sqrt(xSpeed * xSpeed + zSpeed * zSpeed)

  if (realSpeed > 0.1 && y === 0) {
    // sin wave for bobbing
    cameraBob += deltaTime * realSpeed * 2
    cameraOffset = Math.sin(cameraBob)
  } else {
    realSpeed = 0
    cameraOffset = cameraOffset * 0.999
  }
  console.log(cameraOffset, realSpeed)
  camera.position.y = cameraHeight + cameraOffset * 0.1 + y
}


const render = function() {
  // get delta time
  const now = Date.now()
  const deltaTime = now - lastTime
  lastTime = now
  playerMovement(deltaTime)
  requestAnimationFrame(render)

  renderer.render(scene, camera)
}

render()
