# ชุดงานต่อเนื่อง C–F

4 ตุลาคม 2026 · ยังไม่ commit/push/deploy

## ทำจริงในชุดนี้

- C: validated version-1 checkpoint ของ mission phase, คะแนนกิจกรรมที่จบแล้ว และ scenario attempt key; ปุ่มหลักกลับมาฝึกต่อเมื่อมี checkpoint; เริ่มใหม่ต้องยืนยัน
- C: หลัง reload กิจกรรมที่ค้างเริ่มต้นใหม่ ไม่กู้คำตอบย่อย/tap/state เครื่องย่อย ไม่บวกเวลาระหว่างปิดเว็บเข้ามา แต่เวลาภายใน session ยังไม่ใช่ active-time เต็มรูปแบบ
- C: เก็บ timeline การกลับมาฝึกต่อพร้อมคำอธิบาย ไม่สร้างเหตุการณ์ย้อนหลังที่ไม่ถูกบันทึก
- C: CPR/AED active ตามหน้าที่เลือกและ document visibility; หยุด countdown/analysis และ reset interval จังหวะเมื่อพัก ไม่ใช้ช่วงห่างก่อนพักมาคิด BPM
- C: leaderboard loading/error/empty/retry; session restore ล้มเหลวไม่ทำให้ผล leaderboard ที่สำเร็จหาย และไม่เกิด Promise rejection ที่ขวางการเรียน
- D: recordedMissionIds แยกจาก history 20 รายการ กัน result ID เดิมซ้ำได้แม้ผลหลุดจาก history; เก็บสูงสุด 10,000 IDs ข้อมูลก่อน migration ที่ไม่มี ID เหลือไม่สามารถสร้างย้อนหลังได้
- D: API อันดับ legacy ปฏิเสธ scoringVersion ที่ส่งมาและคะแนนที่ไม่ใช่ number ไม่เงียบแปลง null/string เป็นตัวเลข; ไม่ได้เปลี่ยน RPC เดิมเป็น event-based anti-cheat
- E: เปลี่ยนเลข 37 ในหัวเว็บเป็น Lucide HeartPulse ใช้สีและเส้นเดียวกับแอป ไม่อ้างว่าเป็น mascot/logo custom
- E: ตัวเลือกลด motion เพิ่มเติมและ haptics แบบ opt-in ในหน้าข้อมูล; เคารพ prefers-reduced-motion ของระบบอยู่แล้ว ไม่มีการบังคับเสียง
- F: เกณฑ์รับงานทุกระยะ, pilot sheet, staging workload และ release/rollback checklist
- F: bounded localhost load smoke 50 GET, concurrency 5, failures 0, p50 215ms, p95 254ms บน next dev ณ รอบนี้ ไม่ใช่ capacity production และไม่ได้วัดฐานข้อมูล

## การทดสอบ

Browser localhost: เข้า #practice → เริ่ม sequence → reload → พบปุ่ม resume → กลับ sequence ได้ และหน้าแรกแสดง checkpoint จากข้อมูลในเครื่อง

Unit tests ทั้งหมด 38 ข้อผ่าน; lint/build/diff check ผ่าน เพิ่ม checkpoint validation, reward replay หลัง history ถูกตัด และ preferences parsing

Browser ตรวจ toggle ลดการเคลื่อนไหวแล้ว app-shell มี data-reduce-motion=true และคืนค่าเดิมแล้ว หน้าแรกใช้ resume เป็น CTA หลักเมื่อมี checkpoint ไม่ซ้อน banner ใหญ่ก่อนหัวข้อ ภาพ: C:/Users/Piyachet/.codex/artifacts/rordor-c-f/home-checkpoint.png

ไม่ใช้ local load รับรองจำนวนคนพร้อมกันจริง

## งานที่ยังต้องทำ

ดู checkbox ที่ยังเปิดใน RELEASE_GATES_AND_PILOT.md โดยเฉพาะ exact draft, active-time, outbox, player ownership/guest merge, server rubric/versioned leaderboard/XP ledger, custom character, accessibility ทุก state, staging load และ pilot คนจริง ไม่เรียกชุดงานนี้ว่าครบทุกระยะ

ไม่มีการรัน SQL ใหม่บน production และไม่มีการสร้าง/ซื้อ staging project ในชุดนี้
