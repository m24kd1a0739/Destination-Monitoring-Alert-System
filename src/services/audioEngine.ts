class AudioEngine {
  private ctx: AudioContext | null = null;
  private napOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private napTimer: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playTone(freq: number, durationMs: number, type: OscillatorType = 'sine', gainVal = 0.3) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio tone note:', e);
    }
  }

  public playChime() {
    // Two-tone chime (880Hz -> 1174Hz)
    this.playTone(880, 250, 'sine', 0.25);
    setTimeout(() => {
      this.playTone(1174, 400, 'sine', 0.25);
    }, 180);
  }

  public playUrgentAlert() {
    // 3 rapid pulses (1046Hz High C)
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(1046, 120, 'triangle', 0.35);
    setTimeout(() => this.playTone(1046, 120, 'triangle', 0.35), 180);
    setTimeout(() => this.playTone(1318, 250, 'triangle', 0.4), 360);
  }

  public playArrivalCelebration() {
    // Triumphant chord: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 600, 'sine', 0.3);
      }, idx * 150);
    });
  }

  public playWarningTone() {
    // Low double buzz (440Hz -> 330Hz)
    this.playTone(440, 200, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(330, 300, 'sawtooth', 0.2), 220);
  }

  public startNapWakeUpAlarm() {
    this.stopNapWakeUpAlarm();
    const ctx = this.getContext();
    if (!ctx) return;

    const playBeepSeq = () => {
      this.playUrgentAlert();
    };

    playBeepSeq();
    this.napTimer = window.setInterval(playBeepSeq, 2000);
  }

  public stopNapWakeUpAlarm() {
    if (this.napTimer !== null) {
      clearInterval(this.napTimer);
      this.napTimer = null;
    }
  }
}

export const audioEngine = new AudioEngine();
