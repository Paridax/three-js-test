import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as CANNON from 'cannon-es'

let locked = false

// create new scene
const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

// create new physics world
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
world.broadphase = new CANNON.NaiveBroadphase()
;(world.solver as CANNON.GSSolver).iterations = 10
world.allowSleep = true

// create new camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
let cameraHeight = 2
camera.position.y = cameraHeight
camera.position.z = 25
var cameraDir = new THREE.Vector3(); // create once and reuse it!

// create new renderer
const renderer = new THREE.WebGLRenderer()
renderer.setClearColor('#333333')
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// add pause menu functionality
const menuPanel = document.getElementById('menuPanel') as HTMLDivElement
const startButton = document.getElementById('startButton') as HTMLInputElement
startButton.addEventListener(
  'click',
  function () {
    controls.lock()
  },
  false
)

// create new first person controls
const controls = new PointerLockControls(camera, renderer.domElement)
controls.addEventListener('lock', () => {
  menuPanel.style.display = 'none'
  lastTime = Date.now()
  locked = true
})
controls.addEventListener('unlock', () => {
  menuPanel.style.display = 'block'
  locked = false
})

// listen for window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight

  camera.updateProjectionMatrix()
})

// create new plane
const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50)
const material = new THREE.MeshStandardMaterial({
  color: 0x444444
})
const plane = new THREE.Mesh(planeGeometry, material)
plane.rotateX(-Math.PI / 2)
scene.add(plane)

// add physics to plane
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

// add light
const light = new THREE.PointLight(0xffffff, 1, 1000)
light.position.set(0, 10, 0)
scene.add(light)
scene.add(controls.getObject())

// const cubes: THREE.Mesh[] = []
// for (let i = 0; i < 100; i++) {
//   const geo = new THREE.BoxGeometry(
//     Math.random() * 4,
//     Math.random() * 16,
//     Math.random() * 4
//   )
//   const mat = new THREE.MeshStandardMaterial()
//   switch (i % 3) {
//     case 0:
//       mat.color = new THREE.Color(0xff0000)
//       break
//     case 1:
//       mat.color = new THREE.Color(0xffff00)
//       break
//     case 2:
//       mat.color = new THREE.Color(0x0000ff)
//       break
//   }
//   const cube = new THREE.Mesh(geo, mat)
//   cubes.push(cube)
// }
// cubes.forEach((c) => {
//   c.position.x = Math.random() * 100 - 50
//   c.position.z = Math.random() * 100 - 50
//   c.geometry.computeBoundingBox()
//   c.position.y =
//     ((c.geometry.boundingBox as THREE.Box3).max.y -
//       (c.geometry.boundingBox as THREE.Box3).min.y) /
//     2
//   scene.add(c)
// })

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0xc0f0c0,
  wireframe: true
})
const cubeMesh = new THREE.Mesh(cubeGeometry, boxMaterial)
cubeMesh.position.x = -3
cubeMesh.position.y = 3
cubeMesh.castShadow = true
scene.add(cubeMesh)
const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const cubeBody = new CANNON.Body({ mass: 1, angularFactor: new CANNON.Vec3(0, 1, 0) })
cubeBody.addShape(cubeShape)
cubeBody.position.x = cubeMesh.position.x
cubeBody.position.y = cubeMesh.position.y
cubeBody.position.z = cubeMesh.position.z
world.addBody(cubeBody)

// create two spheres and add them to one body to make a capsule
const capsule = new CANNON.Body({
  mass: 1,
  angularFactor: new CANNON.Vec3(0, 0, 0)
})
const sphereShape = new CANNON.Sphere(0.5)
const sphereBody = new CANNON.Body({
  mass: 1,
})
sphereBody.addShape(sphereShape)
capsule.addShape(sphereShape, new CANNON.Vec3(0, 0.5, 0))
capsule.addShape(sphereShape, new CANNON.Vec3(0, -0.5, 0))
capsule.position.set(0, 5, 0)
world.addBody(capsule)

// create two new spheres in the scene
const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8)
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(0, 5, 0)
sphere.scale.set(1, 2, 1)
scene.add(sphere)

// first person camera movement
// make a key map
const keys = new Map();
window.addEventListener('keydown', (e) => {
  keys.set(e.key.toLowerCase(), true)
})
window.addEventListener('keyup', (e) => {
  // remove item from map
  keys.delete(e.key.toLowerCase())
})

// player movement and camera
let cameraBob = 0

let xSpeed = 0
let zSpeed = 0
let y = 0
let ySpeed = 0
let cameraOffset = 0
let cameraHeightTarget = cameraHeight

const playerMovement = function(deltaTime: number) {
  let speed = 10
  const friction = 0.99
  const deltaFriction = Math.pow(friction, (deltaTime * 1000))

  let moving = false
  xSpeed *= deltaFriction
  zSpeed *= deltaFriction
  ySpeed -= 9.8 * deltaTime

  if (keys.has('w')) {
    xSpeed += speed * deltaTime
    moving = true
  }
  if (keys.has('s')) {
    xSpeed -= speed * deltaTime
    moving = true
  }
  if (keys.has('a')) {
    zSpeed -= speed * deltaTime
    moving = true
  }
  if (keys.has('d')) {
    zSpeed += speed * deltaTime
    moving = true
  }

  // get camera direction
  camera.getWorldDirection(cameraDir);

  // apply physics movement to capsule
  let theta = Math.atan2(cameraDir.x, cameraDir.z) / Math.PI
  let forwardSin = Math.cos(theta)
  let forwardCos = Math.sin(theta)

  console.log(onGround())
  if (onGround()) {
    ySpeed = 0
    if (keys.has(' ')) {
      ySpeed = 10
    }
  }

  // set velocity of capsule
  capsule.velocity.set(
    xSpeed * xSpeed * forwardCos,
    ySpeed,
    xSpeed * xSpeed * forwardSin
  )
}

// delta time
let lastTime = Date.now()

// render loop
const render = function() {
  // get delta time
  const now = Date.now()
  const deltaTime = (now - lastTime)/1000
  lastTime = now
  // console.log(deltaTime)
  // run if mouse is locked
  if (controls.isLocked) {
    playerMovement(deltaTime)

    world.step(deltaTime)
    // Copy coordinates from Cannon to Three.js
    cubeMesh.position.set(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z)
    cubeMesh.quaternion.set(
      cubeBody.quaternion.x,
      cubeBody.quaternion.y,
      cubeBody.quaternion.z,
      cubeBody.quaternion.w
    )
    sphere.position.set(capsule.position.x, capsule.position.y, capsule.position.z)
    sphere.quaternion.set(
      capsule.quaternion.x,
      capsule.quaternion.y,
      capsule.quaternion.z,
      capsule.quaternion.w
    )

    camera.position.x = sphere.position.x
    camera.position.y = sphere.position.y + 0.8
    camera.position.z = sphere.position.z
  }
  requestAnimationFrame(render)

  renderer.render(scene, camera)
}

render()

function onGround() {
  return false
}