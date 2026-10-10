"use client";

import React, { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { RhythmCalculator } from "@/lib/rhythmCalculator";
import { RhythmCalculationResult } from "@/types";
import { ArrowRight, Timer } from "lucide-react";
function subscribeVisibility(callback: () => void) { document.addEventListener('visibilitychange', callback); return () => document.removeEventListener('visibilitychange', callback); }
function visibleSnapshot() { return document.visibilityState !== 'hidden'; }

interface CPRGameProps {
  active?: boolean;
  targetCompressions?: number;
  onCompleteStep: (rhythmScore: number, averageBpm: number) => void;
}

export const CPRGame: React.FC<CPRGameProps> = ({
  targetCompressions = 30,
  active = true,
  onCompleteStep,
}) => {
  const visible = useSyncExternalStore(subscribeVisibility, visibleSnapshot, () => true);
  const [compressions, setCompressions] = useState<number>(0);
  const [inTargetCount, setInTargetCount] = useState<number>(0);
  const [bpmHistory, setBpmHistory] = useState<number[]>([]);
  const [calculatorResult, setCalculatorResult] =
    useState<RhythmCalculationResult>({
      bpm: 0,
      state: "insufficient",
      feedbackMessage: "เริ่มกดจังหวะปั๊มหัวใจ (เป้าหมาย 100-120 ครั้ง/นาที)",
      colorClass: "text-[var(--color-ink-muted)]",
      tapCount: 0,
    });

  // Rescue breath 30:2 transition states
  const [mode, setMode] = useState<
    "ready" | "countdown" | "compressing" | "breath-choice" | "rescuing" | "finished"
  >("ready");
  const [countdown, setCountdown] = useState(3);
  const [rescueStep, setRescueStep] = useState<number>(0);

  const rhythmCalcRef = useRef<RhythmCalculator>(new RhythmCalculator(6));
  useEffect(() => {
    if (active && visible) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [mode, active, visible]);
  useEffect(() => { if (!active || !visible) rhythmCalcRef.current.reset(); }, [active, visible]);

  useEffect(() => {
    if (mode !== "countdown" || !active || !visible) return;
    const timer = window.setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          rhythmCalcRef.current.reset();
          setMode("compressing");
          return 0;
        }
        return previous - 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [mode, active, visible]);

  const handleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (mode !== "compressing" || !active || !visible) return;

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(45);
      } catch {}
    }

    const now = Date.now();
    const result = rhythmCalcRef.current.addTap(now);
    setCalculatorResult(result);

    const nextCount = compressions + 1;
    setCompressions(nextCount);

    if (result.state === "good") {
      setInTargetCount((prev) => prev + 1);
    }

    if (result.bpm > 0) {
      setBpmHistory((prev) => [...prev, result.bpm]);
    }

    if (nextCount >= targetCompressions) {
      setMode("breath-choice");
      setRescueStep(0);
    }
  };

  const handleRescueStepClick = () => {
    if (rescueStep === 0) {
      setRescueStep(1);
    } else if (rescueStep === 1) {
      setRescueStep(2);
    } else {
      setMode("finished");
    }
  };

  const calculateFinalStats = () => {
    const finalScore = RhythmCalculator.calculateOverallRhythmScore(
      inTargetCount,
      targetCompressions,
    );
    const avgBpm =
      bpmHistory.length > 0
        ? Math.round(bpmHistory.reduce((a, b) => a + b, 0) / bpmHistory.length)
        : 0;
    return { finalScore, avgBpm };
  };

  const handleFinish = () => {
    const { finalScore, avgBpm } = calculateFinalStats();
    onCompleteStep(finalScore, avgBpm);
  };

  return (
    <div className="page-stack training-screen cpr-training" data-mode={mode}>
      <header>
        <div className="training-title-row"><h1 className="page-title">ฝึกจังหวะ CPR</h1><span>ขั้น 3/3</span></div>
        {mode !== 'compressing' && <p className="caption mt-2">ฝึกด้วยการแตะหน้าจอ ไม่ใช่การวัดแรงกดหรือความลึกจริง</p>}
      </header>
      {mode === "ready" && (
        <section className="cpr-ready">
          <div>
            <h2 className="section-title">แตะต่อเนื่อง {targetCompressions} ครั้ง</h2>
            <p>เป้าหมาย 100–120 ครั้ง/นาที</p>
            <p className="caption mt-2">
              แตะพื้นที่ฝึก 1 ครั้งแทนการกดหน้าอก 1 ครั้ง ระบบวัดเฉพาะจังหวะการแตะ
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setCountdown(3);
              setMode("countdown");
            }}
          >
            <Timer size={20} /> เริ่มฝึก
          </button>
        </section>
      )}
      {mode === "countdown" && (
        <section className="cpr-countdown" role="status" aria-live="assertive">
          <p className="caption">เตรียมพร้อม</p>
          <strong>{countdown || "เริ่ม"}</strong>
        </section>
      )}
      {mode === "compressing" && (
        <section className="cpr-surface" data-rhythm={calculatorResult.state}>
          <p className="cpr-target">เป้าหมาย 100–120 ครั้ง/นาที</p>
          <div className="cpr-live-metric">
            <p className="caption">จังหวะของคุณ · ครั้ง/นาที</p>
            <p className="cpr-bpm">
              {calculatorResult.bpm > 0 ? calculatorResult.bpm : "—"}
            </p>
          </div>
          <p className="cpr-count">
            {compressions} / {targetCompressions} ครั้ง
          </p>
          <div
            className="cpr-progress"
            role="progressbar"
            aria-label="จำนวนครั้งที่แตะ"
            aria-valuemin={0}
            aria-valuemax={targetCompressions}
            aria-valuenow={compressions}
          >
            <span style={{ width: `${(compressions / targetCompressions) * 100}%` }} />
          </div>
          <button
            className="cpr-tap"
            onPointerDown={(event) => {
              if (event.button === 0) {
                event.preventDefault();
                event.currentTarget.focus();
                handleTap();
              }
            }}
            onClick={(event) => {
              if (event.detail === 0) handleTap();
            }}
            aria-label="แตะเพื่อฝึกจังหวะกดหน้าอก"
          >
            <strong>แตะ</strong>
            <span>หนึ่งครั้ง = หนึ่งจังหวะ</span>
          </button>
          <p className="cpr-feedback" role="status" aria-live="polite">
            {calculatorResult.state === "insufficient"
              ? "แตะต่อเนื่องเพื่อเริ่มวัดจังหวะ"
              : calculatorResult.feedbackMessage}
          </p>
          <p className="caption mt-4">
            วัดเฉพาะจังหวะการแตะ ไม่วัดความลึกหรือแรงกดจริง
          </p>
        </section>
      )}
      {mode === "breath-choice" && (
        <section className="page-stack">
          <div>
            <p className="protocol-code">ครบ 30 ครั้ง</p>
            <h2 className="page-title">ทำขั้นตอนไหนต่อ?</h2>
          </div>
          <div className="actions">
            <button
              className="primary-button"
              onClick={() => setMode("rescuing")}
            >
              ผ่านการฝึกแล้ว: ช่วยหายใจ 2 ครั้ง
              <ArrowRight size={20} />
            </button>
            <button
              className="secondary-button"
              onClick={() => setMode("finished")}
            >
              ยังไม่ผ่านการฝึก: กดหน้าอกต่อ
            </button>
          </div>
          <aside className="notice">
            แบบฝึกบนจอไม่ถือว่าได้รับการฝึกช่วยหายใจ ในเหตุจริงให้เปิดลำโพงและทำตามคำแนะนำของเจ้าหน้าที่ 1669
          </aside>
        </section>
      )}
      {mode === "rescuing" && (
        <section className="page-stack">
          <div>
            <p className="caption mb-2">
              กดครบ {targetCompressions} ครั้ง · ขั้นตอนจำลอง 30:2
            </p>
            <h2 className="section-title">
              {
                [
                  "เปิดทางเดินหายใจ",
                  "ช่วยหายใจครั้งที่ 1",
                  "ช่วยหายใจครั้งที่ 2",
                ][rescueStep]
              }
            </h2>
            <p>
              {
                [
                  "เชิดคางและกดหน้าผากผู้ป่วยลง เพื่อเปิดทางเดินหายใจให้โล่ง",
                  "บีบจมูก เป่าลมเข้าปากผู้ป่วย 1 วินาที สังเกตหน้าอกยกขึ้น",
                  "ปล่อยให้ลมออก แล้วเป่าซ้ำอีก 1 ครั้ง ก่อนเตรียมกลับเข้าสู่การกดหน้าอกหรือใช้ AED",
                ][rescueStep]
              }
            </p>
            <p className="caption mt-4">
              ขั้นตอนนี้สำหรับผู้ที่ผ่านการฝึกและพร้อมช่วยหายใจเท่านั้น
            </p>
          </div>
          <button
            className="primary-button self-start"
            onClick={handleRescueStepClick}
          >
            {rescueStep === 2 ? "เสร็จสิ้นการช่วยหายใจ" : "ดำเนินการต่อ"}
            <ArrowRight size={20} />
          </button>
        </section>
      )}
      {mode === "finished" && (
        <section className="page-stack">
          <div>
            <h2 className="section-title">ฝึกจังหวะครบแล้ว</h2>
          </div>
          <p>
            จบการฝึกหลักแล้ว ไปดูสรุปการจัดลำดับ การแจ้งเหตุ และจังหวะ CPR ได้เลย
            ส่วน AED เลือกทบทวนเพิ่มได้ในบทเรียนเสริม
          </p>
          <button className="primary-button self-start" onClick={handleFinish}>
            ดูผลการฝึกหลัก
            <ArrowRight size={20} />
          </button>
        </section>
      )}
    </div>
  );
};
