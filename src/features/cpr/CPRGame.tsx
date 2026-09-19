"use client";

import React, { useEffect, useState, useRef } from "react";
import { RhythmCalculator } from "@/lib/rhythmCalculator";
import { RhythmCalculationResult } from "@/types";
import { ArrowRight, HeartPulse, Timer } from "lucide-react";

interface CPRGameProps {
  targetCompressions?: number;
  onCompleteStep: (rhythmScore: number, averageBpm: number) => void;
}

export const CPRGame: React.FC<CPRGameProps> = ({
  targetCompressions = 30,
  onCompleteStep,
}) => {
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
    if (mode !== "countdown") return;
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
  }, [mode]);

  const handleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (mode !== "compressing") return;

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
    <div className="page-stack training-screen">
      <header>
        <p className="protocol-code">ขั้น 03 · จังหวะกดหน้าอก</p>
        <h1 className="page-title">CPR</h1>
        <p className="lead mt-3">
          ฝึกเฉพาะจังหวะด้วยการแตะหน้าจอ เป้าหมายคือสม่ำเสมอและหยุดให้น้อยที่สุด
        </p>
      </header>
      {mode === "ready" && (
        <section className="cpr-ready">
          <span className="cpr-ready-icon" aria-hidden="true"><HeartPulse /></span>
          <div>
            <h2 className="section-title">ฝึกจังหวะ CPR</h2>
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
        <section className="cpr-surface">
          <p className="caption">จังหวะเป้าหมาย</p>
          <p className="text-xl font-semibold mt-1">100–120 ครั้ง/นาที</p>
          <div className="mt-6">
            <p className="caption">จังหวะปัจจุบัน (ครั้ง/นาที)</p>
            <p className="cpr-bpm">
              {calculatorResult.bpm > 0 ? calculatorResult.bpm : "0"}
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
            <HeartPulse className="cpr-tap-mark" aria-hidden="true" />
            <span>แตะหนึ่งครั้งต่อการกดหน้าอกหนึ่งครั้ง</span>
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
            <h2 className="page-title">เลือกตามระดับการฝึกของคุณ</h2>
            <p className="lead mt-3">
              ผู้ที่ผ่านการฝึกช่วยหายใจสามารถฝึกแบบ 30:2 ได้
              หากยังไม่ผ่านการฝึกหรือไม่พร้อม ให้กดหน้าอกต่อเนื่องตามคำแนะนำของ 1669
            </p>
          </div>
          <div className="actions">
            <button
              className="primary-button"
              onClick={() => setMode("rescuing")}
            >
              ฝึกช่วยหายใจ 2 ครั้ง
              <ArrowRight size={20} />
            </button>
            <button
              className="secondary-button"
              onClick={() => setMode("finished")}
            >
              เลือกกดหน้าอกต่อเนื่อง
            </button>
          </div>
          <aside className="notice">
            ในเหตุจริง ให้เปิดลำโพงโทรศัพท์และทำตามคำแนะนำของเจ้าหน้าที่ 1669
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
            เพื่อนนำเครื่อง AED มาถึงแล้ว ในเหตุจริงให้กดหน้าอกต่อเนื่อง
            และหยุดให้น้อยที่สุดจนเครื่องพร้อมวิเคราะห์
          </p>
          <button className="primary-button self-start" onClick={handleFinish}>
            ไปขั้นตอน AED
            <ArrowRight size={20} />
          </button>
        </section>
      )}
    </div>
  );
};
