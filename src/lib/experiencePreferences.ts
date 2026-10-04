export const EXPERIENCE_KEY = 'nong_prom_experience_v1';
export function experienceSnapshot() {
  try { return localStorage.getItem(EXPERIENCE_KEY) ?? ''; } catch { return ''; }
}
export function subscribeExperience(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('experience-preferences', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('experience-preferences', callback); };
}
export function readExperience(raw: string) {
  try { const data = JSON.parse(raw); return { reduceMotion: data?.reduceMotion === true, haptics: data?.haptics === true }; }
  catch { return { reduceMotion: false, haptics: false }; }
}
