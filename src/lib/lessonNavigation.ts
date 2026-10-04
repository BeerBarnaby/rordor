export const LESSON_IDS = ['assessment', 'call1669', 'cpr', 'aed'] as const;
export function readNavigation(hash: string) {
  const path = hash.replace(/^#/, '');
  const [section, lesson] = path.split('/');
  const tab = section === 'lessons' ? 'learn' : section === 'practice' ? 'mission' : 'home';
  const selectedLesson = tab === 'learn' && LESSON_IDS.some(id => id === lesson) ? lesson : null;
  return { tab, selectedLesson } as const;
}
export function navigationSnapshot() { return window.location.hash; }
export function subscribeNavigation(callback: () => void) {
  window.addEventListener('hashchange', callback);
  window.addEventListener('popstate', callback);
  window.addEventListener('app-navigation', callback);
  return () => {
    window.removeEventListener('hashchange', callback);
    window.removeEventListener('popstate', callback);
    window.removeEventListener('app-navigation', callback);
  };
}
export function navigateTo(hash: string) {
  if (window.location.hash === hash) return;
  window.history.pushState(null, '', hash);
  window.dispatchEvent(new Event('app-navigation'));
}
