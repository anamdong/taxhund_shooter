const CONTROL_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
  'Escape',
  'KeyP',
  'KeyE',
  'Enter',
  'Backspace',
]);

export class InputManager {
  constructor(target = window) {
    this.target = target;
    this.pressed = new Set();
    this.justPressed = new Set();
    this.textQueue = [];

    this.handleKeyDown = (event) => {
      if (CONTROL_KEYS.has(event.code)) {
        event.preventDefault();
      }

      if (!event.repeat && !this.pressed.has(event.code)) {
        this.justPressed.add(event.code);
      }
      this.pressed.add(event.code);

      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        if (event.key.length === 1) {
          this.textQueue.push(event.key);
        } else if (event.key === 'Backspace') {
          this.textQueue.push('{backspace}');
        } else if (event.key === 'Enter') {
          this.textQueue.push('{enter}');
        }
      }
    };

    this.handleKeyUp = (event) => {
      this.pressed.delete(event.code);
    };

    this.handleBlur = () => {
      this.pressed.clear();
      this.justPressed.clear();
      this.textQueue.length = 0;
    };

    target.addEventListener('keydown', this.handleKeyDown);
    target.addEventListener('keyup', this.handleKeyUp);
    target.addEventListener('blur', this.handleBlur);
  }

  isDown(code) {
    return this.pressed.has(code);
  }

  consumePress(code) {
    if (!this.justPressed.has(code)) {
      return false;
    }
    this.justPressed.delete(code);
    return true;
  }

  consumeText() {
    const out = this.textQueue.slice();
    this.textQueue.length = 0;
    return out;
  }

  endFrame() {
    this.justPressed.clear();
    this.textQueue.length = 0;
  }

  destroy() {
    this.target.removeEventListener('keydown', this.handleKeyDown);
    this.target.removeEventListener('keyup', this.handleKeyUp);
    this.target.removeEventListener('blur', this.handleBlur);
  }
}
