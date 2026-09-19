"use client";
import { AppDialog } from "./AppDialog";
import { ContentMetadata } from "./TrainingUI";
import { MAIN_PROTOCOL_METADATA } from "@/data/scenarios";
export function AboutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AppDialog open={isOpen} onClose={onClose} title="เกี่ยวกับน้องพร้อม">
      <div className="dialog-body page-stack">
        <section>
          <h3 className="section-title">น้องพร้อมคืออะไร</h3>
          <p>
            <strong>น้องพร้อม (NONG PROM)</strong> เป็นเว็บแอปพลิเคชันต้นแบบสำหรับเสริมการเรียนรู้และฝึกทบทวนการปฐมพยาบาลและการช่วยชีวิตขั้นพื้นฐานสำหรับนักศึกษาวิชาทหาร
          </p>
        </section>
        <section>
          <h3 className="section-title">ใช้สำหรับฝึกอะไร</h3>
          <p>
            ผู้เรียนสามารถฝึกการประเมินสถานการณ์ การเรียงลำดับขั้นตอนการช่วยเหลือ การแจ้งเหตุ 1669 การรักษาจังหวะการกดหน้าอก และทบทวนการใช้ AED ผ่านสถานการณ์จำลอง พร้อมรับข้อมูลย้อนกลับหลังการฝึก
          </p>
        </section>
        <section>
          <h3 className="section-title">ข้อจำกัดของต้นแบบ</h3>
          <p className="notice mb-5">
            <strong>น้องพร้อมเป็นสื่อเสริมการเรียนรู้และการฝึกจำลอง ไม่ใช้ทดแทนการฝึกภาคปฏิบัติหรือการประเมินทักษะด้วยอุปกรณ์มาตรฐาน</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>ไม่ทดแทนการฝึกภาคปฏิบัติกับครูฝึกหรือหุ่นฝึกมาตรฐาน</li>
            <li>
              วัดเฉพาะจังหวะแตะหน้าจอ ไม่วัดความลึก ตำแหน่งมือ แรงกด
              หรือการคืนตัวของหน้าอก
            </li>
            <li>ไม่มีการโทร 1669 หรือเชื่อมต่อเครื่อง AED จริง</li>
            <li>ผลฝึกเก็บเฉพาะเบราว์เซอร์นี้ การล้างข้อมูลอาจทำให้ผลฝึกหาย</li>
          </ul>
        </section>
        <section>
          <h3 className="section-title">แหล่งอ้างอิงและผู้ตรวจทาน</h3>
          <ContentMetadata />
        </section>
        <section>
          <h3 className="section-title">ข้อมูลโครงการ</h3>
          <div className="project-identity">
            <span className="project-mark" aria-hidden="true">37</span>
            <div>
              <p className="project-label">ชื่อโครงการ</p>
              <p className="project-name">น้องพร้อม (NONG PROM)</p>
              <p className="caption">สื่อฝึกทบทวนการช่วยชีวิตขั้นพื้นฐาน</p>
            </div>
          </div>
          <dl className="project-unit">
            <div>
              <dt>หน่วยงาน</dt>
              <dd>หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37</dd>
            </div>
          </dl>
          <div className="project-credits">
            <section>
              <p className="project-label">ที่ปรึกษาโครงการ</p>
              <ul>
                <li>ร.อ.วศิน บุญกลิ่น</li>
                <li>ส.อ.พัสกร สิทธิยศ</li>
              </ul>
            </section>
            <section>
              <p className="project-label">คณะผู้จัดทำ</p>
              <ol>
                <li>
                  <span>นศท. ปิยเชษฐ์ แสงจันทร์</span>
                  <small>ชั้นปีที่ 3</small>
                </li>
                <li>
                  <span>นศท. แจ็ค คอลิน โอร๊อค</span>
                  <small>ชั้นปีที่ 3</small>
                </li>
                <li>
                  <span>นศท.หญิง ภิรดา เต็มอุ่น</span>
                  <small>ชั้นปีที่ 3</small>
                </li>
                <li>
                  <span>นศท.หญิง นวพรวรพรรณ ชาญทวีศรีสุข</span>
                  <small>ชั้นปีที่ 2</small>
                </li>
                <li>
                  <span>นศท.หญิง ณัทธมนต์ ศรีพิฑูรย์</span>
                  <small>ชั้นปีที่ 2</small>
                </li>
              </ol>
            </section>
          </div>
          <p className="content-meta mt-4 break-all">
            Protocol: {MAIN_PROTOCOL_METADATA.protocolId}
            <br />
            Version: {MAIN_PROTOCOL_METADATA.version}
          </p>
          <p className="content-meta mt-4">
            แบบอักษร LINE Seed Sans TH © LY Corporation ใช้งานภายใต้ SIL Open
            Font License 1.1
          </p>
        </section>
        <button className="primary-button" onClick={onClose}>
          กลับไปใช้งาน
        </button>
      </div>
    </AppDialog>
  );
}
