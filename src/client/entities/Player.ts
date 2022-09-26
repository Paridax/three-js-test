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
  
  public cameraPos = new THREE.Vector3(0, 0.8, 0)
  public cameraShake = new THREE.Vector3(0, 0, 0)
  public walkingTime = 0

  private speed = 0.8
  private jumpStrength = 8
  private gravity = 15
  private airControl = 0.1
  private diagonalSpeed = this.speed * 0.7071067811865476
  private lastPosition = new THREE.Vector3()
  public lastRotation = new THREE.Euler()
  public averageSpeedArr: number[] = []
  public averageSpeed = 0

  public realSpeed = 0

  public position = new THREE.Vector3(0, 0, 0)
  public velocity = new THREE.Vector3(0, 0, 0)
  public hitbox = new THREE.Box3(
    new THREE.Vector3(-Player.width / 2, Player.height / -2, -Player.width / 2),
    new THREE.Vector3(Player.width / 2, Player.height / 2, Player.width / 2)
  )

  public playerObject = new THREE.Mesh(
    new THREE.BoxGeometry(Player.width, Player.height, Player.width),
    // Player.material
  )

  public leftRight = 0
  public forwardBack = 0
  public onground = false
  private groundTime = 0
  private airTime = 0
  private spacePressTime = 1
  private spacePressed = false
  public listener = new THREE.AudioListener()
  public audioLoader = new THREE.AudioLoader();

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.playerObject.castShadow = true
    scene.add(this.playerObject)
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    this.camera.position.set(0, 5, -5)
    this.playerObject.position.set(this.position.x, this.position.y, this.position.z)
    this.lastPosition = this.position.clone()
    this.lastRotation = this.camera.rotation.clone()

    this.controls = new PointerLockControls(this.camera, renderer.domElement)
    this.renderer = renderer
    this.scene = scene
    this.camera.add(this.listener)

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
    
    this.movePlayer(delta, inputs, blocks)
    this.playerObject.position.set(this.position.x, this.position.y, this.position.z)
    this.camera.position.set(
      this.position.x + this.cameraPos.x + this.cameraShake.x,
      this.position.y + this.cameraPos.y, // + this.cameraShake.y,
      this.position.z + this.cameraPos.z + this.cameraShake.z
    )
    this.lastRotation = this.camera.rotation.clone()
  }

  movePlayer(delta: number, inputs: any, blocks: THREE.Mesh[]) {
    const friction = Math.pow(0.97, delta*500)
    const airFric = Math.pow(0.9991, delta * 1000)
    let forward = 0
    let right = 0

    let fb = 0
    let lr = 0

    if (this.locked) {
      // move player
      if (inputs.get('w')) {
        fb += 1
      }
      if (inputs.get('s')) {
        fb -= 1
      }
      if (inputs.get('a')) {
        lr += 1
      }
      if (inputs.get('d')) {
        lr -= 1
      }
      // reset button
      if (inputs.get('r')) {
        this.resetPlayer()
      }
    }

    if (this.onground) {
      this.groundTime += delta
      this.airTime = 0
    } else {
      this.groundTime = 0
      this.airTime += delta
    }

    if (Math.abs(fb) + Math.abs(lr) > 1) {
      // if the player is moving diagonally, multipy the speed by 0.7071
      // this is the same as dividing by sqrt(2)
      forward += fb * this.diagonalSpeed * (this.onground ? 1 : this.airControl)
      right += lr * this.diagonalSpeed * (this.onground ? 1 : this.airControl)
      this.leftRight = right
      this.forwardBack = forward
    } else {
      forward += fb * this.speed * (this.onground ? 1 : this.airControl)
      right += lr * this.speed * (this.onground ? 1 : this.airControl)
      this.leftRight = right
      this.forwardBack = forward
    }

    // console.log(this.spacePressed)
    if (inputs.get(' ')) {
      if (this.spacePressed === false) {
        this.spacePressTime = 0
      }
      this.spacePressed = true
    } else {
      this.spacePressTime += delta
      this.spacePressed = false
    }
    // console.log(this.spacePressTime, this.spacePressed)

    const jumpWindow = 0.02
    const jumpRecharge = 0.1
    if(this.spacePressTime < jumpWindow && (this.groundTime < jumpWindow || this.groundTime > jumpRecharge)) {
      if (this.onground) {
        this.velocity.y = this.jumpStrength
        this.spacePressTime += jumpWindow
      }
    }


    // add velocity
    if (this.onground) {
      this.velocity.x *= friction
      this.velocity.z *= friction
    } else {
      this.velocity.x *= airFric
      this.velocity.z *= airFric
    }

    // difference in x and z since last frame
    const dx = this.position.x - this.lastPosition.x
    const dz = this.position.z - this.lastPosition.z
    this.realSpeed = Math.sqrt(dx * dx + dz * dz) / delta
    this.lastPosition = this.position.clone()
    // if the player stops moving, keep adding to walking time until math.sin(walkingTime) = 0
    if (((!fb && !lr) || !this.onground) && this.realSpeed < 0.5) {
      // find the next time that sin(walkingTime) = 0
      const nextWalkingStep = Math.ceil(this.walkingTime /Math.PI) * Math.PI
      const lastWalkingStep = Math.floor(this.walkingTime /Math.PI) * Math.PI
      // find which is closer
      const nextWalkingStepDiff = nextWalkingStep - this.walkingTime
      const lastWalkingStepDiff = this.walkingTime - lastWalkingStep

      if (nextWalkingStepDiff < lastWalkingStepDiff) {
        this.walkingTime += nextWalkingStepDiff * 20 * delta // 0.007
      } else {
        this.walkingTime -= lastWalkingStepDiff * 20 * delta
      }
    } else {
      this.walkingTime += this.realSpeed * 0.008 * (this.onground ? 1 : 0)
    }
    const scale = 0.1
    // smoothly shift cameraShake to cameraShakeTarget
    this.cameraShake.set(
      0,
      Math.sin(this.walkingTime) * scale,
      0
    )

    // apply x and z velocity
    this.addVelocity(this.collisions, right, forward)

    let lastPosition = this.position.z
    this.position.z += this.velocity.z * delta
    this.checkCollisions(lastPosition, this.collisions, 'z')

    lastPosition = this.position.x
    this.position.x += this.velocity.x * delta
    this.checkCollisions(lastPosition, this.collisions, 'x')

    lastPosition = this.position.y
    this.position.y += this.velocity.y * delta
    this.checkCollisions(lastPosition, this.collisions, 'y')

    this.averageSpeedArr.push(this.realSpeed)
    if (this.averageSpeedArr.length > 10) {
      this.averageSpeedArr.shift()
    }
    this.averageSpeed = this.averageSpeedArr.reduce((a, b) => a + b, 0) / 10

    // apply gravity
    if ( this.velocity.y < -30) {
      this.velocity.y = -30
    } else {
      this.velocity.y -= this.gravity * delta
    }
  }

  addVelocity(blocks: THREE.Box3[], x: number, z: number) {
    // get camera direction
    const { sin, cos } = this.getCameraRotation()
    this.velocity.x += x * sin + z * cos
    this.velocity.z += - x * cos + z * sin
  }

  getCameraRotation() {
    const vector = new THREE.Vector3()
    this.camera.getWorldDirection(vector)
    // get sine and cosine of camera rotation
    const sin = Math.sin(Math.atan2(vector.z, vector.x))
    const cos = Math.cos(Math.atan2(vector.z, vector.x))
    return { sin, cos }
  }

  // cast a ray from each corner of the player's hitbox in each direction to see if it collides with a block
  // if it does, move the player back to the last position
  private checkCollisions(lastPosition: number, blocks: THREE.Box3[], axis: "x" | "y" | "z") {
    // check if the player is intersecting with any blocks
    const playerHitbox = this.hitbox.clone()
    playerHitbox.translate(this.position)
    const collisions = blocks.filter(block => playerHitbox.intersectsBox(block))
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

  getCameraDegrees() {
    const vector = new THREE.Vector3()
    this.camera.getWorldDirection(vector)

    const degrees = Math.atan2(vector.z, vector.x) * 180 / Math.PI
    return degrees
  }

  public resetPlayer() {
    this.setPosition(-50 + Math.random() * 100, 5, -50 + Math.random() * 100)
    this.velocity.set(0, 0, 0)
  }
}