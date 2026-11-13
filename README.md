# น้องพร้อม (NONG PROM)

เว็บแอปฝึกการตัดสินใจเมื่อพบผู้หมดสติ สำหรับนักศึกษาวิชาทหาร (นศท.) หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37

**เว็บไซต์:** <https://rordor37.vercel.app> · **หลังบ้าน:** <https://rordor37.vercel.app/admin>

> น้องพร้อมเป็นสื่อเสริมการเรียนรู้ ไม่ใช้แทนการฝึกภาคปฏิบัติกับครูฝึกหรือหุ่นมาตรฐาน และไม่รับรองความสามารถในการทำ CPR

| ถ้าคุณคือ… | อ่านไฟล์นี้ |
|---|---|
| ผู้รับมอบระบบ / ครูผู้ดูแล | [HANDOVER.md](HANDOVER.md) |
| ผู้ดูแลฐานข้อมูล | [docs/DATABASE.md](docs/DATABASE.md) |
| นักพัฒนาที่รับช่วงต่อ | ไฟล์นี้ แล้วต่อด้วย [คู่มือปฏิบัติการ](docs/SYSTEM_AUDIT_AND_OPERATIONS_2026-10-17.md) |

---

## ระบบทำอะไร

ผู้เรียนเปิดเว็บแล้วกด **เริ่มฝึก** ได้ทันทีโดยไม่ต้องล็อกอิน (โหมด Guest) ภารกิจหลักมี 3 ขั้น ใช้เวลาประมาณ 5 นาที

1. **เรียงลำดับการช่วยเหลือ** ตาม 7 ขั้นตอนการฝึก รด.
2. **แจ้งเหตุ 1669** สายจำลอง 6 คำถาม
3. **ฝึกจังหวะ CPR** แตะหน้าจอให้ได้ 100–120 ครั้ง/นาที

จบแล้วระบบสรุปคะแนนแยกตามทักษะและบอกจุดที่ควรทบทวน การใช้ AED เป็นบทเสริมที่ไม่นับคะแนน

ใครอยากบันทึกผลข้ามเครื่อง ขึ้นอันดับ หรือส่งแบบประเมิน ให้สร้างโปรไฟล์ด้วยเบอร์มือถือ + PIN ส่วนผู้ดูแล 1 คนดูผู้ใช้ ผลฝึก แบบประเมิน และสถิติรายโรงเรียน/ชั้นปีได้ที่ `/admin`

## สถาปัตยกรรม

```text
เบราว์เซอร์ (มือถือ/คอม)
   │  บทเรียน ภารกิจ ผลแบบ Guest เก็บในเครื่อง
   ▼
Next.js บน Vercel ──► /api/player/*  (ตรวจข้อมูล, คุกกี้ HttpOnly, สิทธิ์ผู้ดูแล)
                          │
                          ▼  REST RPC + publishable key
                    Supabase PostgreSQL
                    (เข้าตารางตรงไม่ได้ ทุกอย่างผ่านฟังก์ชัน)
```

| ส่วน | เทคโนโลยี | อยู่ที่ไหน |
|---|---|---|
| หน้าเว็บ + API | Next.js 16 (App Router), React 19, TypeScript | `src/` |
| หน้าตา | Tailwind CSS 4, Framer Motion, Lucide, ฟอนต์ Prompt (`next/font`) | `src/app`, `src/components` |
| ฐานข้อมูล | Supabase PostgreSQL 17 (Singapore) | `supabase/migrations/` |
| โฮสต์ | Vercel (deploy อัตโนมัติเมื่อ push `main`) | โปรเจกต์ `rordor37` |
| ทดสอบ | Vitest (16 ไฟล์, 83 เทสต์) | `src/**/__tests__` |

## เริ่มพัฒนาในเครื่อง

ต้องมี Node.js 20 ขึ้นไป (production ใช้ 24.x)

```bash
git clone https://github.com/BeerBarnaby/rordor.git
cd rordor
cp .env.example .env.local   # ใส่ค่าตามตารางด้านล่าง
npm install
npm run dev                  # http://localhost:3000
```

### ตัวแปรสภาพแวดล้อม

| ชื่อ | ความลับ? | ได้จาก |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ไม่ | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ไม่ (ออกแบบให้เปิดเผยได้) | Supabase → API Keys → Publishable |
| `NONG_PROM_ADMIN_SECRET` | **ใช่** ฝั่งเซิร์ฟเวอร์เท่านั้น | สุ่มเอง เช่น `openssl rand -hex 32` และต้องตรงกับ hash ใน `admin_config` |

กฎที่ต้องจำ:
- ห้ามตั้ง secret ด้วยชื่อขึ้นต้น `NEXT_PUBLIC_`
- ห้าม commit `.env.local`
- **ห้ามใช้ service-role key** เพราะระบบไม่ต้องใช้

ถ้าไม่มี Supabase หน้าเว็บและภารกิจแบบ Guest ยังใช้ได้ แต่โปรไฟล์ อันดับ และหลังบ้านจะใช้ไม่ได้

## ตรวจก่อนเผยแพร่ (Release gate)

```bash
npm test -- --run        # ต้องผ่านทั้งหมด
npm run lint             # ต้องไม่มี error
npm run build            # ต้อง build ได้ (ต้องต่ออินเทอร์เน็ตเพื่อโหลดฟอนต์ Prompt)
npm audit --omit=dev     # ต้องไม่มีช่องโหว่
```

จากนั้น push `main` แล้ว Vercel จะ deploy ให้เอง รอสถานะ **Ready** แล้วตรวจ:

- เปิด `/` ได้
- เปิด `/api/player/admin/overview` แบบไม่ล็อกอินต้องได้ `401`
- ทดลองล็อกอินและเข้าหลังบ้านได้

ถ้า deploy มีปัญหา ให้ไปที่ Vercel → Deployments เลือกรุ่นก่อนหน้า แล้วกด **Promote to Production**

## ฐานข้อมูล (สรุป)

รายละเอียดเต็มอยู่ใน **[docs/DATABASE.md](docs/DATABASE.md)**

| ตาราง | เก็บอะไร |
|---|---|
| `public.game_players` | โปรไฟล์ (เบอร์, ชื่อที่แสดง, PIN แบบ bcrypt, โรงเรียน, ชั้นปี) |
| `public.game_sessions` | เซสชัน (เก็บแค่ hash ของ token, อายุ 7 วัน) |
| `nong_prom_private.game_attempts_v2` | ผลฝึก 3 ส่วน + คะแนนรวม |
| `nong_prom_private.app_feedback` | แบบประเมิน (1 คน 1 คำตอบ) |
| `nong_prom_private.admin_config` | บัญชีผู้ดูแล 1 คน + hash ของ admin secret |
| `nong_prom_private.admin_audit_log` | ประวัติการลบผู้ใช้ |

กฎเหล็ก: **แก้โครงสร้างฐานข้อมูลได้เฉพาะผ่านไฟล์ migration ใหม่ใน `supabase/migrations/`** แล้วตรวจ Supabase Advisors ทุกครั้ง

ไฟล์ migration ทั้ง 8 ไฟล์ทดสอบแล้ว (13 พ.ย. 2569) ว่าสร้างฐานข้อมูลใหม่ได้ครบจากศูนย์ ดูขั้นตอนย้ายระบบในหัวข้อ 7 ของ DATABASE.md

## โครงสร้างโปรเจกต์

```text
src/
├── app/
│   ├── page.tsx, layout.tsx       # หน้าเว็บหลัก
│   ├── admin/                     # หน้าหลังบ้าน
│   └── api/player/                # auth, session, attempt, feedback, leaderboard, admin/*
├── components/                    # UI กลาง โปรไฟล์ แบบประเมิน แดชบอร์ดผู้ดูแล
├── features/                      # บทเรียน ภารกิจ 1669 CPR AED และหน้าสรุป
├── data/                          # เนื้อหาบทเรียน สถานการณ์ และแหล่งอ้างอิง ← แก้เนื้อหาที่นี่
└── lib/                           # สูตรคะแนน เซสชัน ตัวเรียกฐานข้อมูล + __tests__
supabase/migrations/               # โครงสร้างฐานข้อมูลทั้งหมด (source of truth)
supabase/tests/                    # SQL ทดสอบสถิติหลังบ้าน
docs/                              # เอกสารออกแบบ ฐานข้อมูล และคู่มือปฏิบัติการ
```

| อยากแก้… | ไปที่ |
|---|---|
| ข้อความบทเรียน / ขั้นตอน / คำถาม 1669 | `src/data/` |
| สูตรคะแนน | `src/lib/` (มีเทสต์คุมอยู่ แก้แล้วรัน `npm test`) |
| สิทธิ์ เงื่อนไขบันทึกผล จำกัดจำนวนครั้ง | migration ใหม่ใน `supabase/migrations/` |

## ความปลอดภัย (สรุป)

- คุกกี้เซสชันเป็น `HttpOnly`, `Secure`, `SameSite=Strict`, จำกัด path `/api/player`, อายุ 7 วัน
- PIN ผิด 5 ครั้งล็อก 15 นาที และเก็บเซสชันได้ไม่เกิน 5 อันต่อคน
- API ที่เปลี่ยนข้อมูลตรวจ origin, content type และขนาดคำขอ
- หลังบ้านต้องผ่านทั้งเซสชันผู้ดูแลและ `NONG_PROM_ADMIN_SECRET`
- **ห้ามใส่ PIN, secret หรือ connection string ในโค้ด เอกสาร รูปเล่ม ภาพหน้าจอ หรือแชตกลุ่ม**

รายงานตรวจความปลอดภัยฉบับเต็มอยู่ที่ [security_best_practices_report.md](security_best_practices_report.md)

## เอกสารอื่น

- [HANDOVER.md](HANDOVER.md) — เอกสารส่งมอบระบบ
- [docs/DATABASE.md](docs/DATABASE.md) — คู่มือฐานข้อมูล ติดตั้งใหม่ ย้ายระบบ สำรองข้อมูล
- [docs/SYSTEM_AUDIT_AND_OPERATIONS_2026-10-17.md](docs/SYSTEM_AUDIT_AND_OPERATIONS_2026-10-17.md) — สถาปัตยกรรม คู่มือผู้ดูแล รับมือเหตุผิดปกติ
- [docs/SYSTEM_WORKING_PRINCIPLES_REPORT_TH.md](docs/SYSTEM_WORKING_PRINCIPLES_REPORT_TH.md) — หลักการทำงานของระบบ (ภาษาไทย)
- [docs/rotc-seven-step-alignment.md](docs/rotc-seven-step-alignment.md) — ที่มาของลำดับ 7 ขั้นตอน

## ผู้พัฒนาและติดต่อ

นศท. ปิยเชษฐ์ แสงจันทร์ และคณะ · โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย
LINE ID `opnlne` · piyachet.barnaby@gmail.com
