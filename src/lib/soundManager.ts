const POP_SOURCES = ['/sounds/k1.wav', '/sounds/k2.wav', '/sounds/k3.wav'];

type SoundManagerApi = {
  unlock: () => void;
  playPop: () => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => boolean;
  isMuted: () => boolean;
};

class BrowserSoundManager implements SoundManagerApi {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private popBuffers: AudioBuffer[] = [];
  private loadingPromise: Promise<void> | null = null;
  private unlocked = false;
  private muted = false;

  unlock() {
    this.unlocked = true;
    this.ensureContext();
    this.resumeContext();
    this.startLoadingBuffers();
  }

  playPop() {
    if (!this.unlocked || this.muted) return;
    this.ensureContext();
    this.resumeContext();

    if (!this.popBuffers.length) {
      this.startLoadingBuffers();
      return;
    }

    if (!this.audioCtx || !this.gainNode) return;

    const buffer = this.popBuffers[Math.floor(Math.random() * this.popBuffers.length)];
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    try {
      source.start();
    } catch {
      // Ignore playback errors (tab in background, etc.)
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  toggleMute() {
    const next = !this.muted;
    this.setMuted(next);
    return next;
  }

  isMuted() {
    return this.muted;
  }

  private ensureContext() {
    if (this.audioCtx || typeof window === 'undefined') return;
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof window.AudioContext
      | undefined;
    if (!AudioCtx) return;
    this.audioCtx = new AudioCtx();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = this.muted ? 0 : 1;
    this.gainNode.connect(this.audioCtx.destination);
  }

  private resumeContext() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => undefined);
    }
  }

  private startLoadingBuffers() {
    if (this.loadingPromise || this.popBuffers.length || !this.audioCtx) return;
    const ctx = this.audioCtx;
    this.loadingPromise = Promise.all(
      POP_SOURCES.map(async src => {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to load sound ${src}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return ctx.decodeAudioData(arrayBuffer);
      })
    )
      .then(buffers => {
        this.popBuffers = buffers.filter((buffer): buffer is AudioBuffer => Boolean(buffer));
      })
      .catch(() => {
        this.popBuffers = [];
      })
      .finally(() => {
        this.loadingPromise = null;
      });
  }
}

class NoopSoundManager implements SoundManagerApi {
  unlock() {}
  playPop() {}
  setMuted() {}
  toggleMute() {
    return true;
  }
  isMuted() {
    return true;
  }
}

const isBrowser = typeof window !== 'undefined';

export const soundManager: SoundManagerApi = isBrowser
  ? new BrowserSoundManager()
  : new NoopSoundManager();
