import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { ReactNode } from "react";
import { MAIN_PROTOCOL_METADATA } from "@/data/scenarios";

export function SimulationNotice() {
  return (
    <aside className="notice">
      <strong className="font-semibold">โหมดฝึกจำลอง</strong>
      <p>
        ไม่มีการโทร 1669 จริง และไม่ทดแทนการฝึกภาคปฏิบัติกับครูฝึก
      </p>
    </aside>
  );
}
export function ContentMetadata() {
  return (
    <div className="content-meta section-rule">
      <p>ตรวจทานเนื้อหาโดย: ยังไม่ระบุ — รอครูฝึกและผู้เชี่ยวชาญตรวจทาน</p>
      <p>
        อ้างอิงหลัก: สภากาชาดไทย, สพฉ., เอกสารนักศึกษาวิชาทหาร
        หน่วยบัญชาการรักษาดินแดน และ AHA Guidelines 2025
      </p>
      <p>ปรับปรุงเนื้อหาล่าสุด: {MAIN_PROTOCOL_METADATA.lastUpdated}</p>
      <p>สถานะ: รอครูฝึกและผู้เชี่ยวชาญรับรองก่อนนำไปใช้จริง</p>
    </div>
  );
}
export function FeedbackPanel({
  state,
  children,
}: {
  state: "correct" | "incomplete" | "incorrect";
  children: ReactNode;
}) {
  return (
    <div className="feedback-panel" role="status" aria-live="polite">
      <p className="feedback-title" data-state={state}>
        {state === "correct" ? (
          <CircleCheck size={20} />
        ) : state === "incomplete" ? (
          <CircleAlert size={20} />
        ) : (
          <CircleX size={20} />
        )}{" "}
        {state === "correct"
          ? "ข้อมูลครบถ้วน"
          : state === "incomplete"
            ? "ยังขาดข้อมูลสำคัญ"
            : "ข้อมูลยังไม่ตรงคำถาม"}
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
  state?: "default" | "selected" | "correct" | "incomplete" | "incorrect";
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
      {state === "incomplete" && <CircleAlert size={20} className="shrink-0" />}
      {state === "incorrect" && <CircleX size={20} className="shrink-0" />}
    </button>
  );
}
