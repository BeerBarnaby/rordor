"use client";
import { useState } from 'react';
import { AEDSimulation } from './AEDSimulation';
import type { AEDRecommendation } from '@/lib/aedTraining';

export function AEDPractice({ active, onClose }: { active: boolean; onClose: () => void }) {
  const [recommendation, setRecommendation] = useState<AEDRecommendation>('shock');
  const [round, setRound] = useState(0);
  const [completed, setCompleted] = useState(false);
  if (!completed) return <AEDSimulation key={round} active={active} recommendation={recommendation} onCompleteStep={() => setCompleted(true)} />;
  return <section className="page-stack training-screen">
    <p className="protocol-code">ภารกิจเสริม · AED</p>
    <h1 className="page-title">จบภารกิจ AED แล้ว</h1>
    <p>เครื่องจำลอง{recommendation === 'shock' ? 'แนะนำให้ช็อก' : 'ไม่แนะนำให้ช็อก'} — ทั้งสองกรณีต้องกลับไปทำ CPR ตามคำแนะนำเครื่อง</p>
    <p className="caption">โหมดทบทวนนี้ไม่เพิ่ม XP หรือคะแนนทักษะ</p>
    <button className="primary-button" onClick={() => { setRecommendation(recommendation === 'shock' ? 'no-shock' : 'shock'); setRound(r => r + 1); setCompleted(false); }}>ฝึกอีกผลวิเคราะห์</button>
    <button className="secondary-button" onClick={onClose}>กลับหน้าเลือกภารกิจ</button>
  </section>;
}
