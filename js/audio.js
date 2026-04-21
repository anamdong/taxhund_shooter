export class AudioController {
  constructor() {
    this.bgm = new Audio('assets/audio/taxmagic_8bit_v01.wav');
    this.bgm.loop = true;
    this.bgm.volume = 0.45;
  }

  async playBgm() {
    try {
      await this.bgm.play();
    } catch (_err) {
      // Browsers can reject autoplay until a user interaction occurs.
    }
  }

  pauseBgm() {
    this.bgm.pause();
  }

  stopBgm() {
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }
}
