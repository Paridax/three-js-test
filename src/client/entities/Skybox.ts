import * as THREE from 'three'
export class Skybox {
  private skybox: THREE.BoxGeometry
  private skyboxMaterials = {
    top: new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox/top.png'), side: THREE.DoubleSide }),
    bottom: new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox/bottom.png'), side: THREE.DoubleSide }),
    back: new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox/left.png'), side: THREE.DoubleSide }),
    front: new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox/right.png'), side: THREE.DoubleSide }),
    left: new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox/front.png'), side: THREE.DoubleSide }),
    right: new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox/back.png'), side: THREE.DoubleSide }),
  }
  private ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  private sunlight = new THREE.PointLight(0xffffff, 1, 50)
  private skyMesh: THREE.Mesh
  
  constructor(scene: THREE.Scene) {
    this.skybox = new THREE.BoxGeometry(2000, 2000, 2000)
    this.skyMesh = new THREE.Mesh(this.skybox, [
      this.skyboxMaterials.front,
      this.skyboxMaterials.back,
      this.skyboxMaterials.top,
      this.skyboxMaterials.bottom,
      this.skyboxMaterials.left,
      this.skyboxMaterials.right,
    ])
    
    this.skyMesh.position.set(0, 0, 0)
    scene.add(this.skyMesh)
    scene.add(this.ambientLight)
  }

  public update(position: THREE.Vector3) {
    this.skyMesh.position.set(position.x, position.y, position.z)
  }
}