# การตรวจรับทุกระยะ — น้องพร้อม

อัปเดต 4 ตุลาคม 2026 · เอกสารนี้แยกงานที่ทำแล้วออกจากหลักฐานที่ยังต้องเก็บ ไม่ใช่คำประกาศว่าทุกระยะเสร็จ

## A — ความถูกต้องของการฝึก

- [x] AED มี shock/no-shock และ guard ระหว่างวิเคราะห์
- [x] ไม่ให้คะแนน AED/ประเมิน/ความเร็วที่ไม่ได้วัดจริง
- [x] เจ้าของโครงการแจ้งว่าครูฝึกอนุมัติ baseline 238b237
- [ ] ผู้เรียน 5 คนอธิบายคำสั่งและข้อควรระวังได้โดยไม่ชี้นำ
- [ ] ตรวจ browser ทั้งสอง branch หลังรวมทุกการเปลี่ยนก่อน release

## B — การอ่านและ responsive

- [x] สรุปบทเรียนก่อนคลิป ชื่อแท็บมือถือ หน้าแรกลดซ้ำ
- [x] ตรวจ document overflow ที่ 320/390/768/1440 ในงาน B
- [ ] ตรวจ 200% text / 400% zoom / screen reader / contrast ของทุก state
- [ ] ถ่ายชุดภาพเปรียบเทียบหลังรวม C–E ไม่ใช้ผล B รับรองหน้าที่แก้ใหม่

## C — ความต่อเนื่อง

- [x] Hash deep links, browser Back/Forward, skip link
- [x] ตรวจ progress/draft ก่อนอ่าน ไม่ล้างข้อมูลทั้งหมดเมื่อบางฟิลด์ผิด
- [x] checkpoint ต้นกิจกรรม เก็บคะแนนกิจกรรมที่จบแล้ว
- [x] CPR countdown และ AED analysis หยุดเมื่อออกหน้าฝึก/ซ่อนแท็บ
- [x] อันดับ loading/error/empty แยกกัน พร้อม retry
- [ ] คำตอบย่อย sequence/call และ AED state ย่อยหลัง refresh
- [ ] active-time clock และ pause UX ที่แสดงสถานะชัดเจน
- [ ] player-scoped outbox / guest merge ที่ถามก่อนรวม / logout shared-device policy

Checkpoint ไม่ใช่ exact resume: refresh แล้วกิจกรรมปัจจุบันเริ่มต้นใหม่ CPR เริ่มรอบใหม่ ไม่เอา interval ก่อนปิดแท็บมาคิดคะแนน เวลาที่บันทึก checkpoint ไม่ใช่ตัววัด active-time ที่รับรองแล้ว

## D — คะแนนและ XP

- [x] แยกสูตร measured-v2 จากอันดับเดิมทั้ง client และ API เมื่อระบุ scoringVersion
- [x] กันผลซ้ำในเครื่องด้วย recordedMissionIds แยกจากประวัติ 20 รายการ
- [ ] versioned event payload + server rubric + database tests
- [ ] transactional XP ledger / local-cloud reconcile / outbox retry idempotency
- [ ] tie/season ที่แยก scoring version และ personal-best เทียบสูตรเดียวกัน

รหัสกันซ้ำในเครื่องเก็บสูงสุด 10,000 รายการ ไม่ใช่การกันโกง ผู้ใช้แก้ localStorage ได้ และสองแท็บยังอาจเขียนแข่งกัน การ migrate รองรับรหัสจาก history ที่ยังเหลืออยู่ ไม่สามารถสร้างรหัสผลเก่าที่ถูกลบไปก่อนหน้านี้ได้ ไม่ควรเรียกว่า canonical ledger

API เดิมไม่มีหลักฐาน event และ direct RPC ยังใช้สูตรเดิม การปฏิเสธ version ใน API ไม่ได้ทำให้ Supabase RPC เดิมเป็นระบบกันโกง

## E — บุคลิกและประสบการณ์

- [x] หัวเว็บใช้ HeartPulse ของ Lucide แทนเลข 37 ไม่อ้างว่าเป็นโลโก้ออกแบบเฉพาะ
- [x] reduced motion ตามระบบ + ตัวเลือกเพิ่มเติม / haptics opt-in
- [ ] mascot companion/focused ที่ผ่าน style review
- [ ] ภาพสอนตำแหน่งแผ่นที่ครูฝึกตรวจ ไม่ใช้ภาพสร้างขึ้นแทนหลักฐานทางการแพทย์
- [ ] achievement จากเหตุการณ์ที่บันทึกจริง และทดสอบไม่บดบัง CTA

## F — หลักฐานก่อน production

- [x] มี bounded local load smoke script ไม่ยอมรับปลายทางภายนอก
- [ ] staging load test รวม auth/leaderboard/submit ตาม workload จริง
- [ ] pilot ผู้เรียน 6–8 คน และครูฝึก 2 คน
- [ ] ทดลอง restore backup และ rollback ใน staging
- [ ] monitor error โดยไม่บันทึกเบอร์/PIN/token

### Pilot sheet

เก็บ participant code นิรนาม, device, experience level, task success, help count, misclick, warning missed และความเข้าใจคะแนน ไม่เก็บเบอร์/PIN

| งาน | สำเร็จด้วยตนเอง | จำนวนครั้งช่วย | ปัญหาที่พบ |
|---|---|---|---|
| เริ่มโดยไม่สมัคร | | | |
| เลือกบท AED ด้วยตัวเอง | | | |
| อธิบายงานปัจจุบัน/คำเตือน | | | |
| ผ่านเส้นทางไม่แนะนำช็อก | | | |
| ออก/รีเฟรช/กลับมาฝึกต่อ | | | |
| อธิบายคะแนนที่วัดและไม่ได้วัด | | | |

### Capacity workload ที่ต้องตกลงก่อนทดสอบ staging

เริ่ม 10 → 25 → 50 virtual users เป็นขั้น ไม่อ้างว่าเท่ากับผู้ใช้จริงทั้งหมด วัด document/API แยกกัน ระบุ session duration, request mix, ramp time, p95, error rate, DB CPU/connections, quota/cost และจุดหยุดทดสอบ หยุดเมื่อ error >1% หรือ p95 API >2s ต่อเนื่อง และทบทวนสาเหตุ ตัวเลขเหล่านี้เป็นเกณฑ์ทดลอง ไม่ใช่ SLA ที่พิสูจน์แล้ว

ทดสอบการเขียนคะแนนเฉพาะบัญชีทดสอบใน staging ห้ามใช้เบอร์ผู้เรียนจริงหรือเขียนคะแนนทดสอบบน production ไม่มีจำนวนคนสูงสุดที่ยืนยันได้จนกว่าจะมีรายงานผล

### Release/rollback

1. Freeze commit + content/scoring version และเก็บผล test/build/screenshots
2. สำรอง staging แล้วทดลอง restore ก่อนแตะ schema production
3. Additive migration ก่อน client ที่เรียก RPC ใหม่ ห้ามสลับลำดับ
4. ตรวจ RLS/grants/auth/logout/replay/version separation ในฐาน staging
5. Preview deployment → smoke test → อนุมัติ release
6. Rollback frontend ไป deployment ก่อนหน้าได้ แต่ database rollback ต้องมีแผนของตนเอง ห้าม drop ตารางผลเพียงเพื่อย้อนเว็บ
7. ตรวจหลังเผยแพร่ด้วยบัญชีทดสอบที่กำหนดไว้ โดยไม่เปิดเผยข้อมูลผู้เรียน

## ลำดับงานที่ยังต้องเดินต่อ

1. Exact activity draft + active-time + shared-device boundaries (C)
2. Event rubric และ migration สำหรับ custom phone/PIN player model (D)
3. Outbox/reconcile/guest merge หลัง server versioned พร้อม (C/D)
4. Character/illustration ตาม style ที่กำหนดและตรวจเนื้อหา (E)
5. Accessibility pass + staging load/restore + pilot (B/F)

งานที่ต้องมีคนจริงหรือ staging จริงห้ามติ๊กเสร็จจาก unit tests อย่างเดียว และห้ามนำฐาน auth.users รุ่นเก่ามาต่อกับ game_players โดยสมมติว่า ID เหมือนกัน
