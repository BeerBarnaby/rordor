import Image from 'next/image';
import { ArrowRight, ShieldCheck, PhoneCall, Timer } from 'lucide-react';

export function MissionMenu({ continuing, onMain, onAED }: { continuing: boolean; onMain: () => void; onAED: () => void }) {
  return <section className="mission-menu">
    <header className="mission-menu-heading">
      <p className="protocol-code">ฝึกสถานการณ์</p>
      <h1 className="page-title">เลือกภารกิจ</h1>
      <p>ฝึกได้เลย ไม่ต้องเข้าสู่ระบบ</p>
    </header>
    <div className="mission-choice-grid">
      <section className="mission-choice mission-choice-main" aria-labelledby="core-mission-title">
        <div className="mission-choice-heading">
          <div><span className="mission-choice-label">ภารกิจหลัก</span><h2 id="core-mission-title">ช่วยเพื่อนหมดสติ</h2><p>ประเมินเหตุ โทรแจ้ง และเริ่ม CPR</p></div>
          <Image src="/images/training/lesson-assessment-v1.png" width={1586} height={992} sizes="120px" alt="" />
        </div>
        <ol className="mission-mini-route" aria-label="เส้นทางภารกิจหลัก">
          <li><ShieldCheck size={18} aria-hidden="true" /><span>ประเมินเหตุ</span></li>
          <li><PhoneCall size={18} aria-hidden="true" /><span>โทร 1669</span></li>
          <li><Timer size={18} aria-hidden="true" /><span>จังหวะ CPR</span></li>
        </ol>
        <p className="mission-choice-meta">3 ขั้น · ประมาณ 5 นาที · มีสรุปผล{continuing && <span>มีภารกิจที่ฝึกค้างไว้ในหน้านี้</span>}</p>
        <button className="primary-button" onClick={onMain}>{continuing ? 'ฝึกต่อ' : 'เริ่มฝึก'}<ArrowRight size={20} aria-hidden="true" /></button>
      </section>
      <section className="mission-choice mission-choice-extra" aria-labelledby="aed-mission-title">
        <div className="mission-choice-heading">
          <div><span className="mission-choice-label">บทฝึกเสริม</span><h2 id="aed-mission-title">ใช้เครื่อง AED</h2></div>
          <Image src="/images/training/prom-aed-clear-v1.png" width={1536} height={1024} sizes="120px" alt="" />
        </div>
        <p className="mission-choice-description">เปิดเครื่อง ติดแผ่น และทำตามคำสั่ง ลองทั้งกรณีช็อกและไม่ช็อก</p>
        <p className="mission-choice-meta">เลือกฝึกได้ · ไม่เพิ่ม XP</p>
        <button className="secondary-button" onClick={onAED}>ฝึกใช้ AED<ArrowRight size={20} aria-hidden="true" /></button>
      </section>
    </div>
    <p className="mission-menu-note">เป็นการฝึกจำลอง ไม่โทร 1669 จริง และไม่ทดแทนการฝึกภาคปฏิบัติ</p>
  </section>;
}
