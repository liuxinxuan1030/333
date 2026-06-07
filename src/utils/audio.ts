/**
 * Web Audio API synthesizer for Zen ASMR sounds:
 * 1. Ink droplet contact "水滴声" (liquid plop with upward pitch sweep)
 * 2. Calligraphy brush rub on rice paper "毛笔揉宣纸 ASMR" (band-pass filtered white noise brush stroke)
 */

class InkAsmrPlayer {
  private ctx: AudioContext | null = null;

  private initContext() {
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

  /**
   * Generates a realistic liquid water droplet impact plop sound.
   */
  public playWaterDrop() {
    const ctx = this.initContext();
    if (!ctx) return;

    const time = ctx.currentTime;
    
    // Create an oscillator for the plip sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // A rapid upward pitch sweep is what makes a convincing "plop" water bubble sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(850, time + 0.12);
    
    // Volume envelope
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.18);
  }

  /**
   * Generates a soft, breathing, brush friction swipe sound (ASMR).
   * It uses procedural white noise filtered to mimic hairs dragging on paper fibers.
   */
  public playBrushSwipe(duration: number = 1.8) {
    const ctx = this.initContext();
    if (!ctx) return;

    const time = ctx.currentTime;
    const bufferSize = ctx.sampleRate * duration;
    
    // Create noise buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Create filters to shape noise into "brush strokes" (bandpass centered at ~800Hz - 1500Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, time);
    filter.Q.setValueAtTime(3.0, time);
    
    // Swoosh the filter frequency slightly during the stroke for organic movement
    filter.frequency.exponentialRampToValueAtTime(750, time + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(1000, time + duration);
    
    const gain = ctx.createGain();
    
    // Smooth fade in and out for the brush swipe
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.12, time + duration * 0.25); // touch down
    gain.gain.linearRampToValueAtTime(0.08, time + duration * 0.7);  // drag
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration); // lift off
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseSource.start(time);
    noiseSource.stop(time + duration);
  }

  /**
   * Combined sound effect trigger when the ink droplet falls.
   * Plays water drop plop, followed by the soft ink bleeding brush drag.
   */
  public playInkDropSequence() {
    this.playWaterDrop();
    // Start brush ASMR 0.1s after the drop clicks to simulate instant diffusion brush sound
    setTimeout(() => {
      this.playBrushSwipe(1.6);
    }, 120);
  }
}

export const asmrPlayer = new InkAsmrPlayer();
