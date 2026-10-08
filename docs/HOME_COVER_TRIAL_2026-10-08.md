# หน้าปกฉบับลอง — 8 ตุลาคม 2026

## เป้าหมายและเหตุผล

ให้ผู้เรียนเห็นภารกิจหลักและเริ่มฝึกได้เร็วบนมือถือ หัวข้อเปลี่ยนเป็นคำถามตรงกับสถานการณ์ ไม่ใช้ข้อความโฆษณายาว ลดข้อความอธิบายซ้ำ คงฟอนต์ LINE Seed Sans TH และสีแดงสำหรับปุ่มหลัก ไม่มีขีดตกแต่งหน้าเนื้อหา เอาเงาฟุ้งและแสงชมพูใน hero ออก

ตัวละครอยู่หลังปุ่ม ไม่แย่งลำดับการอ่าน: สถานการณ์ → คำถาม → สิ่งที่จะฝึก → เวลา → ปุ่ม → ตัวละคร ภาพหน้าแรกเป็นท่าต้อนรับ ไม่แสดง AED เพื่อไม่สับสนว่าภารกิจหลักบังคับใช้เครื่อง ภาพ AED เดิมใช้ในหน้าเลือกภารกิจเสริม

## ภาพและที่มา

ใช้เครื่องมือ ImageGen แบบ built-in สร้างตัวละครจากภาพอ้างอิง `public/images/training/prom-aed-clear-v1.png` ที่ใช้กับฉาก AED อยู่แล้ว ไม่แก้ไฟล์ต้นฉบับ

ไฟล์ใหม่: `public/images/training/prom-companion-home-v1.png` (1024 × 1536)

Prompt: Create one isolated full-body fictional Thai territorial-defence trainee matching the reference character's black hair, thick black cartoon outlines, dark olive short-sleeve two-pocket uniform, trousers, boots and beret with abstract yellow patch. Standing relaxed, small smile, open hand welcoming the viewer, other hand holding a plain red training booklet. Transparent background. Restrained olive, navy, cream and red. No patient, AED, medical procedure, weapons, official emblems, rank, Red Cross, text or backdrop.

ภาพนี้เป็นตัวละครตกแต่ง ไม่ใช่ภาพสาธิตการรักษา และยังรอผู้ใช้เลือกว่าจะคงฉบับนี้หรือปรับต่อ

## Product Design audit เฉพาะหน้าปก

1. ก่อนแก้ — ภาพ `home-before-2026-10-08.png`: ปุ่มใช้งานได้ แต่คำอธิบายซ้ำและหัวข้อแนวโฆษณา ไม่มีตัวละคร
2. มือถือ 390 × 844 — `home-mobile-2026-10-08.png`: เห็นปุ่มก่อนภาพ ตัวละครโหลดครบ ไม่มีเนื้อหาล้นแนวนอน
3. มือถือเล็ก 320 × 740 — `home-small-mobile-2026-10-08.png`: ปุ่มหลักจบที่ประมาณ y419 อยู่ก่อนแถบนำทาง ตัวละครไม่ครอป ข้อความด้านข้างภาพขึ้นหลายบรรทัดแต่ยังอ่านได้
4. แท็บเล็ต 768 × 1024 — `home-tablet-2026-10-08.png`: ปุ่มสองแบบเรียงแนวนอน ภาพขยายเป็น 160 × 200 เส้นทางฝึกอยู่ถัดลงมา
5. คอม 1440 × 900 — `home-desktop-2026-10-08.png`: เส้นทางฝึกอยู่ขวา รูปไม่ยืด ไม่มี overflow
6. ปุ่มเริ่มฝึก — เปิดสถานการณ์หลักโทร 1669 + CPR ได้จริง

ทุกรูปข้างต้นจับจากหน้าเว็บจริงในรอบนี้และเปิดตรวจแล้ว รูปแรกหลัง reload ที่ยัง animate/loading ถูกปฏิเสธและจับใหม่ ไม่ใช่หลักฐานผ่าน

ข้อจำกัด: ทดสอบขนาด viewport ในเบราว์เซอร์ ไม่ใช่อุปกรณ์จริง ไม่อ้างการรับรอง WCAG หรือการผ่านภารกิจหลักจนจบจากการทดสอบนี้ ไม่เปลี่ยนคะแนน/XP/backend และไม่ deploy

โค้ดทดสอบ 23 รายการผ่าน, lint ผ่านก่อนเพิ่มภาพภารกิจเสริม, build หลังแก้ทั้งสอง component ผ่าน ตรวจ DOM รูปโหลดครบและไม่มี error/warn ในช่วงตรวจ
