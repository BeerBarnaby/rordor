"use client";
import { AppDialog } from "./AppDialog";
import { ContentMetadata } from "./TrainingUI";
import { MAIN_PROTOCOL_METADATA } from "@/data/scenarios";
import Image from 'next/image';
import { PromMark } from './PromMark';
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
            <strong>น้องพร้อม (NONG PROM)</strong> เป็นเว็บฝึกปฐมพยาบาลและ CPR สำหรับนักศึกษาวิชาทหาร
          </p>
        </section>
        <section>
          <h3 className="section-title">ใช้สำหรับฝึกอะไร</h3>
          <p>
            ฝึกประเมินเหตุ โทรแจ้ง 1669 และจังหวะ CPR พร้อมดูผลหลังฝึก มี AED เป็นบทเสริม
          </p>
        </section>
        <section>
          <h3 className="section-title">ข้อจำกัดของต้นแบบ</h3>
          <p className="notice mb-5">
            <strong>เป็นการฝึกจำลอง ไม่ใช่การรับรองทักษะช่วยชีวิต</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>ไม่ทดแทนการฝึกภาคปฏิบัติกับครูฝึกหรือหุ่นฝึกมาตรฐาน</li>
            <li>
              วัดเฉพาะจังหวะแตะหน้าจอ ไม่วัดความลึก ตำแหน่งมือ แรงกด
              หรือการคืนตัวของหน้าอก
            </li>
            <li>ไม่มีการโทร 1669 หรือเชื่อมต่อเครื่อง AED จริง</li>
            <li>โหมด Guest เก็บผลไว้ในเบราว์เซอร์นี้ ส่วนโปรไฟล์ผู้เล่นใช้เก็บคะแนนบนลีดเดอร์บอร์ดข้ามเครื่อง</li>
          </ul>
        </section>
        <section>
          <h3 className="section-title">แหล่งอ้างอิงและผู้ตรวจทาน</h3>
          <ContentMetadata />
        </section>
        <section>
          <h3 className="section-title">ข้อมูลโครงการ</h3>
          <div className="project-identity">
            <PromMark className="project-mark" />
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
          <section className="organization-list" aria-label="หน่วยงานที่เกี่ยวข้องกับโครงการ">
            <a className="organization-item" href="https://www.facebook.com/rotc37CR/photos/403117162301787/" target="_blank" rel="noopener noreferrer">
              <Image src="/images/organizations/rotc37-transparent-v1.png" width={1024} height={1024} sizes="72px" alt="ตราหน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37" />
              <span><strong>หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37</strong><small>เพจหน่วยฝึก ↗</small></span>
            </a>
            <a className="organization-item" href="https://www.pcccr.ac.th/" target="_blank" rel="noopener noreferrer">
              <Image src="/images/organizations/pcshs-chiangrai.png" width={200} height={307} sizes="72px" alt="ตราโรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย" />
              <span><strong>โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย</strong><small>เว็บไซต์โรงเรียน ↗</small></span>
            </a>
          </section>
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
            แบบอักษร Prompt ออกแบบโดย Cadson Demak ใช้งานภายใต้ SIL Open Font
            License 1.1
          </p>
        </section>
        <button className="primary-button" onClick={onClose}>
          กลับไปใช้งาน
        </button>
      </div>
    </AppDialog>
  );
}
