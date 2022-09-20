import * as THREE from 'three'
import { Points } from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

// make a player class
export class Player {
  public controls: PointerLockControls
  public locked: boolean = false
  
  public camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  public collisions: THREE.Box3[] = []

  private static width: number = 0.5
  private static height: number = 1.8
  private static material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff, transparent: true, opacity: 0, wireframe: true })
  
  public position = new THREE.Vector3(0, 0, 0)
  public velocity = new THREE.Vector3(0, 0, 0)
  public hitbox = new THREE.Box3(
    new THREE.Vector3(-Player.width / 2, Player.height / -2, -Player.width / 2),
    new THREE.Vector3(Player.width / 2, Player.height / 2, Player.width / 2)
  )

  public playerObject = new THREE.Mesh(
    new THREE.BoxGeometry(Player.width, Player.height, Player.width),
    Player.material
  )

  private onground = false

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    scene.add(this.playerObject)
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 5, -5)
    this.playerObject.position.set(this.position.x, this.position.y, this.position.z)

    this.controls = new PointerLockControls(this.camera, renderer.domElement)
    this.renderer = renderer
    this.scene = scene

    this.mouseEvents(
      document.getElementById('menuPanel') as HTMLDivElement,
      document.getElementById('startButton') as HTMLInputElement
    )
  }

  private mouseEvents(menuPanel: HTMLDivElement, startButton: HTMLInputElement) {
    this.controls.addEventListener('lock', () => {
      menuPanel.style.display = 'none'
      this.locked = true
    })
    this.controls.addEventListener('unlock', () => {
      menuPanel.style.display = 'block'
      this.locked = false
    })
    const controls = this.controls
    startButton.addEventListener('click', () => controls.lock())
  }

  public cameraResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z)
  }
  
  // update run every frame
  // delta is the time in seconds since the last update e.g. 0.016
  update(delta: number, inputs: any, blocks: THREE.Mesh[]) {
    if (!this.locked) {
      return
    }

    this.movePlayer(delta, inputs, blocks)
    this.playerObject.position.set(this.position.x, this.position.y, this.position.z)
    this.camera.position.set(this.position.x, this.position.y + 0.8, this.position.z)
  }

  movePlayer(delta: number, inputs: any, blocks: THREE.Mesh[]) {
    const speed = 1
    const jumpStrength = 15
    const gravity = 30
    const friction = Math.pow(0.98, delta*400)

    // move player
    if (inputs.get('w')) {
      this.velocity.z -= speed
    }
    if (inputs.get('s')) {
      this.velocity.z += speed
    }
    if (inputs.get('a')) {
      this.velocity.x -= speed
    }
    if (inputs.get('d')) {
      this.velocity.x += speed
    }

    if (inputs.get(' ') && this.onground ) {
      this.velocity.y = jumpStrength
    }

    // reset button
    if (inputs.get('r')) {
      this.resetPlayer()
    }

    // apply friction
    this.velocity.x *= friction
    this.velocity.z *= friction

    // apply x and z velocity
    this.move(this.velocity.z * delta, this.velocity.x * delta, this.velocity.y * delta,  this.collisions)

    // apply gravity
    this.velocity.y -= gravity * delta
  }

  move(amountZ: number, amountX: number, amountY: number, blocks: THREE.Box3[]) {
    // get camera direction
    const vector = new THREE.Vector3()
    this.camera.getWorldDirection(vector)
    // get sine and cosine of camera rotation
    const sin = Math.sin(Math.atan2(vector.z, vector.x))
    const cos = Math.cos(Math.atan2(vector.z, vector.x))

    let lastPosition = this.position.z
    this.position.z += cos * amountX
    this.position.z += sin * -amountZ
    this.checkCollisions(lastPosition, blocks,'z')
    
    lastPosition = this.position.x
    this.position.x -= sin * amountX
    this.position.x += cos * -amountZ
    this.checkCollisions(lastPosition, blocks, 'x')

    lastPosition = this.position.y
    this.position.y += amountY
    this.checkCollisions(lastPosition, blocks, 'y')
  }

  // cast a ray from each corner of the player's hitbox in each direction to see if it collides with a block
  // if it does, move the player back to the last position
  private checkCollisions(lastPosition: number, blocks: THREE.Box3[], axis: "x" | "y" | "z") {
    // check if the player is intersecting with any blocks
    const playerHitbox = this.hitbox.clone()
    playerHitbox.translate(this.position)
    const collisions = blocks.filter(block => playerHitbox.intersectsBox(block))
    console.log(collisions)
    this.onground = false
    if (collisions.length > 0) {
      // if the player is moving in the y direction, set the velocity to 0
      if (axis === 'y') {
        this.velocity.y = 0
        if (lastPosition > this.position.y) {
          this.onground = true
        }
      }
      // if the player is intersecting with a block, move the player back to the last position
      this.position[axis] = lastPosition
    }
  }

  public resetPlayer() {
    this.setPosition(0, 5, 0)
    this.velocity.set(0, 0, 0)
  }
}