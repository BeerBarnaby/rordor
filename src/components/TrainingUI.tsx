import { CircleCheck, CircleX } from "lucide-react";
import { ReactNode } from "react";
import { MAIN_PROTOCOL_METADATA } from "@/data/scenarios";

export function SimulationNotice() {
  return (
    <aside className="notice">
      <strong className="font-semibold">โหมดฝึกจำลอง</strong>
      <p>
        ไม่ได้เชื่อมต่อสายด่วน 1669 จริง และไม่ทดแทนการฝึกภาคปฏิบัติกับครูฝึก
      </p>
    </aside>
  );
}
export function ContentMetadata() {
  return (
    <div className="content-meta section-rule">
      <p>ตรวจทานเนื้อหาโดย: ยังไม่ระบุ — รอครูฝึกและผู้เชี่ยวชาญตรวจทาน</p>
      <p>แหล่งอ้างอิงในต้นแบบ: สพฉ. และสภากาชาดไทย</p>
      <p>ปรับปรุงเนื้อหาล่าสุด: {MAIN_PROTOCOL_METADATA.lastUpdated}</p>
      <p>วันที่ตรวจทาน: ยังไม่มีข้อมูล</p>
    </div>
  );
}
export function FeedbackPanel({
  correct,
  children,
}: {
  correct: boolean;
  children: ReactNode;
}) {
  return (
    <div className="feedback-panel" role="status" aria-live="polite">
      <p className="feedback-title" data-correct={correct}>
        {correct ? <CircleCheck size={20} /> : <CircleX size={20} />}{" "}
        {correct ? "ข้อมูลครบถ้วน" : "มีสิ่งที่ควรทบทวน"}
      </p>
      <div>{children}</div>
    </div>
  );
}
export function AnswerOption({
  children,
  state = "default",
  disabled,
  onClick,
}: {
  children: ReactNode;
  state?: "default" | "selected" | "correct" | "incorrect";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="answer-option"
      data-state={state}
      aria-pressed={state !== "default"}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{children}</span>
      {state === "correct" && <CircleCheck size={20} className="shrink-0" />}
      {state === "incorrect" && <CircleX size={20} className="shrink-0" />}
    </button>
  );
}
