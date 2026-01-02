const POP_SOURCES = ['/sounds/k1.wav', '/sounds/k2.wav', '/sounds/k3.wav'];
const HIT_SOURCE = '/sounds/hit.wav';
const BASE_GAIN = 0.5;

type SoundManagerApi = {
  unlock: () => void;
  playPop: () => void;
  playBossHit: () => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => boolean;
  isMuted: () => boolean;
};

class BrowserSoundManager implements SoundManagerApi {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private popBuffers: AudioBuffer[] = [];
  private hitBuffer: AudioBuffer | null = null;
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

  playBossHit() {
    if (!this.unlocked || this.muted) return;
    this.ensureContext();
    this.resumeContext();

    if (!this.hitBuffer) {
      this.startLoadingBuffers();
      return;
    }

    if (!this.audioCtx || !this.gainNode) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.hitBuffer;
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
      this.gainNode.gain.value = muted ? 0 : BASE_GAIN;
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
    this.gainNode.gain.value = this.muted ? 0 : BASE_GAIN;
    this.gainNode.connect(this.audioCtx.destination);
  }

  private resumeContext() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => undefined);
    }
  }

  private startLoadingBuffers() {
    if (this.loadingPromise || !this.audioCtx) return;
    if (this.popBuffers.length && this.hitBuffer) return;

    const ctx = this.audioCtx;
    const loadPopBuffers = Promise.all(
      POP_SOURCES.map(src => this.loadBuffer(ctx, src).catch(() => null))
    );
    const loadHitBuffer = this.loadBuffer(ctx, HIT_SOURCE).catch(() => null);

    this.loadingPromise = Promise.all([loadPopBuffers, loadHitBuffer])
      .then(([popBuffers, hitBuffer]) => {
        this.popBuffers = popBuffers.filter((buffer): buffer is AudioBuffer => Boolean(buffer));
        this.hitBuffer = hitBuffer;
      })
      .catch(() => {
        this.popBuffers = [];
        this.hitBuffer = null;
      })
      .finally(() => {
        this.loadingPromise = null;
      });
  }

  private async loadBuffer(ctx: AudioContext, src: string) {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to load sound ${src}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }
}

class NoopSoundManager implements SoundManagerApi {
  unlock() {}
  playPop() {}
  playBossHit() {}
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
