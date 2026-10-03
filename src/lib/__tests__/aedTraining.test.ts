import { describe, expect, it } from 'vitest';
import { advanceAED, measuredMissionScore, type AEDState } from '../aedTraining';
describe('guided AED state guards', () => {
  it.each(['shock', 'no-shock'] as const)('follows the device %s branch', recommendation => {
    let state: AEDState = 'power';
    for (let i = 0; i < 3; i++) state = advanceAED(state, 'continue', recommendation);
    expect(state).toBe('analyzing');
    expect(advanceAED(state, 'continue', recommendation)).toBe('analyzing');
    state = advanceAED(state, 'analysis-complete', recommendation);
    expect(state).toBe(recommendation);
    state = advanceAED(state, 'continue', recommendation);
    expect(state).toBe('resume');
    expect(advanceAED(state, 'continue', recommendation)).toBe('complete');
  });
  it('ignores premature analysis and completion replay', () => {
    expect(advanceAED('power', 'analysis-complete', 'shock')).toBe('power');
    expect(advanceAED('complete', 'continue', 'shock')).toBe('complete');
  });
  it('averages only measured exercises, without guided AED or speed bonus', () => {
    expect(measuredMissionScore(0, 0, 0)).toBe(0);
    expect(measuredMissionScore(100, 100, 100)).toBe(100);
    expect(measuredMissionScore(60, 90, 30)).toBe(60);
  });
});
