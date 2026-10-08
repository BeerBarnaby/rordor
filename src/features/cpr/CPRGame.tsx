"use client";

import React, { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { RhythmCalculator } from "@/lib/rhythmCalculator";
import { RhythmCalculationResult } from "@/types";
import { ArrowRight, Timer } from "lucide-react";
import Image from 'next/image';
import { METRONOME_BPM, playCue, soundEnabled, startMetronome, subscribeSound, unlockAudio } from '@/lib/trainingAudio';
function subscribeVisibility(callback: () => void) { document.addEventListener('visibilitychange', callback); return () => document.removeEventListener('visibilitychange', callback); }
function visibleSnapshot() { return document.visibilityState !== 'hidden'; }

interface CPRGameProps {
  active?: boolean;
  targetCompressions?: number;
  onCompleteStep: (rhythmScore: number, averageBpm: number, audioGuided?: boolean) => void;
}

export const CPRGame: React.FC<CPRGameProps> = ({
  targetCompressions = 30,
  active = true,
  onCompleteStep,
}) => {
  const enabled = useSyncExternalStore(subscribeSound, soundEnabled, () => false);
  const visible = useSyncExternalStore(subscribeVisibility, visibleSnapshot, () => true);
  const [guide, setGuide] = useState(false);
  const usedGuide = useRef(false);
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
  useEffect(() => {
    if (!enabled || !guide || !active || !visible || mode !== 'compressing') return;
    usedGuide.current = true;
    return startMetronome();
  }, [enabled, guide, active, visible, mode]);
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
    onCompleteStep(finalScore, avgBpm, usedGuide.current);
  };

  return (
    <div className="page-stack training-screen cpr-training" data-mode={mode}>
      <header>
        <p className="protocol-code">ขั้น 03 · จังหวะกดหน้าอก</p>
        <h1 className="page-title">ฝึกจังหวะ CPR</h1>
        {mode !== 'compressing' && <p className="caption mt-2">ฝึกด้วยการแตะหน้าจอ ไม่ใช่การวัดแรงกดหรือความลึกจริง</p>}
      </header>
      {(mode === 'ready' || mode === 'compressing') && <details className="reference-details cpr-audio-options">
        <summary>ตัวช่วยเสียง · {guide && enabled ? 'เปิด' : 'ปิด'}</summary>
        <button className="secondary-button" aria-pressed={guide && enabled} disabled={!enabled} onClick={() => { unlockAudio(); setGuide(value => !value); }}>เสียงนำจังหวะ {METRONOME_BPM} ครั้ง/นาที: {guide && enabled ? 'เปิด' : 'ปิด'}</button>
        <p className="caption mt-2">{enabled ? 'เปิดได้เพื่อฝึกตามเสียง จะแสดงในผลว่าใช้เสียงช่วยฝึก' : 'เปิดเสียงที่รูปเสียงด้านบนก่อน หากต้องการเสียงช่วยจับจังหวะ'}</p>
      </details>}
      {mode === "ready" && (
        <section className="cpr-ready">
          <Image className="cpr-ready-cover" src="/images/training/lesson-cpr-v1.png" width={1536} height={1024} sizes="240px" alt="ภาพประกอบบทฝึกจังหวะ: นักศึกษาวิชาทหารกับหุ่นฝึก ไม่ใช่ภาพสาธิตตำแหน่งมือ" />
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
              playCue('select');
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
