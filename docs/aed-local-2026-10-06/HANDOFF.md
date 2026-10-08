# ฉบับ AED ทดลองในเครื่อง

6 ตุลาคม 2026 — ยังไม่ commit หรือ deploy

เปิด http://localhost:3001/ แล้วเลือก **บทเรียน → ใช้ AED → ทบทวน AED ทีละขั้น**

เปิดตัวอย่างด้วย production build แบบหน้าต่างซ่อนในเครื่อง (process ที่เปิดสำหรับรอบนี้ PID 27772) และตรวจหน้าเว็บหลังเริ่มแล้ว หยุดได้โดยปิด process นี้เฉพาะเมื่อยืนยันว่าเป็นตัวอย่างนี้ ไม่หยุด Node process อื่นของผู้ใช้

ครั้งแรกเครื่องจำลองแนะนำให้ช็อก หลังทบทวนครบ กด **ฝึกอีกผลวิเคราะห์** เพื่อทดลองกรณีไม่แนะนำให้ช็อก ไม่ใช่การเลือกผลวิเคราะห์ของผู้ป่วยจริง โหมดนี้ไม่เพิ่ม XP ไม่บันทึกภารกิจ และไม่ส่งคะแนนขึ้นระบบอันดับ

สิ่งที่เพิ่ม: ภาพตัวละครชุดฝึกตามแบบที่เลือก, ภาพตัวอย่างตำแหน่งแผ่นสำหรับผู้ใหญ่, ลำดับการอ่านทีละงาน, สองผลวิเคราะห์, อธิบายเหตุผลเปิด/ปิดได้, ยืนยันออก, ปุ่มวิเคราะห์กดข้ามไม่ได้ และพักตัวจับเวลาขณะหน้าต่างยืนยันเปิดอยู่

สถานะครูฝึกให้ผ่าน: บันทึกตามที่ผู้ดูแลโครงการแจ้ง ยังไม่มีชื่อ/เอกสารรับรอง ไม่อ้างว่าครูฝึกตรวจภาพที่เพิ่งสร้างในรอบนี้ ภาพใหม่ควรตรวจอีกครั้งก่อนเผยแพร่

ตรวจในเบราว์เซอร์ 320/390/768/1440 px, กดสองผลครบ, Guest ไม่ต้องล็อกอิน, XP ก่อนและหลังเท่าเดิม, ตรวจภาพโหลดครบและไม่ล้นแนวนอน Lint / 23 tests / build ผ่าน ข้อจำกัดคือยังไม่ใช่การทดสอบมือถือ/iPad จริงหรือฟังเสียงจากลำโพงจริง

Figma ติดข้อจำกัด quota ของบัญชี Starter จึงยังไม่ได้เชื่อม prototype ใน Figma เพิ่ม แต่ฉบับในเครื่องกดทดลองได้แล้ว ใช้ Product Design image-to-code + Design QA จากภาพที่เลือกและภาพหน้าจอที่บันทึกไว้

ภาพ:

- `public/images/training/prom-aed-clear-v1.png` — แยกภาพตัวละครที่อนุมัติไว้ด้วย builtin ImageGen
- `public/images/training/aed-pads-adult-v1.png` — builtin ImageGen, prompt: standalone landscape adult AED educational diagram, thick navy outlines, warm cream, yellow AED; exactly two separated white pads at patient upper-right below collarbone and lower-left lateral chest below armpit; no text/emblems/UI. ตรวจด้านกับ [Red Cross AED Steps](https://www.redcross.org/take-a-class/aed/using-an-aed/aed-steps) ไม่ใช้แทนภาพกำกับเครื่องจริง

หลักฐานสำคัญ: `pads-production.png`, `production-clear-390.png`, `production-clear-768.png`, `production-clear-1440.png`, `03-shock.png`, `04-exit-confirm.png`, `05-no-shock.png`, `06-complete.png` และ `design-qa.md` ที่รากโครงการ
