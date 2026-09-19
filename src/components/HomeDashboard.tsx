"use client";

import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { UserProgress } from "@/types";

const steps = [
  { title: "ลำดับช่วยเหลือ", detail: "ประเมินเหตุและลงมือให้ถูกลำดับ" },
  { title: "แจ้งเหตุ 1669", detail: "บอกข้อมูลสำคัญให้ครบ" },
  { title: "จังหวะ CPR", detail: "รักษาจังหวะ 100–120 ครั้ง/นาที" },
  { title: "ใช้ AED", detail: "ฟังคำสั่ง เคลียร์พื้นที่ แล้วทำต่อ" },
];

export function TrainingSteps({ current = -1 }: { current?: number }) {
  const safeCurrent = Math.min(Math.max(current, 0), steps.length - 1);

  return (
    <div className="simulation-progress" aria-label="ความคืบหน้าการฝึก">
      <div className="progress-heading">
        <strong>{steps[safeCurrent].title}</strong>
        <span className="progress-count">
          {String(safeCurrent + 1).padStart(2, "0")} / 04
        </span>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li
            key={step.title}
            aria-current={index === safeCurrent ? "step" : undefined}
            data-complete={index < safeCurrent}
          >
            <span className="progress-marker" aria-hidden="true">
              {index < safeCurrent ? <Check /> : index + 1}
            </span>
            <span className="progress-label">{step.title}</span>
            <span className="sr-only">{index < safeCurrent ? " เสร็จแล้ว" : ""}</span>
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
  const currentLabel = continuing
    ? steps[Math.min(currentStep, steps.length - 1)].title
    : null;

  return (
    <div className="home-screen">
      <div className="home-top-grid">
        <section className="home-hero">
          <p className="protocol-code">สถานการณ์ 01 · CPR + AED</p>
          <h1 className="display-title">
            เพื่อนล้มลง
            <br />
            คุณจะช่วยอย่างไร?
          </h1>
          <p className="lead">
            ฝึกตัดสินใจตั้งแต่วินาทีแรก ผ่านสถานการณ์สั้น 4 ขั้นตอน
            พร้อมคำแนะนำหลังตอบ
          </p>
          <p className="mission-meta">4 ขั้น · ประมาณ 5 นาที · เปลี่ยนสถานการณ์ทุกครั้ง</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onStart}>
              {continuing
                ? `ทำต่อ: ${currentLabel}`
                : progress.missionAttemptsCount
                  ? "ลองสถานการณ์ใหม่"
                  : "เริ่มฝึกสถานการณ์"}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button className="text-button" onClick={onLearn}>
              ทบทวนคู่มือก่อนฝึก
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          {continuing && (
            <p className="caption mt-3">
              บันทึกไว้ที่ขั้น {currentStep + 1} จาก 4
            </p>
          )}
        </section>

        <section className="training-plan" aria-labelledby="training-plan-title">
          <h2 id="training-plan-title" className="section-title">
            เส้นทางการฝึก
          </h2>
          <ol className="training-rail">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="rail-number">0{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </span>
                <ChevronRight aria-hidden="true" />
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="home-result" aria-labelledby="latest-result-title">
        {progress.lastMissionResult ? (
          <>
            <div>
              <p className="protocol-code">ผลล่าสุด</p>
              <h2 id="latest-result-title" className="section-title">
                {progress.lastMissionResult.scenarioTitle}
              </h2>
              <p className="caption">{progress.lastMissionResult.completedAt}</p>
              <p className="home-result-score mt-4">
                <span className="score-number">
                  {progress.lastMissionResult.overallScore}
                </span>
                <span className="caption">/ 100 คะแนน</span>
              </p>
            </div>
            <dl className="metric-list">
              <div>
                <dt>จังหวะกดในช่วงเป้าหมาย</dt>
                <dd>{progress.lastMissionResult.cprRhythmScore}%</dd>
              </div>
              <div>
                <dt>คะแนนดีที่สุด</dt>
                <dd>{progress.bestOverallScore}</dd>
              </div>
              <div>
                <dt>ฝึกแล้ว</dt>
                <dd>{progress.missionAttemptsCount} ครั้ง</dd>
              </div>
            </dl>
          </>
        ) : (
          <div>
            <p className="protocol-code">ผลการฝึก</p>
            <h2 id="latest-result-title" className="section-title">
              ยังไม่มีผลการฝึก
            </h2>
            <p className="caption">
              ใช้เวลาประมาณ 5 นาที แล้วระบบจะสรุปสิ่งที่ทำได้ดีและจุดที่ควรทบทวน
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
