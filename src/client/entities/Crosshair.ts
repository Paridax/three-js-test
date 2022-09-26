import * as THREE from 'three'

export class Crosshair {
  // make 4 rectangles for the crosshair
  public crosshair = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  public crosshair2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  public crosshair3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  public crosshair4 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  public crosshair5 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )

  private HUD: THREE.Scene

  public distanceFromCenter = 0.1
  public scale = 0.04
  public width = 0.03
  public height = 0.1
  
  constructor(hud: THREE.Scene) {
    this.HUD = hud
    // have them all rotate to face the center
    this.crosshair.rotation.set(0, 0, 0)
    this.crosshair2.rotation.set(0, 0, 0)
    this.crosshair3.rotation.set(0, 0, Math.PI / 2) 
    this.crosshair4.rotation.set(0, 0, Math.PI / 2)
    // add all of the crosshair rectangles to the HUD scene
    this.HUD.add(this.crosshair)
    this.HUD.add(this.crosshair2)
    this.HUD.add(this.crosshair3)
    this.HUD.add(this.crosshair4)
    this.HUD.add(this.crosshair5)

    this.update()
  }

  public update() {
    // update the crosshair rectangles
    this.crosshair.position.set(0, this.distanceFromCenter * this.scale, -0.1)
    this.crosshair2.position.set(0, -this.distanceFromCenter * this.scale, -0.1)
    this.crosshair3.position.set(this.distanceFromCenter * this.scale, 0, -0.1)
    this.crosshair4.position.set(-this.distanceFromCenter * this.scale, 0, -0.1)
    this.crosshair5.position.set(0, 0, -0.1)

    this.crosshair.scale.set(this.scale * this.width, this.scale * this.height, this.scale)
    this.crosshair2.scale.set(this.scale * this.width, this.scale * this.height, this.scale)
    this.crosshair3.scale.set(this.scale * this.width, this.scale * this.height, this.scale)
    this.crosshair4.scale.set(this.scale * this.width, this.scale * this.height, this.scale)
    this.crosshair5.scale.set(this.scale * this.width, this.scale * this.width, this.scale)
  }
}