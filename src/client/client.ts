import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Player } from './entities/Player'
import { InputManager } from './utils/InputManager'
import { Global } from './utils/Global'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { Crosshair } from './entities/Crosshair'
import { Skybox } from './entities/Skybox'

const scene = new THREE.Scene()
const HUD = new THREE.Scene()
// scene.add(new THREE.AxesHelper(5))

const loader = new OBJLoader();
// add hud camera
const hudCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000)
HUD.add(hudCamera)
// add light to hud
const hudlight = new THREE.PointLight(0xffffff, 1, 50)
hudlight.position.set(-3, 4, 0)
HUD.add(hudlight)

const crosshair = new Crosshair(HUD);

let gun: THREE.Mesh

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor('#333333')
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement)

const player = new Player(renderer, scene)
player.setPosition(0, 5, 0)
const inputs  = new InputManager()
const global = new Global()
const skybox = new Skybox(scene)

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  player.cameraResize()
})

const prototypeRed = new THREE.TextureLoader().load('textures/texture_01.png');
prototypeRed.repeat.set(1, 1)
prototypeRed.wrapS = THREE.RepeatWrapping;
prototypeRed.wrapT = THREE.RepeatWrapping;

const prototypeGray = new THREE.TextureLoader().load('textures/texture_13.png');
prototypeGray.repeat.set(50, 50)
prototypeGray.wrapS = THREE.RepeatWrapping;
prototypeGray.wrapT = THREE.RepeatWrapping;

const prototypePurple = new THREE.TextureLoader().load('textures/texture_purple.png');
prototypePurple.repeat.set(1, 1)
prototypePurple.wrapS = THREE.RepeatWrapping;
prototypePurple.wrapT = THREE.RepeatWrapping;

// load a resource
loader.load(
  // resource URL
  'models/ar1.obj',
  // called when resource is loaded
  function (object: any) {
    gun = object
    object.material = new THREE.MeshStandardMaterial({ map: prototypeGray })
    object.position.set(0, 0, 0)
    HUD.add(object);
  },
  // called when loading is in progresses
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  // called when loading has errors
  function (error) {
    console.log(error);
  }
);

const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50)
const material = new THREE.MeshStandardMaterial({
  map: prototypeGray
})
const plane = new THREE.Mesh(planeGeometry, material)
plane.rotateX(-Math.PI / 2)
scene.add(plane)
plane.receiveShadow = true
const planeBox = new THREE.Box3().setFromObject(plane)
player.collisions.push(planeBox)

const cubes: THREE.Mesh[] = []
for (let i = 0; i < 100; i++) {
  const geo = new THREE.BoxGeometry(
    1 + Math.round(Math.random() * 1) + Math.round(Math.random() * 1),
    1 + Math.round(Math.random() * 1) + Math.round(Math.random() * 1),
    1 + Math.round(Math.random() * 1) + Math.round(Math.random() * 1),
  )
  const mat = new THREE.MeshStandardMaterial({  })
  switch (i % 2) {
    case 0:
      mat.map = prototypeRed
      break
      case 1:
        mat.map = prototypePurple
        break
      }
      const cube = new THREE.Mesh(geo, mat)
      cube.castShadow = true
      cube.receiveShadow = true
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

// add a sunlight
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.4);
hemiLight.position.set(-3, 4, 0)
scene.add(hemiLight)

const sunRays = new THREE.DirectionalLight(0xffffff, 1)
sunRays.position.set(-50, 50, -50)
sunRays.shadow.camera.left = -100
sunRays.shadow.camera.right = 100
sunRays.shadow.camera.top = 100
sunRays.shadow.camera.bottom = -100
// set shadow resolution
sunRays.shadow.mapSize.width = 2048
sunRays.shadow.mapSize.height = 2048
// rotate sun rays
sunRays.target.position.set(0, 0, 0)
sunRays.castShadow = true
scene.add(sunRays)

const sound = new THREE.Audio(player.listener)
const footstep = player.audioLoader.load('audio/step2.ogg', function (buffer) {
  sound.setBuffer(buffer);
  // lower the bass
  sound.setLoop(false);
  sound.setVolume(0.3);
  sound.duration = 0.2
});

let stepTimer = 0
let soundPlayed = false

const gunPosOffset = new THREE.Vector3(0, 0, 0)

const render = function() {
  const delta = global.delta()
  if (gun) {
    // get difference in camera rotation since last frame
    let deltaRot = new THREE.Vector3(
      player.camera.rotation.x - player.lastRotation.x,
      player.camera.rotation.y - player.lastRotation.y,
      player.camera.rotation.z - player.lastRotation.z
    )
    // scale gun 0.1
    gun.scale.set(0.2, 0.2, 0.2)
    gun.position.set(0.12 + gunPosOffset.x, -0.1 + gunPosOffset.y, -0.5 + gunPosOffset.z)
    const breathing = Math.sin(global.clock * 1.5) * 0.0006
    if (inputs.getMouse('right')) {
      // console log difference between target and current offset
      console.log(-0.12 - gunPosOffset.y)
      gunPosOffset.y += (0.01 - gunPosOffset.y) * 12 * delta
      gunPosOffset.y += (player.cameraShake.y * 1.3 - 0.01) * 1 * delta
      gunPosOffset.y += (player.velocity.y * -0.6 - gunPosOffset.y) * 0.1 * delta
      gunPosOffset.x += (-0.12 - gunPosOffset.x) * 12 * delta
      gunPosOffset.x += (player.leftRight * 0.1) * 2 * delta
      // gunPosOffset.z += (player.forwardBack * 0.6 - gunPosOffset.z) * 1 * delta
      crosshair.distanceFromCenter += ((player.averageSpeed * 0.002 + Math.abs(player.velocity.y) * 0.04) - crosshair.distanceFromCenter) * 12 * delta
    } else {
      gunPosOffset.y += breathing
      if (player.onground) {
        gunPosOffset.y += (player.cameraShake.y * 1.3 - gunPosOffset.y ) * 1 * delta
        gunPosOffset.x += (player.leftRight * 3 - gunPosOffset.x) * 0.1 * delta
        gunPosOffset.z += (player.forwardBack * 0.6 - gunPosOffset.z) * 1 * delta
      } else {
        gunPosOffset.y += (player.velocity.y * -0.6 - gunPosOffset.y) * 0.1 * delta
        gunPosOffset.x += (player.leftRight * 0.6 - gunPosOffset.x) * 2 * delta
        gunPosOffset.z += (player.forwardBack * -0.6 - gunPosOffset.z) * 2 * delta
      }
      gunPosOffset.y *= 0.9
      gunPosOffset.x *= Math.pow(0.99, delta*1000)
      gunPosOffset.z *= Math.pow(0.99, delta*1000)
    }
    crosshair.distanceFromCenter += ((player.averageSpeed * 0.02 + 0.2 + Math.abs(player.velocity.y) * 0.04) - crosshair.distanceFromCenter) * 12 * delta
  }
  player.update(delta, inputs, cubes)
  if (player.onground) {
    // randomize pitch
    stepTimer += delta * player.realSpeed * 0.5
    sound.detune = -300 + Math.random() * 600
    sound.duration = 0.2
    // play the audio more often if the player is moving faster
    if (Math.sin(player.walkingTime * 2) > 0.9 && player.realSpeed > 1) {
      if (!soundPlayed) {
        if(sound.isPlaying) {
          sound.stop()
        }
        sound.play()
      }
      soundPlayed = true
    } else {
      soundPlayed = false
    }
  }
  skybox.update(player.camera.position)
  crosshair.update();
  requestAnimationFrame(render)
  renderer.autoClear = true
  console.log(Math.round(global.fps()))
  renderer.render(scene, player.camera)
  renderer.autoClear = false
  renderer.render(HUD, hudCamera)
}

render()
