import { describe, expect, it } from 'vitest';
import { INITIAL_SEQUENCE_CARDS } from '@/data/scenarios';
import { LEARNING_TOPICS } from '@/data/learning';

describe('ROTC seven-step lesson and mission', () => {
  it('teaches the same seven actions that the mission expects, in poster order', () => {
    const correct = INITIAL_SEQUENCE_CARDS.filter((c) => c.isCorrect)
      .sort((a, b) => a.correctOrder! - b.correctOrder!);
    expect(correct.map((c) => c.title)).toEqual([
      'ประเมินความปลอดภัย ณ จุดเกิดเหตุ', 'ปลุกเรียกผู้ป่วย',
      'ร้องขอความช่วยเหลือ โทร 1669', 'ประเมินการหายใจ',
      'กดหน้าอก 30 ครั้ง', 'ช่วยหายใจ 2 ครั้ง', 'ใช้เครื่อง AED ทันทีที่มาถึง',
    ]);
    const lesson = LEARNING_TOPICS.find((t) => t.id === 'assessment')!;
    expect(lesson.summarySteps).toEqual(correct.map((c) => `${c.title} — ${c.subtitle}`));
    expect(new Set(correct.map((c) => c.id)).size).toBe(7);
  });
  it('keeps breathing and AED safety instructions in the exercise and feedback', () => {
    const card = (n: number) => INITIAL_SEQUENCE_CARDS.find((c) => c.correctOrder === n)!;
    expect(card(4).subtitle).toContain('ไม่เกิน 10 วินาที');
    expect(card(6).feedbackIfWrong).toContain('ให้กดหน้าอกต่อเนื่อง');
    expect(card(7).subtitle).toContain('ไม่ต้องรอให้ครบเซ็ต');
    expect(card(7).feedbackIfWrong).toContain('ห้ามแตะผู้ป่วย');
  });
});
