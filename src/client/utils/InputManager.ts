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

    window.addEventListener('mousedown', (e) => {
      this.keysPressed.set(e.button, true)
    })

    window.addEventListener('mouseup', (e) => {
      this.keysPressed.delete(e.button)
    })
  }
  
  public get(key: string) {
    return this.keysPressed.get(key)
  }

  public getMouse(button: 'left' | 'right' | 'middle' = 'left') {
    // console.log(this.keysPressed)
    switch(button) {
      case 'left':
        return this.keysPressed.get(0)
      case 'right':
        return this.keysPressed.get(2)
      case 'middle':
        return this.keysPressed.get(1)
    }
  }
}