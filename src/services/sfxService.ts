export class SFXService {
  private clickAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Using a more reliable sound source
      this.clickAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73456.mp3');
      this.clickAudio.volume = 0.5;
      this.clickAudio.load(); // Preload it
    }
  }

  playClick() {
    if (this.clickAudio) {
      this.clickAudio.currentTime = 0;
      const playPromise = this.clickAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("SFX playback failed, likely due to browser policy or source issue:", e);
          // Fallback: re-initialize if it was a source issue
          if (e.name === 'NotSupportedError') {
            this.clickAudio = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
          }
        });
      }
    }
  }
}

export const sfxService = new SFXService();
