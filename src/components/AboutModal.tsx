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
            เครื่องมือเสริมการเรียนรู้และฝึกทบทวนสถานการณ์ฉุกเฉินสำหรับนักศึกษาวิชาทหาร
            ROTC37
          </p>
        </section>
        <section>
          <h3 className="section-title">ใช้สำหรับฝึกอะไร</h3>
          <p>
            ประเมินและเรียงลำดับการช่วยเหลือ แจ้งเหตุ 1669 ฝึกจังหวะกดหน้าอก
            และทบทวนการใช้ AED
          </p>
        </section>
        <section>
          <h3 className="section-title">ข้อจำกัดของต้นแบบ</h3>
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
          <p>ROTC37 · หน่วยฝึก นศท. มทบ.37</p>
          <p className="caption mt-2">
            ศูนย์วันอังคาร โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย
          </p>
          <p className="content-meta mt-4 break-all">
            Protocol: {MAIN_PROTOCOL_METADATA.protocolId}
            <br />
            Version: {MAIN_PROTOCOL_METADATA.version}
          </p>
        </section>
        <button className="primary-button" onClick={onClose}>
          กลับไปใช้งาน
        </button>
      </div>
    </AppDialog>
  );
}
