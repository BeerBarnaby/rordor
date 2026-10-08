import type { MissionResult } from '@/types';

export function nextPracticeFor(result: Pick<MissionResult, 'skillScores' | 'callCompletenessScore' | 'cprRhythmScore'>) {
  const areas = [
    { topic: 'assessment', title: 'ลำดับการช่วยเหลือ', score: result.skillScores.sequence, target: 80, instruction: 'ทบทวนขั้นตอน แล้วลองเรียงลำดับอีกครั้ง' },
    { topic: 'call1669', title: 'การแจ้งเหตุ 1669', score: result.callCompletenessScore, target: 80, instruction: 'ทบทวนข้อมูลที่ต้องแจ้ง แล้วลองตอบเจ้าหน้าที่อีกครั้ง' },
    { topic: 'cpr', title: 'จังหวะ CPR', score: result.cprRhythmScore, target: 70, instruction: 'ทบทวนเป้าหมาย 100–120 ครั้ง/นาที แล้วลองแตะให้สม่ำเสมอ' },
  ];
  const belowTarget = areas.filter(area => area.score < area.target);
  return { ...(belowTarget.length ? belowTarget : areas).reduce((lowest, area) => area.score < lowest.score ? area : lowest), needsReview: belowTarget.length > 0 };
}
