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
      <h3>สถานะการตรวจทาน</h3>
      <p>ยังไม่มีหลักฐานการตรวจทานที่บันทึกในระบบ จึงยังไม่ระบุว่าได้รับการรับรอง</p>
      <p>ผู้ดูแลแจ้งว่าครูฝึกตรวจเนื้อหาเดิมเมื่อ 6 ตุลาคม 2569 แต่ยังไม่มีชื่อผู้ตรวจหรือเอกสารยืนยัน เนื้อหาและภาพที่เพิ่มภายหลังยังต้องตรวจทาน</p>
      <h3>แหล่งอ้างอิง</h3>
      <ul><li><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support" target="_blank" rel="noopener noreferrer">AHA 2025: การช่วยชีวิตขั้นพื้นฐานสำหรับผู้ใหญ่</a></li><li><a href="https://www.redcross.org/take-a-class/cpr/performing-cpr/cpr-steps" target="_blank" rel="noopener noreferrer">American Red Cross: ขั้นตอน CPR</a></li></ul>
      <p>ปรับปรุงเนื้อหาล่าสุด: {MAIN_PROTOCOL_METADATA.lastUpdated}</p>
      <h3>ข้อจำกัดของสื่อ</h3>
      <p>สื่อฝึกจำลอง ไม่ทดแทนการฝึกภาคปฏิบัติหรือการประเมินด้วยอุปกรณ์มาตรฐาน</p>
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
