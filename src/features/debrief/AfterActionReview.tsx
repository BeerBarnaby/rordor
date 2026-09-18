"use client";
import { MissionResult } from "@/types";
import { CircleCheck, RotateCcw, BookOpen } from "lucide-react";
import {
  EMERGENCY_CALL_FIELDS,
  INITIAL_SEQUENCE_CARDS,
} from "@/data/scenarios";
export function AfterActionReview({
  result,
  onRetryMission,
  onGoHome,
  onLearn,
}: {
  result: MissionResult;
  onRetryMission: () => void;
  onGoHome: () => void;
  onLearn: () => void;
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
    ...(result.skillScores.aed === 100
      ? ["ทบทวนตามลำดับการใช้ AED ครบทุกขั้นตอน"]
      : []),
  ];
  const review = [
    ...result.mistakes,
    ...(result.cprRhythmScore < 70
      ? ["ทบทวนจังหวะกดหน้าอก 100–120 ครั้ง/นาที แล้วลองฝึกจังหวะอีกครั้ง"]
      : []),
  ];
  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">ผลการฝึก</h1>
        <p className="caption mt-2">
          {result.scenarioTitle} · {result.completedAt}
        </p>
      </header>
      <div className="home-columns">
        <section>
          <p className="caption">คะแนนรวม</p>
          <p className="mt-2">
            <span className="score-number">{result.overallScore}</span>
            <span className="caption ml-2">/ 100</span>
          </p>
          <p className="caption mt-4">
            ใช้เวลา {Math.floor(result.totalTimeSeconds / 60)} นาที{" "}
            {result.totalTimeSeconds % 60} วินาที
          </p>
        </section>
        <dl className="metric-list">
          <div>
            <dt>ลำดับการช่วยเหลือ</dt>
            <dd>
              {Math.round((result.skillScores.sequence * sequenceTotal) / 100)}{" "}
              / {sequenceTotal}
            </dd>
          </div>
          <div>
            <dt>การแจ้ง 1669</dt>
            <dd>
              {Math.round(
                (result.callCompletenessScore * EMERGENCY_CALL_FIELDS.length) /
                  100,
              )}{" "}
              / {EMERGENCY_CALL_FIELDS.length} รายการ
            </dd>
          </div>
          <div>
            <dt>จังหวะกดในช่วงเป้าหมาย</dt>
            <dd>{result.cprRhythmScore}%</dd>
          </div>
        </dl>
      </div>
      <div className="home-columns section-rule">
        <section>
          <h2 className="section-title">สิ่งที่ทำได้ดี</h2>
          <ul className="space-y-3">
            {strengths.map((item) => (
              <li key={item} className="flex gap-3">
                <CircleCheck
                  size={20}
                  className="shrink-0 mt-1 text-[var(--color-primary)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="section-title">สิ่งที่ควรทบทวน</h2>
          {review.length ? (
            <ul className="list-disc pl-5 space-y-3">
              {review.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>
              ทบทวนขั้นตอนอย่างสม่ำเสมอ
              และฝึกภาคปฏิบัติกับครูฝึกเพื่อพัฒนาทักษะต่อไป
            </p>
          )}
        </section>
      </div>
      <aside className="notice">
        คะแนนนี้เป็นผลจากสถานการณ์จำลอง ไม่ใช่การรับรองความสามารถในการทำ CPR
        และวัดจังหวะจากการแตะหน้าจอเท่านั้น
      </aside>
      <div className="actions">
        <button className="primary-button" onClick={onRetryMission}>
          <RotateCcw size={20} />
          ฝึกอีกครั้ง
        </button>
        <button className="secondary-button" onClick={onLearn}>
          <BookOpen size={20} />
          ดูคู่มือ
        </button>
        <button className="text-button" onClick={onGoHome}>
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}
