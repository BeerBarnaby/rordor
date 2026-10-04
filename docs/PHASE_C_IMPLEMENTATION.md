# ระยะ C — ชุดแรก: ลิงก์บทเรียนและความทนทานของข้อมูล

4 ตุลาคม 2026 · ยังไม่ deploy

## Flow ใหม่

ใช้ hash-based navigation เพื่อเพิ่ม deep link โดยยังไม่ย้ายทุกหน้าของแอปเป็น Next.js routes:

- `/#home` หน้าแรก
- `/#lessons` รายการบท
- `/#lessons/assessment`, `/#lessons/call1669`, `/#lessons/cpr`, `/#lessons/aed` บทเฉพาะเรื่อง
- `/#practice` เปิดสถานการณ์จำลอง ไม่ใช่ลิงก์เรียกคืน draft

เลือกบท → pushState → navigation event → React external store → หน้าที่ตรง URL

Back/Forward → popstate/hashchange → external store → คืนบทที่ถูกต้อง รีเฟรชลิงก์บทเรียนยังกลับบทเดิม การ refresh ภารกิจยังเริ่มใหม่ตามข้อจำกัดเดิม ไม่โฆษณาว่า resume ทุกคำตอบได้

Skip link ใช้ focus/scroll โดยไม่เปลี่ยน hash ที่ใช้ระบุหน้า เพื่อไม่ให้ข้ามเนื้อหาแล้วหลุดจากบทเรียน

## ข้อมูลในเครื่อง

localStorage → parseProgress → ตรวจโครงสร้าง/คะแนน/ผลลัพธ์ → UI และ ProgressServiceใช้ตัวอ่านเดียวกัน

- JSONเสีย/rootผิดชนิดคืนค่า default ไม่ทำให้ `.includes` หรือ historyล้ม
- ตรวจ MissionResult รวมคะแนน nullable ของรุ่นv2 และ timeline
- รักษาฟิลด์ที่ถูกต้อง กรอง IDบทที่ไม่รู้จักและผลผิดรูปแบบ ไม่ล้าง storage ระหว่างอ่าน
- เก็บประวัติสูงสุด20 รายการ ตัดIDซ้ำ รักษาคะแนนbestใหม่จากผลที่ยังมีอยู่
- ไม่ใช่ anti-cheat หรือ canonical cloud data; ข้อมูลguestยังแก้เองได้
- เมื่อมีการบันทึกครั้งใหม่จะเขียนข้อมูลที่normalizeแล้ว ข้อมูลผิดรูปแบบจึงไม่ถูกนำไปใช้ต่อ ไม่มีการแก้ฐานข้อมูลproduction

## ยังเหลือ

Draft persistence ของแต่ละกิจกรรม, active-time pause, การกลับเข้าเดิมหลังปิดbrowser, outbox/ออนไลน์เวอร์ชันใหม่ และ URLroutesจริงยังไม่ได้ทำ การแยกhashเป็นส่วนแรกเพื่อให้ความสามารถใหม่ไม่บังคับrewriteทั้งหมด

## Verification

Unit tests ผ่านทั้งหมด 22 ข้อ ครอบคลุม link ปกติ/ผิด, JSON เสีย, partial progress, ผล v2, history ซ้ำและคะแนนผิดรูปแบบ

ตรวจ browser เปิด AED ตรงลิงก์ เลือกประเมินแล้ว Back กลับ AED และ Forward กลับประเมินได้ รีเฟรชแล้วยังอยู่บทประเมิน Skip link ย้าย focus ไป main-content โดย URL บทเรียนไม่เปลี่ยน

`npm run lint`, `npm run build` และ `git diff --check` ผ่าน ไม่มีการ commit/push/deploy ในชุดงานนี้
