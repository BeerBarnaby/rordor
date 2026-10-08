export const SOUND_KEY = 'nong_prom_sound_v1';
export type SoundCue = 'select' | 'correct' | 'review' | 'complete' | 'beat';
let context: AudioContext | null = null;
let master: GainNode | null = null;
let volatileEnabled = false;
let sessionOnly = false;

export function soundEnabled() {
  if (typeof window === 'undefined') return false;
  if (sessionOnly) return volatileEnabled;
  try { const saved = localStorage.getItem(SOUND_KEY); return saved === null ? volatileEnabled : saved === 'on'; }
  catch { return volatileEnabled; }
}
export function subscribeSound(callback: () => void) {
  const update = () => { if (master) master.gain.value = soundEnabled() && document.visibilityState !== 'hidden' ? .12 : 0; callback(); };
  window.addEventListener('storage', update);
  window.addEventListener('training-sound', update);
  document.addEventListener('visibilitychange', update);
  return () => { window.removeEventListener('storage', update); window.removeEventListener('training-sound', update); document.removeEventListener('visibilitychange', update); };
}
// Must be called from a user gesture, never on page load.
export function unlockAudio(): boolean {
  if (!soundEnabled() || typeof window === 'undefined') return false;
  try {
    if (!context) {
      const Constructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) return false;
      context = new Constructor();
      master = context.createGain();
      master.gain.value = .12;
      master.connect(context.destination);
    }
    if (context.state === 'suspended') void context.resume().catch(() => {});
    return true;
  } catch { return false; }
}
export function setSoundEnabled(enabled: boolean): boolean {
  volatileEnabled = enabled;
  try {
    localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
    sessionOnly = false;
  } catch { sessionOnly = true; }
  if (master) master.gain.value = enabled ? .12 : 0;
  window.dispatchEvent(new Event('training-sound'));
  return !enabled || unlockAudio();
}
export const cueFrequencies: Record<SoundCue, readonly number[]> = {
  select: [440], correct: [523, 659], review: [330, 294], complete: [523, 659, 784], beat: [700],
};
export function playCue(cue: SoundCue, scheduledAt?: number) {
  if (!soundEnabled() || typeof document === 'undefined' || document.visibilityState === 'hidden') return;
  if (scheduledAt === undefined && !unlockAudio()) return;
  if (!context || !master || context.state !== 'running') return;
  try {
    cueFrequencies[cue].forEach((frequency, i) => {
      const start = (scheduledAt ?? context!.currentTime) + i * .11;
      const oscillator = context!.createOscillator();
      const envelope = context!.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(.5, start + .005);
      envelope.gain.exponentialRampToValueAtTime(.001, start + .075);
      oscillator.connect(envelope);
      envelope.connect(master!);
      oscillator.start(start);
      oscillator.stop(start + .08);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
  } catch { /* Audio failures must never change score or block an action. */ }
}
export const METRONOME_BPM = 110;
export function startMetronome() {
  if (!context || !soundEnabled()) return () => {};
  let next = context.currentTime + .02;
  const timer = window.setInterval(() => {
    if (!context || !soundEnabled() || document.visibilityState === 'hidden') return;
    if (next < context.currentTime) next = context.currentTime + .02;
    while (next < context.currentTime + .06) { playCue('beat', next); next += 60 / METRONOME_BPM; }
  }, 25);
  return () => window.clearInterval(timer);
}
