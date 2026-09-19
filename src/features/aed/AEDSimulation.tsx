"use client";
import { useState, useRef, useEffect } from "react";
import { AED_STEPS } from "@/data/scenarios";
import { ArrowRight, CircleCheck, Zap } from "lucide-react";
export function AEDSimulation({
  onCompleteStep,
}: {
  onCompleteStep: (score: number, mistakes: string[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const step = AED_STEPS[index];
  const actions = [
    "เปิดเครื่อง AED",
    "ติดแผ่นนำไฟฟ้าแล้ว",
    "ทุกคนถอย เริ่มวิเคราะห์",
    "เคลียร์พื้นที่แล้ว กดช็อกจำลอง",
    "กลับเข้าสู่ CPR",
  ];
  function advance() {
    if (analyzing || !step) return;
    if (index === 2) {
      setAnalyzing(true);
      timer.current = setTimeout(() => {
        setAnalyzing(false);
        setIndex(3);
      }, 2000);
    } else setIndex(index + 1);
  }
  return (
    <div className="page-stack training-screen aed-training">
      <header>
        <p className="protocol-code">ขั้น 04 · เครื่อง AED</p>
        <h1 className="page-title">ใช้ AED</h1>
        <p className="lead mt-3">
          เครื่อง AED มาถึงแล้ว ปฏิบัติตามคำแนะนำทีละขั้น
        </p>
      </header>
      {step ? (
        <>
          <p className="caption">
            ขั้นตอน AED {index + 1} จาก {AED_STEPS.length}
          </p>
          <section className="aed-console" aria-live="polite">
            <p className="caption">คำแนะนำจากเครื่องจำลอง</p>
            <h2 className="section-title mt-3">
              {step.title.replace(/^\d+\. /, "")}
            </h2>
            <p>
              {analyzing
                ? "กำลังวิเคราะห์จังหวะหัวใจ… ห้ามสัมผัสตัวผู้ป่วย"
                : step.description}
            </p>
          </section>
          {(index === 2 || index === 3) && (
            <aside className="notice">
              ตรวจว่าไม่มีใครสัมผัสผู้ป่วย ก่อนให้เครื่องวิเคราะห์หรือช็อก
            </aside>
          )}
          {index === 3 && (
            <p className="caption">
              หากเครื่องแจ้งว่า “ไม่แนะนำให้ช็อก” ให้กลับไปกดหน้าอกทันที
              โดยไม่ถอดแผ่น AED
            </p>
          )}
          <button
            className="primary-button aed-primary-button self-start"
            disabled={analyzing}
            onClick={advance}
          >
            {index === 3 && <Zap size={20} />}{" "}
            {analyzing ? "กำลังวิเคราะห์…" : actions[index]}
            {index !== 3 && <ArrowRight size={20} />}
          </button>
        </>
      ) : (
        <>
          <div role="status" className="flex items-start gap-3">
            <CircleCheck
              size={24}
              className="text-[var(--color-success)] shrink-0"
            />
            <div>
              <h2 className="section-title">ทบทวนการใช้ AED ครบแล้ว</h2>
              <p>คุณปฏิบัติตามคำแนะนำครบทั้ง 5 ขั้นตอน</p>
            </div>
          </div>
          <button
            className="primary-button aed-primary-button self-start"
            onClick={() => onCompleteStep(100, [])}
          >
            ดูผลการฝึก
            <ArrowRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
