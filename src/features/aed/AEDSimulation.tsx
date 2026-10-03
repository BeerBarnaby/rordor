"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldAlert, Power } from "lucide-react";
import { advanceAED, type AEDRecommendation, type AEDState } from "@/lib/aedTraining";

const instructions: Record<AEDState, { title: string; detail: string; action: string; step: number }> = {
  power: { title: "เปิดเครื่อง AED", detail: "กดปุ่มเปิดเครื่อง หรือเปิดฝาเครื่องตามรุ่น แล้วทำตามเสียงคำแนะนำ", action: "เปิดเครื่องจำลอง", step: 1 },
  pads: { title: "ติดแผ่นตามภาพบนแผ่น AED", detail: "เปิดหน้าอก เช็ดผิวให้แห้ง แล้วติดแผ่นตามภาพกำกับของเครื่อง", action: "ทบทวนการติดแผ่นแล้ว", step: 2 },
  clear: { title: "ตรวจว่าไม่มีใครสัมผัสผู้ป่วย", detail: "แจ้งให้ทุกคนถอย ก่อนให้เครื่องวิเคราะห์จังหวะหัวใจ", action: "ทุกคนถอย เริ่มวิเคราะห์", step: 3 },
  analyzing: { title: "เครื่องกำลังวิเคราะห์", detail: "ห้ามสัมผัสตัวผู้ป่วยขณะเครื่องกำลังวิเคราะห์จังหวะหัวใจ", action: "กำลังวิเคราะห์…", step: 3 },
  shock: { title: "เครื่องจำลองแนะนำให้ช็อก", detail: "ตรวจว่าไม่มีใครสัมผัสผู้ป่วย แล้วกดปุ่มช็อกเฉพาะเมื่อเครื่องสั่ง", action: "เคลียร์พื้นที่แล้ว ช็อกจำลอง", step: 4 },
  'no-shock': { title: "เครื่องไม่แนะนำให้ช็อก", detail: "ไม่กดปุ่มช็อก กลับเข้าสู่ CPR โดยไม่ถอดแผ่น AED", action: "รับทราบ ไม่ช็อก", step: 4 },
  resume: { title: "กลับเข้าสู่ CPR", detail: "กลับไปกดหน้าอกทันที ไม่ว่าเครื่องจะแนะนำให้ช็อกหรือไม่ และทำตามคำแนะนำของเครื่องต่อ", action: "ทบทวนครบ ดูผลการฝึก", step: 5 },
  complete: { title: "ทบทวน AED ครบแล้ว", detail: "การทบทวนนี้ไม่ได้วัดทักษะการใช้เครื่องจริง", action: "ดูผลการฝึก", step: 5 },
};
export function AEDSimulation({ onCompleteStep, recommendation = 'shock', active = true }: {
  onCompleteStep: (recommendation: AEDRecommendation) => void;
  recommendation?: AEDRecommendation;
  active?: boolean;
}) {
  const [state, setState] = useState<AEDState>('power');
  const completed = useRef(false);
  const instruction = instructions[state];
  useEffect(() => {
    if (state !== 'analyzing' || !active) return;
    const timer = setTimeout(() => setState(previous => advanceAED(previous, 'analysis-complete', recommendation)), 2000);
    return () => clearTimeout(timer);
  }, [state, recommendation, active]);
  const deviceStatus = state === 'power' ? 'ยังไม่เปิดเครื่อง' : state === 'pads' ? 'รอติดแผ่นนำไฟฟ้า' : state === 'clear' ? 'รอเคลียร์พื้นที่' : state === 'analyzing' ? 'กำลังวิเคราะห์' : state === 'shock' ? 'แนะนำให้ช็อก' : state === 'no-shock' ? 'ไม่แนะนำให้ช็อก' : 'กลับเข้าสู่ CPR';
  const safety = ['clear', 'analyzing', 'shock'].includes(state);
  function proceed() {
    if (!active || completed.current || state === 'analyzing' || state === 'complete') return;
    const next = advanceAED(state, 'continue', recommendation);
    setState(next);
    if (next === 'complete') {
      completed.current = true;
      onCompleteStep(recommendation);
    }
  }
  return (
    <div className="aed-task training-screen">
      <p className="caption">ทบทวน AED · ขั้น {instruction.step} จาก 5 · เครื่องจำลอง</p>
      <section className="aed-current-task" aria-live="polite" aria-atomic="true">
        <h1 className="page-title">{instruction.title}</h1>
        <p className="aed-instruction">{instruction.detail}</p>
      </section>
      <div className="aed-device-panel" data-state={state}>
        <div className="aed-device-label"><span>AED</span><small>เครื่องฝึกจำลอง</small></div>
        <div className="aed-device-display"><span className="caption">สถานะเครื่อง</span><strong>{deviceStatus}</strong></div>
      </div>
      {safety && <aside className="aed-safety" role="note"><ShieldAlert size={22} aria-hidden="true" /><span><strong>ห้ามสัมผัสผู้ป่วย</strong><br />ขณะวิเคราะห์หรือช็อก ต้องให้ทุกคนถอยออกก่อน</span></aside>}
      <button className="primary-button aed-task-action" disabled={state === 'analyzing' || !active || state === 'complete'} onClick={proceed}>
        {state === 'power' && <Power size={20} aria-hidden="true" />}{instruction.action}<ArrowRight size={20} aria-hidden="true" />
      </button>
      <details className="reference-details"><summary>เกี่ยวกับการทบทวนนี้</summary><p className="caption">ทำตามคำสั่งทีละขั้น ผลวิเคราะห์เป็นสถานการณ์จำลอง ไม่ใช่การวินิจฉัยจริง การกดครบไม่ใช่คะแนนทักษะ และไม่ทดแทนการฝึกกับครูฝึกหรือเครื่องฝึกมาตรฐาน</p></details>
    </div>
  );
}
