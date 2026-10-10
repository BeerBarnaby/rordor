"use client";

import React, { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { RhythmCalculator } from "@/lib/rhythmCalculator";
import { RhythmCalculationResult } from "@/types";
import { ArrowRight, BadgeCheck, Sparkles, Timer } from "lucide-react";
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
  const [totalSets] = useState(() => Math.floor(Math.random() * 3) + 2);
  const [currentSet, setCurrentSet] = useState(1);
  const [actionDelay, setActionDelay] = useState(3);

  const rhythmCalcRef = useRef<RhythmCalculator>(new RhythmCalculator(6));
  useEffect(() => {
    if (active && visible) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [mode, active, visible]);

  useEffect(() => {
    if (!active || !visible || !["breath-choice", "rescuing", "finished"].includes(mode)) return;
    const timer = window.setInterval(() => {
      setActionDelay((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, rescueStep, active, visible]);
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
      setActionDelay(3);
      setMode("breath-choice");
      setRescueStep(0);
    }
  };

  const handleRescueStepClick = () => {
    if (rescueStep === 0) {
      setActionDelay(3);
      setRescueStep(1);
    } else if (rescueStep === 1) {
      setActionDelay(3);
      setRescueStep(2);
    } else {
      advanceAfterSet();
    }
  };

  const resetCompressionSet = () => {
    setCompressions(0);
    setCalculatorResult({
      bpm: 0,
      state: "insufficient",
      feedbackMessage: "เริ่มกดจังหวะปั๊มหัวใจ (เป้าหมาย 100-120 ครั้ง/นาที)",
      colorClass: "text-[var(--color-ink-muted)]",
      tapCount: 0,
    });
    rhythmCalcRef.current.reset();
  };

  const advanceAfterSet = () => {
    if (currentSet >= totalSets) {
      setActionDelay(3);
      setMode("finished");
      return;
    }
    resetCompressionSet();
    setCurrentSet((previous) => previous + 1);
    setCountdown(3);
    setMode("countdown");
  };

  const calculateFinalStats = () => {
    const finalScore = RhythmCalculator.calculateOverallRhythmScore(
      inTargetCount,
      targetCompressions * totalSets,
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

  const rescueSteps = [
    {
      title: "เปิดทางเดินหายใจ",
      detail: "กดหน้าผากและเชยคางผู้ป่วย เพื่อเปิดทางเดินหายใจให้โล่ง",
      action: "เปิดทางเดินหายใจแล้ว",
    },
    {
      title: "ช่วยหายใจครั้งที่ 1",
      detail: "บีบจมูก เป่าลมเข้าปากผู้ป่วยประมาณ 1 วินาที และสังเกตหน้าอกยกขึ้น",
      action: "ช่วยหายใจครั้งที่ 1 แล้ว",
    },
    {
      title: "ช่วยหายใจครั้งที่ 2",
      detail: "ปล่อยให้ลมออก แล้วช่วยหายใจซ้ำอีก 1 ครั้ง ก่อนกลับไปกดหน้าอก",
      action: "ช่วยหายใจครบ 2 ครั้ง",
    },
  ] as const;
  const currentRescueStep = rescueSteps[rescueStep];
  const showTrainingHeader = mode === "ready" || mode === "countdown" || mode === "compressing";

  return (
    <div className="page-stack training-screen cpr-training" data-mode={mode}>
      {showTrainingHeader && <header>
        <div className="training-title-row"><h1 className="page-title">ฝึกจังหวะ CPR</h1><span>ขั้น 3/3</span></div>
        {mode !== 'compressing' && <p className="caption mt-2">ฝึกด้วยการแตะหน้าจอ ไม่ใช่การวัดแรงกดหรือความลึกจริง</p>}
      </header>}
      {mode === "ready" && (
        <section className="cpr-ready">
          <div>
            <h2 className="section-title">สุ่มได้ {totalSets} เซ็ต</h2>
            <p>เป้าหมาย 100–120 ครั้ง/นาที</p>
            <p className="caption mt-2">
              เซ็ตละ {targetCompressions} ครั้ง · แตะ 1 ครั้งแทนการกดหน้าอก 1 ครั้ง
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
          <p className="cpr-target">เซ็ต {currentSet}/{totalSets} · เป้าหมาย 100–120 ครั้ง/นาที</p>
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
        <section className="cpr-action-step cpr-choice-step">
          <div>
            <p className="protocol-code">จบเซ็ต {currentSet} จาก {totalSets}</p>
            <h2 className="page-title">เคยฝึกช่วยหายใจภาคปฏิบัติหรือไม่?</h2>
            <p className="caption mt-3">เลือกตามประสบการณ์ที่ได้รับจากครูฝึก ไม่ใช่ผลจากแบบฝึกบนเว็บ</p>
            {actionDelay > 0 && <p className="action-delay" role="status">อ่านก่อนเลือก · กดได้ใน {actionDelay} วินาที</p>}
          </div>
          <div className="cpr-choice-grid">
            <button
              className="cpr-choice-card"
              onClick={() => {
                setActionDelay(3);
                setMode("rescuing");
              }}
              disabled={actionDelay > 0}
            >
              <span><strong>เคยฝึกภาคปฏิบัติ</strong><small>ทบทวนการช่วยหายใจ 2 ครั้ง</small></span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button
              className="cpr-choice-card"
              onClick={advanceAfterSet}
              disabled={actionDelay > 0}
            >
              <span><strong>ยังไม่เคยหรือไม่แน่ใจ</strong><small>กดหน้าอกต่อและทำตาม 1669</small></span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
          <aside className="notice">
            เว็บไซต์นี้ไม่รับรองทักษะช่วยหายใจ ในเหตุจริงให้เปิดลำโพงโทรศัพท์และทำตามคำแนะนำของเจ้าหน้าที่ 1669
          </aside>
        </section>
      )}
      {mode === "rescuing" && (
        <section className="cpr-action-step">
          <div className="cpr-action-progress" aria-label={`ขั้นช่วยหายใจ ${rescueStep + 1} จาก 3`}>
            {rescueSteps.map((step, index) => <span key={step.title} data-current={index === rescueStep} data-complete={index < rescueStep} />)}
          </div>
          <div className="cpr-current-action">
            <p className="protocol-code">การกระทำปัจจุบัน · {rescueStep + 1}/3</p>
            <h2 className="page-title">{currentRescueStep.title}</h2>
            <p>{currentRescueStep.detail}</p>
          </div>
          <button
            className="primary-button cpr-action-button"
            onClick={handleRescueStepClick}
            disabled={actionDelay > 0}
          >
            {actionDelay > 0 ? `อ่านขั้นตอนก่อน · ${actionDelay}` : currentRescueStep.action}
            <ArrowRight size={20} />
          </button>
        </section>
      )}
      {mode === "finished" && (
        <section className="cpr-action-step cpr-finished-step">
          <div className="cpr-finish-celebration" aria-live="polite">
            <span className="cpr-finish-icon"><BadgeCheck aria-hidden="true" /></span>
            <Sparkles className="cpr-finish-spark cpr-finish-spark-left" aria-hidden="true" />
            <Sparkles className="cpr-finish-spark cpr-finish-spark-right" aria-hidden="true" />
            <p className="protocol-code">ทำครบ {totalSets} เซ็ต</p>
            <h2 className="page-title">ภารกิจ CPR สำเร็จ</h2>
            <p>คุณรักษาจังหวะจนจบการฝึกแล้ว พร้อมดูผลรวมของภารกิจนี้</p>
          </div>
          <button className="primary-button cpr-action-button" onClick={handleFinish} disabled={actionDelay > 0}>
            {actionDelay > 0 ? `กำลังสรุปผล · ${actionDelay}` : "ดูผลการฝึกหลัก"}
            <ArrowRight size={20} />
          </button>
        </section>
      )}
    </div>
  );
};
