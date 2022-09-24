export class InputManager {
  private keysPressed = new Map();
  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed.set(e.key.toLowerCase(), true)
    })

    window.addEventListener('keyup', (e) => {
      // remove item from map
      this.keysPressed.delete(e.key.toLowerCase())
    })
  }
  
  public get(key: string) {
    return this.keysPressed.get(key)
  }
}