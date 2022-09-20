export class InputManager {
  private keysPressed = new Map();
  private buttonsPressed = new Map();
  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed.set(e.key.toLowerCase(), true)
      this.buttonsPressed.set(e.key.toLowerCase(), true)
      setTimeout(() => this.buttonsPressed.delete(e.key.toLowerCase()), 0)
    })

    window.addEventListener('keyup', (e) => {
      // remove item from map
      this.keysPressed.delete(e.key.toLowerCase())
    })
  }
  
  public get(key: string, singlePress: boolean = false) {
    if (singlePress) {
      return this.buttonsPressed.get(key)
    }
    return this.keysPressed.get(key)
  }
}