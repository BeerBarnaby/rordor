export type AEDState = 'power' | 'pads' | 'clear' | 'analyzing' | 'shock' | 'no-shock' | 'resume' | 'complete';
export type AEDRecommendation = 'shock' | 'no-shock';
export type AEDAction = 'continue' | 'analysis-complete';
/** Alternate completed practice rounds, including after reopening the app. */
export function recommendationForNextPractice(completedAttempts: number): AEDRecommendation {
  const count = Number.isFinite(completedAttempts) ? Math.max(0, Math.floor(completedAttempts)) : 0;
  return count % 2 === 0 ? 'shock' : 'no-shock';
}
export function advanceAED(state: AEDState, action: AEDAction, recommendation: AEDRecommendation): AEDState {
  if (state === 'analyzing') return action === 'analysis-complete' ? recommendation : state;
  if (action !== 'continue') return state;
  const next: Partial<Record<AEDState, AEDState>> = { power: 'pads', pads: 'clear', clear: 'analyzing', shock: 'resume', 'no-shock': 'resume', resume: 'complete' };
  return next[state] ?? state;
}
export function measuredMissionScore(sequence: number, call: number, rhythm: number) {
  return Math.round((sequence + call + rhythm) / 3);
}
