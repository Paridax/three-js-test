import * as THREE from 'three'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5
camera.position.y = 5

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor('#666666')
renderer.setSize(window.innerWidth, window.innerHeight)

// add light
const light = new THREE.PointLight(0xffffff, 1, 1000)
light.position.set(10, 10, 10)
scene.add(light)

document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight

  camera.updateProjectionMatrix()
})

var geometry = new THREE.BoxGeometry( 100, 0.01, 100 )
var material = new THREE.MeshLambertMaterial( {color: 0xe5e5e5} )
var cube = new THREE.Mesh( geometry, material )
scene.add( cube )

// first person camera movement

const keys = new Map();

window.addEventListener('keydown', (e) => {
  keys.set(e.key, true)
})

window.addEventListener('keyup', (e) => {
  keys.set(e.key, false)
})

const moveCamera = function() {
  if (keys.get('w')) {
    camera.position.z -= 0.1
  }
  if (keys.get('s')) {
    camera.position.z += 0.1
  }
  if (keys.get('a')) {
    camera.position.x -= 0.1
  }
  if (keys.get('d')) {
    camera.position.x += 0.1
  }
  // look around with arrow keys
  if (keys.get('ArrowUp')) {
    camera.rotation.x -= 0.01
  }
  if (keys.get('ArrowDown')) {
    camera.rotation.x += 0.01
  }
  if (keys.get('ArrowLeft')) {
    camera.rotation.y -= 0.01
  }
  if (keys.get('ArrowRight')) {
    camera.rotation.y += 0.01
  }
  
  // reset camera
  if (keys.get('r')) {
    camera.position.set(0, 5, 5)
    camera.rotation.set(0, 0, 0)
  }
}

const render = function() {
  moveCamera()
  requestAnimationFrame(render)

  renderer.render(scene, camera)
}

render()

