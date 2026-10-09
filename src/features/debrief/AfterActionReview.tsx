"use client";
import { MissionResult } from "@/types";
import { CircleCheck, RotateCcw, BookOpen } from "lucide-react";
import { INITIAL_SEQUENCE_CARDS } from "@/data/scenarios";
import { nextPracticeFor } from '@/lib/trainingReview';
export function AfterActionReview({
  result,
  onRetryMission,
  onGoHome,
  onLearn,
  syncMessage = '', pendingCount = 0, onRetrySync,
}: {
  result: MissionResult;
  onRetryMission: () => void;
  onGoHome: () => void;
  onLearn: (topic?: string) => void;
  syncMessage?: string;
  pendingCount?: number;
  onRetrySync?: () => void;
}) {
  const sequenceTotal = INITIAL_SEQUENCE_CARDS.filter(
    (c) => c.isCorrect,
  ).length;
  const strengths = [
    ...(result.skillScores.sequence >= 80
      ? ["เรียงลำดับการช่วยเหลือได้ดี"]
      : []),
    ...(result.callCompletenessScore >= 80
      ? [
          result.callCompletenessScore === 100
            ? "แจ้งข้อมูลสำคัญให้เจ้าหน้าที่ได้ครบถ้วน"
            : "แจ้งข้อมูลสำคัญให้เจ้าหน้าที่ได้เกือบครบ",
        ]
      : []),
    ...(result.cprRhythmScore >= 70
      ? ["รักษาจังหวะกดในช่วงเป้าหมายได้ดี"]
      : []),
    ...(result.aedRecommendation
      ? ["ทบทวนตามลำดับการใช้ AED ครบทุกขั้นตอน"]
      : []),
  ];
  const review = [
    ...result.mistakes,
    ...(result.cprRhythmScore < 70
      ? ["ทบทวนจังหวะกดหน้าอก 100–120 ครั้ง/นาที แล้วลองฝึกจังหวะอีกครั้ง"]
      : []),
  ];
  const nextPractice = nextPracticeFor(result);
  return (
    <div className="page-stack results-screen">
      <header>
        <p className="protocol-code">สรุปหลังฝึก</p>
        <h1 className="page-title">ผลการฝึก</h1>
        <p className="caption mt-2">
          {result.scenarioTitle} · {result.completedAt}
        </p>
      </header>
      <section aria-label="การบันทึกผล"><p className="caption" role="status">{syncMessage || (result.playerId ? 'ผลบันทึกในเครื่องและผูกกับโปรไฟล์ที่ใช้เริ่มภารกิจ' : 'บันทึกผลแบบ Guest ในเครื่อง ไม่ต้องเข้าสู่ระบบ')}</p>{pendingCount > 0 && <button className="text-button" onClick={onRetrySync}>ลองส่งคะแนนที่รออีกครั้ง ({pendingCount})</button>}</section>
      <section className="review-next" aria-labelledby="review-next-title">
        <p className="protocol-code">{nextPractice.needsReview ? 'ฝึกต่อเรื่องนี้ก่อน' : 'ทบทวนต่อได้'}</p>
        <h2 id="review-next-title" className="section-title">{nextPractice.title}</h2>
        <p>{nextPractice.needsReview ? nextPractice.instruction : 'ทำแบบฝึกได้ตามเป้าหมายรอบนี้ ทบทวนต่อและฝึกภาคปฏิบัติกับครูฝึกอย่างสม่ำเสมอ'}</p>
        <button className="primary-button" onClick={() => onLearn(nextPractice.topic)}><BookOpen size={20} aria-hidden="true" />ทบทวนบท{nextPractice.title}</button>
      </section>
      <div className="review-score-overview">
        <section>
          <p className="caption">{result.scoringVersion ? 'คะแนนแบบฝึก 3 ส่วน' : 'คะแนนเดิม (สูตรก่อนปรับปรุง)'}</p>
          <p className="mt-2">
            <span className="score-number">{result.overallScore}</span>
            <span className="caption ml-2">/ 100</span>
          </p>
          <p className="caption mt-4">
            {result.cprAudioGuided && <span className="block">รอบนี้ใช้เสียงนำจังหวะ CPR เป็นการฝึกแบบมีตัวช่วย</span>}
            ใช้เวลา {Math.floor(result.totalTimeSeconds / 60)} นาที{" "}
            {result.totalTimeSeconds % 60} วินาที
          </p>
        </section>
      </div>
      <section className="skill-breakdown section-rule" aria-labelledby="skill-breakdown-title">
        <h2 id="skill-breakdown-title" className="section-title">ผลแยกตามทักษะ</h2>
        <p className="caption">จัดลำดับถูก {Math.round((result.skillScores.sequence * sequenceTotal) / 100)} จาก {sequenceTotal} ขั้น · จังหวะแตะเฉลี่ย {result.cprAverageBpm} ครั้ง/นาที</p>
        {[
          ["ลำดับการช่วยเหลือ", result.skillScores.sequence],
          ["แจ้งเหตุ 1669", result.callCompletenessScore],
          ["จังหวะ CPR", result.cprRhythmScore],
        ].map(([label, value]) => (
          <div className="skill-row" key={label}>
            <div><span>{label}</span><strong>{value}%</strong></div>
            <div className="progress-track" role="progressbar" aria-label={String(label)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(value)}>
              <span style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </section>
      <section className="aed-review-status">
        <h2 className="section-title">AED · {result.aedRecommendation ? 'ทบทวนแล้วในภารกิจเดิม' : 'บทเรียนเสริมสำหรับผู้สนใจ'}</h2>
        <p>เลือกฝึก AED เพิ่มได้ ไม่รวมในคะแนนภารกิจหลัก</p>
        {result.aedRecommendation && <p className="caption mt-2">สถานการณ์นี้: เครื่องจำลอง{result.aedRecommendation === 'shock' ? 'แนะนำให้ช็อก' : 'ไม่แนะนำให้ช็อก'}</p>}
      </section>
      {result.scoringVersion && <details className="reference-details"><summary>วิธีคิดคะแนนและลำดับกิจกรรม</summary><p className="caption">เฉลี่ยจากการจัดลำดับ การแจ้ง 1669 และจังหวะการแตะเท่านั้น ไม่ให้โบนัสจากความเร็ว เวลาเป็นเวลารวมตั้งแต่เริ่ม รวมช่วงที่ออกจากหน้าฝึก ผลสูตรใหม่บันทึกในเครื่องและส่งออนไลน์เมื่อฝึกด้วยโปรไฟล์ แยกจากอันดับสูตรเดิมและแยกผลที่ใช้เสียงนำ</p><ol className="space-y-3 mt-4">{result.timeline.map((event, index) => <li key={index}><span className="caption">{event.timestamp} · </span>{event.title}</li>)}</ol></details>}
      <div className="home-columns section-rule">
        <section>
          <h2 className="section-title">สิ่งที่ทำได้ดี</h2>
          <ul className="space-y-3">
            {strengths.map((item) => (
              <li key={item} className="flex gap-3">
                <CircleCheck
                  size={20}
                  className="shrink-0 mt-1 text-[var(--color-success)]"
                />
                {item}
              </li>
            ))}
          </ul>
          {!strengths.length && <p>ฝึกจบแล้ว ดูจุดที่ควรทบทวนก่อนลองอีกครั้ง</p>}
        </section>
        <section>
          <h2 className="section-title">สิ่งที่ควรทบทวน</h2>
          {review.length ? (
            <ul className="list-disc pl-5 space-y-3">
              {review.slice(0, 2).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>
              ทบทวนขั้นตอนอย่างสม่ำเสมอ
              และฝึกภาคปฏิบัติกับครูฝึกเพื่อพัฒนาทักษะต่อไป
            </p>
          )}
          {review.length > 2 && <details className="reference-details"><summary>ดูจุดที่ควรทบทวนอีก {review.length - 2} ข้อ</summary><ul className="list-disc pl-5 space-y-3">{review.slice(2).map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
        </section>
      </div>
      <aside className="notice">
        คะแนนนี้เป็นผลจากสถานการณ์จำลอง ไม่ใช่การรับรองความสามารถในการทำ CPR
        และวัดจังหวะจากการแตะหน้าจอเท่านั้น
      </aside>
      <div className="actions">
        <button className="primary-button" onClick={onRetryMission}>
          <RotateCcw size={20} />
          ลองสถานการณ์ใหม่
        </button>
        <button className="secondary-button" onClick={() => onLearn()}>
          <BookOpen size={20} />
          ดูบทเรียน
        </button>
        <button className="text-button" onClick={onGoHome}>
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}
