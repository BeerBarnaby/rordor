# น้องพร้อม (NONG PROM)

เว็บฝึกการตัดสินใจเมื่อพบผู้หมดสติสำหรับนักศึกษาวิชาทหาร โดยเน้นการประเมินเหตุ การโทรแจ้ง 1669 และการฝึกจังหวะ CPR ส่วน AED เป็นบทเรียนเสริม ระบบใช้งานแบบ Guest ได้ และมีโปรไฟล์ด้วยเบอร์โทรกับ PIN สำหรับบันทึกผลข้ามอุปกรณ์

> ระบบนี้เป็นสื่อเสริมการเรียนรู้ ไม่แทนการฝึกภาคปฏิบัติ การประเมินทักษะ หรือคำแนะนำจากบุคลากรทางการแพทย์

## ความสามารถหลัก

- บทเรียน CPR, การแจ้งเหตุ 1669, การประเมินสถานการณ์ และ AED
- ภารกิจเรียงลำดับ การสนทนาจำลอง 1669 และเกมฝึกจังหวะ CPR
- สรุปผลรายทักษะ XP และอันดับผู้ฝึกแบบไม่ใช้เป็นผลรับรองความสามารถ
- ใช้งานแบบ Guest หรือสร้างโปรไฟล์ด้วยเบอร์โทรและ PIN
- แบบประเมินหลังเรียนสำหรับผู้ที่เข้าสู่ระบบ
- หลังบ้านบัญชีผู้ดูแลหนึ่งบัญชี สำหรับดูผู้ใช้ ผลฝึก แบบประเมิน และประวัติการเข้าสู่ระบบ รวมถึงลบผู้ใช้แบบถาวร

## เทคโนโลยี

- Next.js 16 App Router, React 19 และ TypeScript
- Tailwind CSS 4, Framer Motion และ Lucide
- Supabase Postgres ผ่านฟังก์ชันฐานข้อมูลที่จำกัดสิทธิ์
- Vercel สำหรับ Production และ Preview deployment
- Vitest สำหรับ unit และ component tests

ข้อมูลความคืบหน้าชั่วคราวและคิวรอซิงก์เก็บในเบราว์เซอร์ แต่โปรไฟล์ ผลการฝึก แบบประเมิน เซสชัน และข้อมูลหลังบ้านเก็บใน Supabase

## เริ่มพัฒนาในเครื่อง

ต้องใช้ Node.js รุ่นที่รองรับโดย Next.js 16 และไฟล์ `.env.local` ที่มีตัวแปรต่อไปนี้:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NONG_PROM_ADMIN_SECRET=...
```

`NONG_PROM_ADMIN_SECRET` เป็นความลับฝั่งเซิร์ฟเวอร์ ห้ามใช้ชื่อขึ้นต้นด้วย `NEXT_PUBLIC_` และห้าม commit ลง Git

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) สำหรับหน้าเว็บ และ `/admin` สำหรับทางเข้าหลังบ้าน

## ตรวจสอบก่อนเผยแพร่

```bash
npm test -- --run
npm run lint
npm run build
npm audit --omit=dev
```

ทุก release ต้องผ่านสี่คำสั่งนี้ ตรวจ migration ใหม่ และทดสอบว่า API หลังบ้านตอบ `401` เมื่อไม่มีเซสชันผู้ดูแล

## โครงสร้างสำคัญ

```text
src/
├── app/
│   ├── admin/                    # หน้าหลังบ้าน
│   └── api/player/               # auth, session, attempt, feedback, leaderboard, admin
├── components/                   # UI และหน้าต่างส่วนกลาง
├── data/                         # เนื้อหาบทเรียนและสถานการณ์
├── features/                     # learning, mission, 1669, CPR, AED, debrief
└── lib/                          # session, database clients, scoring, sync และ tests
supabase/migrations/              # schema และฟังก์ชันฐานข้อมูลแบบมีประวัติ
docs/                             # แผน ระบบ และคู่มือปฏิบัติการ
```

## หลักการข้อมูลและความปลอดภัย

- คุกกี้เซสชันเป็น `HttpOnly`, `Secure` ใน production และ `SameSite=Strict`
- หลังบ้านต้องผ่านทั้งเซสชันผู้ดูแลและ secret ฝั่งเซิร์ฟเวอร์
- ตาราง NONG PROM ไม่เปิดให้ client อ่านหรือเขียนโดยตรง
- การลบผู้ใช้ต้องยืนยันชื่อที่แสดง และบันทึก audit log
- API การเปลี่ยนข้อมูลตรวจ origin, content type และขนาดคำขอ
- ห้ามใส่รหัสผู้ดูแล PIN ฐานข้อมูล service-role key หรือ connection string ในโค้ดและเอกสาร

## เอกสารสำหรับผู้ดูแล

- [สถาปัตยกรรม การไหลของข้อมูล และคู่มือปฏิบัติการ](docs/SYSTEM_AUDIT_AND_OPERATIONS_2026-10-17.md)
- [รายงานตรวจความปลอดภัย](security_best_practices_report.md)
- [แผนพัฒนาผลิตภัณฑ์](docs/PRODUCT_DEVELOPMENT_PLAN.md)
- [แนวทาง UX และเนื้อหา](docs/UX_CONTENT_DESIGN_PLAN.md)

## การแก้ฐานข้อมูลและเผยแพร่

สร้างการเปลี่ยนฐานข้อมูลเป็นไฟล์ migration ใหม่เสมอ ห้ามแก้ production แบบไม่มีไฟล์บันทึก หลัง apply migration ให้ตรวจ Supabase Security/Performance Advisors แล้วจึง push โค้ดเพื่อให้ Vercel deploy จาก Git

รายละเอียดขั้นตอนตรวจ release, สำรอง/กู้คืน, หมุน secret, ลบข้อมูล และรับมือเหตุผิดปกติอยู่ในคู่มือปฏิบัติการข้างต้น
