/**
 * Web Audio API synthesizer for Aapni Gapsap background beats, camera sound effects,
 * and microphone level visualization.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentBgmOscillators: { stop: () => void } | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Camera shutter / countdown beep
  playBeep(freq = 880, duration = 0.08, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext autoplay restrictions handled silently
    }
  }

  // Record start sound (pleasant ascending chime)
  playRecordStart() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [440, 660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.12, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.16);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Record stop sound (descending chime)
  playRecordStop() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [880, 660, 440].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.12, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.16);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Interactive backing loop generator (Lo-fi Desi Vibe / Chill Chit-Chat Beat)
  startBgmTrack(preset: 'lofi' | 'bollywood' | 'monsoon' | 'acoustic'): () => void {
    try {
      const ctx = this.getContext();
      this.stopBgmTrack();

      let isRunning = true;
      let step = 0;
      let timer: number | null = null;

      const tempo = preset === 'bollywood' ? 120 : preset === 'monsoon' ? 82 : 94;
      const stepDuration = 60 / tempo / 2; // eighth notes

      // Scale notes (Desi / Raag Bhairavi & Pentatonic flavors)
      const scaleNotes = preset === 'bollywood' 
        ? [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]
        : preset === 'monsoon'
        ? [220.00, 261.63, 293.66, 329.63, 392.00]
        : [261.63, 311.13, 349.23, 392.00, 466.16]; // minor pentatonic

      const playDrumHit = (type: 'kick' | 'snare' | 'hihat') => {
        if (!isRunning) return;
        const now = ctx.currentTime;
        if (type === 'kick') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
        } else if (type === 'snare') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.13);
        } else {
          // soft hi-hat
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'highpass' as unknown as OscillatorType;
          osc.frequency.setValueAtTime(7000, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
        }
      };

      const playChordNote = (freq: number) => {
        if (!isRunning) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      };

      const loop = () => {
        if (!isRunning) return;

        // Rhythm pattern
        if (step % 4 === 0) playDrumHit('kick');
        if (step % 4 === 2) playDrumHit('snare');
        if (step % 2 === 1) playDrumHit('hihat');

        // Melody note on selective steps
        if (step % 2 === 0) {
          const noteIndex = (Math.floor(step / 2) * 2 + (preset === 'bollywood' ? 1 : 0)) % scaleNotes.length;
          playChordNote(scaleNotes[noteIndex]);
        }

        step = (step + 1) % 16;
        timer = window.setTimeout(loop, stepDuration * 1000);
      };

      loop();

      const stopFn = () => {
        isRunning = false;
        if (timer) clearTimeout(timer);
      };

      this.currentBgmOscillators = { stop: stopFn };
      return stopFn;
    } catch {
      return () => {};
    }
  }

  stopBgmTrack() {
    if (this.currentBgmOscillators) {
      this.currentBgmOscillators.stop();
      this.currentBgmOscillators = null;
    }
  }
}

export const soundEngine = new SoundEngine();
