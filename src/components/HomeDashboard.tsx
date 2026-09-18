"use client";
import { ArrowRight } from "lucide-react";
import { UserProgress } from "@/types";
const labels = ["ลำดับช่วยเหลือ", "แจ้งเหตุ 1669", "จังหวะ CPR", "ใช้ AED"];
export function TrainingSteps({ current = -1 }: { current?: number }) {
  return (
    <div className="simulation-progress">
      <p className="caption">ขั้นที่ {Math.max(1, current + 1)} จาก 4</p>
      <ol aria-label="ความคืบหน้าการฝึก">
        {labels.map((label, index) => (
          <li
            key={label}
            aria-current={index === current ? "step" : undefined}
            data-complete={index < current}
          >
            {index + 1}. {label}
            {index < current && <span className="sr-only"> เสร็จแล้ว</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
interface Props {
  progress: UserProgress;
  onLearn: () => void;
  onStart: () => void;
  currentStep?: number;
}
export function HomeDashboard({
  progress,
  onLearn,
  onStart,
  currentStep,
}: Props) {
  const continuing = currentStep !== undefined;
  return (
    <div className="page-stack">
      <section>
        <h1 className="page-title">ฝึกตัดสินใจในสถานการณ์ฉุกเฉิน</h1>
        <div className="actions mt-6">
          <button className="primary-button" onClick={onStart}>
            {continuing
              ? "ฝึกสถานการณ์ต่อ"
              : progress.missionAttemptsCount
                ? "เริ่มฝึกสถานการณ์"
                : "เริ่มสถานการณ์แรก"}
            <ArrowRight size={20} />
          </button>
          <button className="secondary-button" onClick={onLearn}>
            คู่มือก่อนฝึก
          </button>
        </div>
      </section>
      <div className="home-columns section-rule">
        <div className="page-stack">
          <section>
            <h2 className="section-title">
              {continuing ? "สถานการณ์ที่กำลังฝึก" : "สถานการณ์สำหรับฝึก"}
            </h2>
            <p className="caption mb-2">CPR ผู้ใหญ่ + AED</p>
            <h3 className="scenario-heading">เพื่อนล้มลงระหว่างการฝึก</h3>
            <p className="mt-3">
              เมื่อเพื่อนไม่ตอบสนอง คุณจะประเมินสถานการณ์ ขอความช่วยเหลือ
              และลงมือช่วยอย่างไร?
            </p>
            {continuing ? (
              <>
                <p className="caption mt-5">
                  เสร็จแล้ว {currentStep} จาก 4 ขั้นตอน
                </p>
                <div className="progress-track">
                  <span style={{ width: `${(currentStep / 4) * 100}%` }} />
                </div>
                <p className="caption mt-2">ถัดไป: {labels[currentStep]}</p>
              </>
            ) : (
              <p className="caption mt-5">
                4 ขั้นตอน · มีคำแนะนำและสรุปผลหลังฝึก
              </p>
            )}
          </section>
        </div>
        <section>
          <h2 className="section-title">ผลการฝึกล่าสุด</h2>
          {progress.lastMissionResult ? (
            <>
              <p className="caption">
                {progress.lastMissionResult.completedAt}
              </p>
              <p className="mt-3 mb-5">
                <span className="score-number">
                  {progress.lastMissionResult.overallScore}
                </span>
                <span className="caption ml-2">/ 100 คะแนน</span>
              </p>
              <dl className="metric-list">
                <div>
                  <dt>จังหวะกดอยู่ในช่วงเป้าหมาย</dt>
                  <dd>{progress.lastMissionResult.cprRhythmScore}%</dd>
                </div>
                <div>
                  <dt>คะแนนดีที่สุด</dt>
                  <dd>{progress.bestOverallScore}</dd>
                </div>
                <div>
                  <dt>จำนวนครั้งที่ฝึก</dt>
                  <dd>{progress.missionAttemptsCount}</dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <p>ยังไม่มีผลการฝึก</p>
              <p className="caption mt-2">
                เริ่มสถานการณ์แรก แล้วกลับมาดูสิ่งที่ทำได้ดีและสิ่งที่ควรทบทวน
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
