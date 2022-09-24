import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Player } from './entities/Player'
import { InputManager } from './utils/InputManager'
import { Global } from './utils/Global'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor('#333333')
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const player = new Player(renderer, scene)
player.setPosition(0, 5, 0)
const inputs  = new InputManager()
const global = new Global()

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  player.cameraResize()
})

const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50)
const material = new THREE.MeshStandardMaterial({
  color: 0x404040,
})
const plane = new THREE.Mesh(planeGeometry, material)
plane.rotateX(-Math.PI / 2)
scene.add(plane)
const planeBox = new THREE.Box3().setFromObject(plane)
player.collisions.push(planeBox)

const cubes: THREE.Mesh[] = []
for (let i = 0; i < 100; i++) {
  const geo = new THREE.BoxGeometry(
    Math.random() * 4,
    1 + Math.random() * 3,
    Math.random() * 4
  )
  const mat = new THREE.MeshStandardMaterial({  })
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
  // add the cube bounding box to the collisions array
  const cubeBox = new THREE.Box3().setFromObject(c)
  player.collisions.push(cubeBox)
})

// add light
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(0, 10, 0)
scene.add(light)

const sound = new THREE.Audio(player.listener)
const footstep = player.audioLoader.load('audio/step2.ogg', function (buffer) {
  sound.setBuffer(buffer);
  // lower the bass
  sound.setLoop(false);
  sound.setVolume(0.3);
  sound.duration = 0.2
});

let stepTimer = 0

const render = function() {
  const delta = global.delta()
  player.update(delta, inputs, cubes)
  if (player.onground) {
    // randomize pitch
    stepTimer += delta * player.realSpeed * 0.5
    sound.detune = -300 + Math.random() * 600
    sound.duration = 0.2
    // play the audio more often if the player is moving faster
    if (Math.abs(Math.sin(player.walkingTime * 2)) > 0.9 && player.realSpeed > 1) {
      sound.play()
    }
  }
  light.position.set(player.position.x, player.position.y + 10, player.position.z)
  requestAnimationFrame(render)
  renderer.render(scene, player.camera)
}

render()
