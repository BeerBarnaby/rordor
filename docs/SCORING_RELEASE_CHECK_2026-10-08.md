# XP / คะแนนสูตรใหม่ / ตรวจปล่อยเว็บ

8 ตุลาคม 2026

## เปลี่ยนอะไร

- สูตรคะแนน measured-v2 คงเดิม: ค่าเฉลี่ยคะแนนจัดลำดับ + การแจ้ง 1669 + จังหวะการแตะ CPR ปัดจำนวนเต็ม ฝั่งฐานข้อมูลสร้างคะแนนรวมเอง ไม่เชื่อ overallScore จาก browser
- อันดับใหม่อ่านเฉพาะผล measured-v2 ไม่ปนคะแนนสูตรเดิม และแยก «ฝึกเอง» กับ «ใช้เสียงนำ»
- XP = จำนวนภารกิจที่จบ × 250 + โบนัสคะแนนดีที่สุด (สูงสุดระหว่างโบนัสเดิมกับใหม่) รักษา XP เดิม; Level ทุก 300 XP สูงสุด Level 10 ไม่ใช้ XP ข้ามสูตรมาตัดสินอันดับทักษะ
- Guest ใช้ผล/XP ในเครื่อง โปรไฟล์ใช้ XP ที่ฐานข้อมูลยืนยัน ไม่บวก XP ในเครื่องซ้ำกับ XP ออนไลน์
- ผลผูกกับโปรไฟล์ตอนเริ่มฝึก ผล Guest เก่าไม่ถูกอัปโหลดเองหลังสมัคร/ล็อกอิน ไม่สวมผลของอีกบัญชีเมื่อเปลี่ยนโปรไฟล์
- ผลรอส่งอยู่ใน outbox แยกตามเจ้าของ ส่งผิดพลาดไม่ทิ้งผล มีข้อความสถานะและปุ่มลองส่งอีกครั้ง ยืนยันแล้วจึงนำออกจากคิว คิว backlog เว้นอย่างน้อย 25 วินาทีระหว่างผล
- เพิ่ม ledger ID กันนับภารกิจในเครื่องซ้ำ แม้รายละเอียดผลหลุดจากประวัติ 20 รายการล่าสุด
- ถ้า browser storage เขียนไม่ได้ เก็บใน memory ของหน้าปัจจุบันและแจ้งเตือน ห้ามอ้างว่าจะอยู่หลังปิดหน้า

## ฐานข้อมูลและข้อมูลเดิม

เพิ่มตาราง `nong_prom_private.game_attempts_v2` และ RPC public แบบ invoker ที่เรียก implementation private ไม่เปลี่ยนตารางหรือ RPC legacy ที่เว็บเดิมใช้อยู่ เปิด RLS และถอนสิทธิ์ตารางโดยตรงจาก anon/authenticated ตรวจ hashed PIN-session ที่มีอยู่ ไม่ใช้ playerId จากผู้ส่งเป็นตัวตัดสินสิทธิ์

สิทธิ์ Execute มีเฉพาะฟังก์ชันที่กำหนด; helper stats ไม่มีสิทธิ์ browser และ schema private ใหม่ไม่ถูกเพิ่มเป็น exposed schema ไม่มี secret/service-role key เพิ่มใน browser

บันทึก SQL ที่ใช้จริงใน `docs/sql/leaderboard_measured_v2.sql` และไฟล์ migration ที่ CLI สร้าง `supabase/migrations/20261008083616_game_score_measured_v2.sql` โดยฐานข้อมูลถูกปรับผ่าน MCP execute_sql แล้ว ฐานข้อมูลโครงการเดิมไม่มี migration history (list_migrations = []) จึงยังไม่อ้างว่า CLI migration history synchronized ห้าม db push โฟลเดอร์ legacy ทั้งชุดลงฐานข้อมูล live โดยไม่ทำ baseline/repair ก่อน เพราะ constraint ในไฟล์เก่าอาจมีอยู่แล้ว

## หลักฐานการทดสอบ

1. Unit/API route tests: 57 รายการผ่าน ครอบคลุมคะแนนใหม่, ledger, คิวซ้ำ/แยกบัญชี/storage blocked, origin/session protection, owner mismatch, wrong version, error 503 และ query แยกเสียง
2. DB tests (`docs/sql/test_leaderboard_measured_v2.sql`): recompute score, duplicate no XP, changed replay rejected, null/instant rejected, burst limit, guided separation, legacy XP retained, grants ไม่เปิดอ่านตาราง Fixtures ทั้งหมด rollback
3. Local HTTP API → Supabase จริง (`scripts/verify-scoring-api.mjs`): สมัคร fixture จำลองไม่ใช้เบอร์หรือ PIN ของคนจริง → cookie HttpOnly/SameSite strict → restore profile → ส่งคะแนน (100/92/0) รวม 64, XP314 → retry XPเท่าเดิม → owner/version/conflict rejected → rate limit → ผลใช้เสียงนำ100แยกอันดับ, XP600 และ independent best64 → reload profile XP600
4. ลบเฉพาะ QA fixtures ที่สร้างเองแล้ว ยืนยัน QAเหลือ0, v2 attemptsเหลือ0, legacy attemptsยัง1 ไม่ลบข้อมูลผู้ใช้เก่า
5. Browser Guest: เล่นภารกิจหลักครบ เปิดตัวช่วยเสียงใน browser ผลระบุใช้เสียงนำ ไม่มีภารกิจ AED บังคับ ก่อนฝึก XP567 หลังฝึก XP817 (Level3, 217/300) รีโหลดแล้วจำนวนภารกิจ3และXPเท่าเดิม Guestไม่ถูกส่งเป็นผลออนไลน์

## ข้อจำกัดและความเสี่ยงที่ยังเปิดอยู่

- ผู้ใช้เลือก «ทดสอบอุปกรณ์จริงภายหลัง»: ยังไม่ยืนยันเสียงจากลำโพง iPhone/iPad/Android หรือ timing บนมือถือจริง Browser UI + mocked WebAudio tests ไม่ใช่ physical-device verification
- ทดสอบออนไลน์ครบผ่าน HTTP API ที่ใช้ cookie จริง แต่ไม่ได้เข้าสู่โปรไฟล์มนุษย์ใน browser; ไม่อ่าน PIN หรือสร้าง credential ของผู้ใช้
- คะแนนย่อยยังมาจาก client ผู้ที่ตั้งใจแก้ payload สามารถส่งคะแนนย่อยที่ดูถูกต้องได้ แม้ serverคำนวณรวม/ตรวจขอบเขต/กันซ้ำแล้ว จึงไม่ใช้ leaderboard สำหรับการรับรองทักษะ รางวัล หรือการตัดสินที่มีผลจริง จนกว่าจะมี server-authoritative assessment
- Supabase advisors: ตาราง privateใหม่ RLS no-policy เป็น INFO ที่ตั้งใจ deny direct access; WARN ที่เหลือเป็นฟังก์ชัน auth/legacy เดิม และ `sync_borrow_request_dates` ของส่วนอื่น ไม่เปลี่ยนสิทธิ์ส่วนอื่นแบบเหมา
- แหล่งอ้างอิงใช้ [Supabase functions](https://supabase.com/docs/guides/database/functions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), Next.js docs ที่ติดตั้งใน repo ไม่เปลี่ยนเนื้อหาแพทย์เดิม

## การปล่อย

ผู้ใช้อนุญาตคอมมิทภายหลัง และให้ทำต่อ ทำ commit/push เฉพาะ source, assets และเอกสารของงานนี้ ไม่รวม .env, .vercel หรือ CLI cache จะตรวจ commit ที่ Vercel build และตรวจเว็บจริงอีกครั้งก่อนรายงานว่า live
