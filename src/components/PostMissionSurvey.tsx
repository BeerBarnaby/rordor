"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { SatisfactionSurvey } from "./SatisfactionSurvey";

export function shouldOfferPostMissionSurvey(completedAttempts: number) {
  return completedAttempts === 0;
}

export function PostMissionSurvey({ isLoggedIn, onLogin }: { isLoggedIn: boolean; onLogin: () => void }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  if (open) {
    return <SatisfactionSurvey isLoggedIn={isLoggedIn} onLogin={onLogin} />;
  }

  return (
    <aside className="post-mission-survey" aria-labelledby="post-mission-survey-title">
      <MessageSquareText aria-hidden="true" />
      <div>
        <p className="protocol-code">ใช้เวลาไม่ถึง 1 นาที</p>
        <h2 id="post-mission-survey-title">ช่วยประเมินน้องพร้อม</h2>
        <p>ความคิดเห็นของคุณช่วยให้เราปรับบทเรียนและการฝึกครั้งต่อไป</p>
      </div>
      <div className="post-mission-survey-actions">
        <button className="primary-button" type="button" onClick={() => setOpen(true)}>เริ่มประเมิน</button>
        <button className="text-button" type="button" onClick={() => setDismissed(true)}>ไว้ทีหลัง</button>
      </div>
    </aside>
  );
}
