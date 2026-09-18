"use client";

import React, { useState, useRef } from "react";
import { RhythmCalculator } from "@/lib/rhythmCalculator";
import { RhythmCalculationResult } from "@/types";
import { HeartPulse, ArrowRight } from "lucide-react";

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
      colorClass: "text-[#5C6B65] border-[#D8E4DE] bg-[#F7FAF8]",
      tapCount: 0,
    });

  // Rescue breath 30:2 transition states
  const [mode, setMode] = useState<"compressing" | "rescuing" | "finished">(
    "compressing",
  );
  const [rescueStep, setRescueStep] = useState<number>(0);

  const rhythmCalcRef = useRef<RhythmCalculator>(new RhythmCalculator(6));

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
      setMode("rescuing");
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
    <div className="page-stack">
      <header>
        <h1 className="page-title">CPR</h1>
        <p className="caption mt-2">ฝึกจังหวะกดหน้าอกผ่านการแตะหน้าจอ</p>
      </header>
      {mode === "compressing" && (
        <section className="cpr-surface">
          <p className="caption">จังหวะเป้าหมาย</p>
          <p className="text-xl font-semibold mt-1">100–120 ครั้ง/นาที</p>
          <div className="mt-6">
            <p className="caption">จังหวะปัจจุบัน (ครั้ง/นาที)</p>
            <p className="cpr-bpm">
              {calculatorResult.bpm > 0 ? calculatorResult.bpm : "—"}
            </p>
          </div>
          <p className="text-lg">
            {compressions} / {targetCompressions} ครั้ง
          </p>
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
            <HeartPulse size={40} strokeWidth={1.75} />
            <span>แตะเพื่อกดหน้าอก</span>
          </button>
          <p role="status" aria-live="polite">
            {calculatorResult.state === "insufficient"
              ? "แตะต่อเนื่องเพื่อเริ่มวัดจังหวะ"
              : calculatorResult.feedbackMessage}
          </p>
          <p className="caption mt-4">
            วัดเฉพาะจังหวะการแตะ ไม่วัดความลึกหรือแรงกดจริง
          </p>
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
              ขั้นตอนช่วยหายใจสำหรับผู้ที่ได้รับการฝึก
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
          <p>เพื่อนนำเครื่อง AED มาถึงแล้ว ไปฝึกใช้งานในขั้นตอนถัดไป</p>
          <button className="primary-button self-start" onClick={handleFinish}>
            ไปขั้นตอน AED
            <ArrowRight size={20} />
          </button>
        </section>
      )}
    </div>
  );
};
