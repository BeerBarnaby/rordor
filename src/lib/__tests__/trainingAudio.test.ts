import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

describe('optional training sounds', () => {
  let stored: Map<string, string>;
  let contextFactory: ReturnType<typeof vi.fn>;
  let oscillator: { frequency: {value: number}; type: string; connect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> };
  let gain: {gain: {value: number; setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn>}; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>};
  beforeEach(() => {
    vi.resetModules(); vi.useFakeTimers(); stored = new Map();
    oscillator = {frequency:{value:0},type:'',connect:vi.fn(),start:vi.fn(),stop:vi.fn(),disconnect:vi.fn()};
    gain = {gain:{value:0,setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()},connect:vi.fn(),disconnect:vi.fn()};
    contextFactory = vi.fn(function () { return {state:'running',currentTime:0,destination:{},createGain:()=>gain,createOscillator:()=>oscillator}; });
    vi.stubGlobal('window',{AudioContext:contextFactory,dispatchEvent:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn(),setInterval,clearInterval});
    vi.stubGlobal('document',{visibilityState:'visible',addEventListener:vi.fn(),removeEventListener:vi.fn()});
    vi.stubGlobal('localStorage',{getItem:(key:string)=>stored.get(key)??null,setItem:(key:string,value:string)=>stored.set(key,value)});
  });
  afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
  it('is silent by default and does not create an audio context',async()=>{
    const audio = await import('../trainingAudio'); audio.playCue('correct');
    expect(audio.soundEnabled()).toBe(false); expect(contextFactory).not.toHaveBeenCalled();
  });
  it('remembering enabled state does not itself autoplay',async()=>{
    const audio=await import('../trainingAudio'); stored.set(audio.SOUND_KEY,'on');
    expect(audio.soundEnabled()).toBe(true); expect(contextFactory).not.toHaveBeenCalled();
  });
  it('plays cues after enabling and stops new cues after mute',async()=>{
    const audio=await import('../trainingAudio'); expect(audio.setSoundEnabled(true)).toBe(true); audio.playCue('correct');
    expect(oscillator.start).toHaveBeenCalledTimes(2);
    audio.setSoundEnabled(false); audio.playCue('complete');
    expect(gain.gain.value).toBe(0); expect(oscillator.start).toHaveBeenCalledTimes(2);
  });
  it('does not play in a hidden tab',async()=>{
    const audio=await import('../trainingAudio'); audio.setSoundEnabled(true);
    vi.stubGlobal('document',{visibilityState:'hidden'}); audio.playCue('select'); expect(oscillator.start).not.toHaveBeenCalled();
  });
  it('cleans up the metronome scheduler',async()=>{
    const audio=await import('../trainingAudio'); audio.setSoundEnabled(true); const stop=audio.startMetronome();
    vi.advanceTimersByTime(25); expect(oscillator.start).toHaveBeenCalledTimes(1);
    stop(); expect(vi.getTimerCount()).toBe(0);
  });
  it('allows silent training when Web Audio is unsupported',async()=>{
    vi.stubGlobal('window',{dispatchEvent:vi.fn()}); const audio=await import('../trainingAudio');
    expect(audio.setSoundEnabled(true)).toBe(false); expect(()=>audio.playCue('select')).not.toThrow();
  });
  it('does not fail when preference storage is blocked',async()=>{
    vi.stubGlobal('localStorage',{getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('blocked');}});
    const audio=await import('../trainingAudio'); expect(audio.setSoundEnabled(true)).toBe(true); expect(audio.soundEnabled()).toBe(true);
  });
  it('uses the new session preference when storage is readable but not writable',async()=>{
    vi.stubGlobal('localStorage',{getItem:()=> 'off',setItem:()=>{throw new Error('quota');}});
    const audio=await import('../trainingAudio');
    expect(audio.setSoundEnabled(true)).toBe(true); expect(audio.soundEnabled()).toBe(true);
    audio.setSoundEnabled(false); expect(audio.soundEnabled()).toBe(false);
  });
});
