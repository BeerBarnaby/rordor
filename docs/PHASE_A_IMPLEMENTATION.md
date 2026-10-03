# ระยะ A — ชุดแรก

3 ตุลาคม 2026 · เตรียม production deployment ตามคำขอผู้ใช้

## เปลี่ยนแล้ว

- AED ใช้ state guards แยก power/pads/clear/analyzing/shock/no-shock/resume/complete
- สลับคำแนะนำเครื่องในแต่ละภารกิจ ทั้งสอง branch กลับไป CPR ไม่ตีความว่าจบการช่วยจริง
- คำสั่งเป็น H1 เดียว ข้อความสั้น ข้อห้ามอยู่ก่อนปุ่ม ไม่ทำทั้งหน้าสีแดง
- เอาไอคอนใหญ่ลอย ๆ ออก ใช้แผงเครื่องฝึกจำลองพร้อมข้อความสถานะจริงแทน คงไอคอนเล็กเฉพาะปุ่มเปิดเครื่อง/คำเตือน ไม่อ้างว่าเป็นภาพสอนตำแหน่งแผ่น
- หยุด analysis timer เมื่อออกจากหน้าฝึก และเริ่มรอใหม่เมื่อกลับมา
- AED guided review ไม่ให้คะแนน; assessment/responseTime เป็น null แทนค่าประดิษฐ์
- คะแนน measured-v2 เฉลี่ย sequence/call/rhythm ไม่มีโบนัสความเร็ว
- timeline บันทึกเวลาจบกิจกรรมจริง ไม่แต่งเวลาการลงมือย่อยที่ไม่ได้วัด
- เวลา elapsed รวมเวลาที่ออกจากหน้าฝึก มีข้อความบอก ไม่เรียกว่า response speed
- คะแนนดีที่สุดสูตรใหม่แยกจากสูตรเดิม ไม่ reset ประวัติหรือ XP เดิม; ภารกิจใหม่ยังเพิ่ม participation XP ตามสูตรเดิม แต่คะแนนใหม่ไม่เพิ่ม best-score bonus เดิม
- ไม่ส่งสูตรใหม่ปน leaderboard เดิม แจ้งข้อจำกัดในหน้าแรกและผลสรุป

## ยังไม่เสร็จและข้อจำกัด

- ต้องให้ครูฝึกตรวจข้อความและ branch ก่อนเผยแพร่จริง ไม่ใช่ clinical certification
- ยังไม่ใช่ challenge ติดแผ่นหรือประเมิน safety ด้วยภาพ interactive
- scoring version ใน leaderboard/server ledger และ migration อยู่ระยะ D ไม่ได้แอบแก้ SQL production
- draft resume, pause ของทุกกิจกรรม, schema validation local ทั้งระบบ และการวัด active time อยู่ระยะ C
- เกณฑ์ average 3 แบบฝึกเป็น interim rubric ไม่ใช่ผลรับรองภาคปฏิบัติ
- การลด primary CTA ซ้ำและ token ทั้งระบบอยู่ระยะ B

## Verification

- เพิ่ม unit tests สำหรับสอง AED branch, analysis guard, premature analysis, completed state และ measured score
- ตรวจหลัง final edits: `npm test` 13 tests ผ่าน; `npm run lint` ผ่าน; `npm run build` ผ่าน; `git diff --check` ไม่มี whitespace errors
- ตรวจผ่าน browser จาก sequence → 1669 → CPR → AED shock branch → ผลสรุป; ยืนยัน analysis ปิดปุ่ม, คะแนน 100/100/0 เฉลี่ยเป็น67 และไม่มี AED100
- timeline ใน browser เป็น00:00/00:22/01:13/02:11/03:48 ตามจบกิจกรรม ไม่ใช้เวลาคงที่เดิม
- ผลสรุปไม่มี document horizontal overflow ที่390/768/1440px; AED shock ตรวจภาพที่390px ไม่กล่าวอ้างvisualครบทุกstateทุกขนาด
- no-shock branch ตรวจ state transition ด้วย unit test รอบนี้ยังไม่ได้เล่น branchนี้ผ่านbrowserครบ
- เนื้อหา shock/no-shock ตรวจเทียบ [American Red Cross AED Steps](https://www.redcross.org/take-a-class/aed/using-an-aed/aed-steps) ยังต้องครูฝึกตรวจบริบทโครงการ
