import { describe, expect, it } from 'vitest';
import { CPR_LESSONS, CPR_LESSON_SCOPE, CPR_SOURCES } from '../../data/cprLessons';

describe('adult CPR reading lessons', () => {
  it('has five unique lessons with official sources', () => {
    expect(CPR_LESSONS).toHaveLength(5);
    expect(new Set(CPR_LESSONS.map(item => item.id)).size).toBe(5);
    for (const lesson of CPR_LESSONS) {
      expect(lesson.points.length).toBeGreaterThan(1);
      expect(CPR_SOURCES[lesson.source].url).toMatch(/^https:\/\/(cpr\.heart\.org|www\.redcross\.org)\//);
    }
  });
  it('states adult scope, emergency number and simulation limits', () => {
    expect(CPR_LESSON_SCOPE).toContain('ผู้ใหญ่');
    expect(CPR_LESSON_SCOPE).toContain('เด็ก');
    const content = CPR_LESSONS.flatMap(item => item.points).join(' ');
    expect(content).toContain('1669');
    expect(content).toContain('100–120');
    expect(content).toContain('เฉพาะจังหวะการแตะ');
  });
});
