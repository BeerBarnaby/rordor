"use client";
import { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { ArrowRight, ShieldAlert, Power } from "lucide-react";
import { advanceAED, type AEDRecommendation, type AEDState } from "@/lib/aedTraining";

const instructions: Record<AEDState, { title: string; detail: string; action: string; step: number }> = {
  power: { title: "เปิดเครื่อง AED", detail: "กดปุ่มเปิดเครื่อง หรือเปิดฝาเครื่องตามรุ่น แล้วทำตามเสียงคำแนะนำ", action: "เปิดเครื่องจำลอง", step: 1 },
  pads: { title: "ติดแผ่นตามภาพกำกับ", detail: "เปิดหน้าอก เช็ดผิวให้แห้ง แล้วติดแผ่นตามภาพกำกับของเครื่อง", action: "ทบทวนการติดแผ่นแล้ว", step: 2 },
  clear: { title: "ให้ทุกคนถอยออก", detail: "ตรวจว่าไม่มีใครสัมผัสผู้ป่วย ก่อนเริ่มวิเคราะห์", action: "ทุกคนถอยแล้ว เริ่มวิเคราะห์", step: 3 },
  analyzing: { title: "เครื่องกำลังวิเคราะห์", detail: "ห้ามสัมผัสตัวผู้ป่วยขณะเครื่องกำลังวิเคราะห์จังหวะหัวใจ", action: "กำลังวิเคราะห์…", step: 3 },
  shock: { title: "เครื่องจำลองแนะนำให้ช็อก", detail: "ตรวจว่าไม่มีใครสัมผัสผู้ป่วย แล้วกดปุ่มช็อกเฉพาะเมื่อเครื่องสั่ง", action: "เคลียร์พื้นที่แล้ว ช็อกจำลอง", step: 4 },
  'no-shock': { title: "เครื่องไม่แนะนำให้ช็อก", detail: "ไม่กดปุ่มช็อก กลับเข้าสู่ CPR โดยไม่ถอดแผ่น AED", action: "รับทราบ ไม่ช็อก", step: 4 },
  resume: { title: "กลับไปกดหน้าอกทันที", detail: "ไม่ว่าเครื่องจะแนะนำให้ช็อกหรือไม่ ไม่ถอดแผ่น AED และทำตามคำแนะนำของเครื่องต่อ", action: "ทบทวนครบ ดูผลการฝึก", step: 5 },
  complete: { title: "ทบทวน AED ครบแล้ว", detail: "การทบทวนนี้ไม่ได้วัดทักษะการใช้เครื่องจริง", action: "ดูผลการฝึก", step: 5 },
};
const tasks: Partial<Record<AEDState, [string, string][]>> = {
  power: [['เปิดเครื่อง', 'ทำตามเสียงคำแนะนำของเครื่อง'], ['เตรียมขั้นต่อไป', 'อ่านภาพกำกับบนแผ่น AED']],
  pads: [['เตรียมผิวหน้าอก', 'เปิดหน้าอกและเช็ดผิวให้แห้ง'], ['ติดแผ่นตามภาพกำกับ', 'ภาพนี้เป็นตัวอย่างผู้ใหญ่ ให้ยึดภาพบนแผ่นของเครื่องที่ใช้เป็นหลัก']],
  clear: [['ตรวจรอบตัวผู้ป่วย', 'ตรวจว่าไม่มีมือหรือคนสัมผัสผู้ป่วย'], ['แจ้งให้ทุกคนถอย', 'รอจนทุกคนอยู่ห่างจากผู้ป่วย']],
  shock: [['ตรวจอีกครั้ง', 'ต้องไม่มีใครสัมผัสผู้ป่วย'], ['ทำตามเครื่องสั่ง', 'กดปุ่มช็อกเมื่อเครื่องแนะนำเท่านั้น']],
  'no-shock': [['ไม่กดปุ่มช็อก', 'ทำตามคำแนะนำของเครื่อง'], ['เตรียมกลับไป CPR', 'ไม่ถอดแผ่น AED ออก']],
  resume: [['ไม่ถอดแผ่น AED', 'ทำตามคำแนะนำของเครื่องต่อ'], ['ในบทเรียนนี้ไปหน้าสรุป', 'ในการช่วยจริง ให้กลับไปทำ CPR ทันที']],
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
    if (active) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [state, active]);
  useEffect(() => {
    if (state !== 'analyzing' || !active) return;
    const timer = setTimeout(() => setState(previous => advanceAED(previous, 'analysis-complete', recommendation)), 2000);
    return () => clearTimeout(timer);
  }, [state, recommendation, active]);
  const deviceStatus = state === 'power' ? 'ยังไม่เปิดเครื่อง' : state === 'pads' ? 'รอติดแผ่นนำไฟฟ้า' : state === 'clear' ? 'รอเคลียร์พื้นที่' : state === 'analyzing' ? 'กำลังวิเคราะห์' : state === 'shock' ? 'แนะนำให้ช็อก' : state === 'no-shock' ? 'ไม่แนะนำให้ช็อก' : 'กลับเข้าสู่ CPR';
  const safety = ['clear', 'analyzing', 'shock'].includes(state);
  const illustrated = state === 'clear' || state === 'shock';
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
    <div className="aed-task" data-state={state}>
      <p className="caption">AED · ขั้น {instruction.step} จาก 5 · เครื่องจำลอง</p>
      <section className="aed-current-task" aria-live="polite" aria-atomic="true">
        <h1 className="page-title">{instruction.title}</h1>
        <p className="aed-instruction">{instruction.detail}</p>
      </section>
      <div className="aed-task-grid">
      <div className="aed-visual">
      {illustrated ? <Image className="aed-scene-image" src="/images/training/prom-aed-clear-v1.png" alt="น้องพร้อมยกมือให้ทุกคนอยู่ห่างจากหุ่นฝึก เป็นภาพประกอบการเคลียร์พื้นที่ ไม่ใช่ภาพตำแหน่งติดแผ่น" width={1536} height={1024} sizes="(min-width: 1024px) 480px, (min-width: 768px) 568px, 100vw" /> : state === 'pads' ? <figure className="aed-pad-figure"><Image className="aed-pads-image" src="/images/training/aed-pads-adult-v1.png" alt="ตัวอย่างผู้ใหญ่: แผ่นหนึ่งบนหน้าอกขวาใต้ไหปลาร้า อีกแผ่นด้านข้างหน้าอกซ้ายใต้รักแร้ โดยขวาของผู้ป่วยอยู่ซ้ายของภาพ" width={1586} height={992} sizes="(min-width: 1024px) 480px, (min-width: 768px) 568px, 100vw" /><figcaption className="caption">ตัวอย่างตำแหน่งสำหรับผู้ใหญ่ · ทำตามภาพกำกับบนแผ่นของเครื่องที่ใช้</figcaption></figure> : <div className="aed-device-panel" data-state={state}>
        <div className="aed-device-label"><span>AED</span><small>เครื่องฝึกจำลอง</small></div>
        <div className="aed-device-display"><span className="caption">สถานะเครื่อง</span><strong>{deviceStatus}</strong></div>
      </div>}
      </div>
      <div className="aed-work">
      {tasks[state] && <ol className="aed-instruction-list">{tasks[state]?.map(([title, detail]) => <li key={title}><strong>{title}</strong><p>{detail}</p></li>)}</ol>}
      {(illustrated || state === 'pads') && <p className="caption">เครื่องจำลอง · {deviceStatus}</p>}
      {safety && <aside className="aed-safety" role="note"><ShieldAlert size={22} aria-hidden="true" /><span><strong>ห้ามสัมผัสผู้ป่วย</strong><br />ขณะวิเคราะห์หรือช็อก ต้องให้ทุกคนถอยออกก่อน</span></aside>}
      {state === 'no-shock' && <aside className="aed-safety" role="note"><ShieldAlert size={22} aria-hidden="true" /><span><strong>ไม่แนะนำให้ช็อก ไม่ได้หมายความว่าผู้ป่วยฟื้นแล้ว</strong><br />กลับไปทำ CPR ทันที และทำตามคำแนะนำของเครื่องต่อ</span></aside>}
      <button className="primary-button aed-task-action" disabled={state === 'analyzing' || !active || state === 'complete'} onClick={proceed}>
        {state === 'power' && <Power size={20} aria-hidden="true" />}{instruction.action}<ArrowRight size={20} aria-hidden="true" />
      </button>
      <details className="reference-details" key={state}><summary>ดูเหตุผลของขั้นตอนนี้</summary><p className="caption">{state === 'pads' ? 'แผ่นนำไฟฟ้าต้องสัมผัสผิวตามตำแหน่งที่เครื่องกำหนด ภาพนี้ใช้ทบทวนตัวอย่างผู้ใหญ่ ไม่ใช้แทนคำแนะนำเฉพาะรุ่น' : safety ? 'ทุกคนต้องไม่สัมผัสผู้ป่วยระหว่างวิเคราะห์หรือช็อก ให้เครื่องทำงานและปฏิบัติตามคำสั่งทีละขั้น' : 'ผลวิเคราะห์เป็นสถานการณ์จำลอง ทั้งกรณีช็อกและไม่ช็อกต้องกลับไปทำ CPR ตามคำแนะนำเครื่อง การกดครบไม่ใช่คะแนนทักษะ'}</p></details>
      </div>
      </div>
      <p className="caption">สื่อเสริมการฝึก ไม่ทดแทนการฝึกภาคปฏิบัติกับครูฝึก</p>
    </div>
  );
}
