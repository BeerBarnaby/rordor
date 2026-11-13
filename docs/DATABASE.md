# ฐานข้อมูลน้องพร้อม (NONG PROM Database Guide)

> เอกสารนี้สำหรับผู้ดูแลระบบและนักพัฒนาที่รับช่วงต่อ อ่านให้จบก่อนแก้ฐานข้อมูล production
> ตรวจสอบกับฐานข้อมูลจริงล่าสุด: **13 พฤศจิกายน 2569**

## สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [หลักการออกแบบ 5 ข้อ](#2-หลักการออกแบบ-5-ข้อ)
3. [ตาราง](#3-ตาราง)
4. [ฟังก์ชัน (RPC)](#4-ฟังก์ชัน-rpc)
5. [สิทธิ์และความปลอดภัย](#5-สิทธิ์และความปลอดภัย)
6. [Migration](#6-migration)
7. [ติดตั้งบนโปรเจกต์ใหม่ / ย้ายระบบ](#7-ติดตั้งบนโปรเจกต์ใหม่--ย้ายระบบ)
8. [ตั้งค่าและเปลี่ยนผู้ดูแล](#8-ตั้งค่าและเปลี่ยนผู้ดูแล)
9. [สำรองและกู้คืนข้อมูล](#9-สำรองและกู้คืนข้อมูล)
10. [SQL ที่ใช้บ่อย](#10-sql-ที่ใช้บ่อย)
11. [ของเก่าที่ยังอยู่ (Legacy)](#11-ของเก่าที่ยังอยู่-legacy)
12. [สถานะปัจจุบันและเรื่องที่ต้องรู้](#12-สถานะปัจจุบันและเรื่องที่ต้องรู้)

---

## 1. ภาพรวม

| รายการ | ค่า |
|---|---|
| ผู้ให้บริการ | Supabase (PostgreSQL 17) |
| Region | `ap-southeast-1` (Singapore) |
| Schema ที่ใช้ | `public` (โปรไฟล์และเซสชัน) และ `nong_prom_private` (ผลฝึก แบบประเมิน ผู้ดูแล) |
| วิธีที่แอปเรียกใช้ | เซิร์ฟเวอร์ Next.js เรียก `POST /rest/v1/rpc/<ชื่อฟังก์ชัน>` ด้วย publishable key เท่านั้น (`src/lib/supabase/server.ts`) |
| ที่มาของโครงสร้าง | ไฟล์ใน `supabase/migrations/` (8 ไฟล์) คือแหล่งความจริง (source of truth) |

```text
เบราว์เซอร์ ──► Next.js API (/api/player/*) บน Vercel
                  │  ตรวจ origin, ขนาด, รูปแบบข้อมูล, อ่านคุกกี้ HttpOnly
                  ▼
           Supabase REST RPC (publishable key)
                  │
   public.<wrapper>  (SECURITY INVOKER — ตัวห่อ ไม่มีสิทธิ์พิเศษ)
                  │
   nong_prom_private.<impl>  (SECURITY DEFINER — ตรวจเซสชัน/สิทธิ์ แล้วอ่านเขียนตาราง)
                  │
   ตาราง (RLS เปิด, ไม่ให้ anon/authenticated เข้าตรง)
```

**ความสัมพันธ์ของตาราง**

```text
public.game_players (1) ──< public.game_sessions            ON DELETE CASCADE
        │
        ├──< nong_prom_private.game_attempts_v2              ON DELETE CASCADE
        ├──< nong_prom_private.app_feedback (0..1 ต่อคน)      ON DELETE CASCADE
        └──  nong_prom_private.admin_config (1 แถวเท่านั้น)   ON DELETE RESTRICT
nong_prom_private.admin_audit_log  (ไม่มี FK — เก็บประวัติได้แม้ผู้ใช้ถูกลบ)
```

## 2. หลักการออกแบบ 5 ข้อ

1. **ไม่มีใครเข้าตารางตรง ๆ ได้** ทุกอย่างผ่านฟังก์ชันที่กำหนดไว้เท่านั้น publishable key จึงเปิดเผยได้โดยไม่รั่ว
2. **ไม่เก็บความลับเป็นข้อความจริง** PIN เก็บเป็น bcrypt, session token และ admin secret เก็บเป็น SHA-256
3. **ฐานข้อมูลตรวจซ้ำเสมอ** แม้ API ตรวจแล้ว ฐานข้อมูลยังมี CHECK constraint และเงื่อนไขในฟังก์ชันอีกชั้น
4. **ผู้ดูแลต้องผ่าน 2 ชั้น** คือเซสชันของบัญชีที่ตรงกับ `admin_config` และ secret ฝั่งเซิร์ฟเวอร์
5. **ทุกการเปลี่ยนโครงสร้างต้องเป็นไฟล์ migration** ห้ามแก้ production ใน Dashboard โดยไม่มีไฟล์บันทึก

## 3. ตาราง

### 3.1 `public.game_players` — โปรไฟล์ผู้ฝึก

| คอลัมน์ | ชนิด | กติกา / ความหมาย |
|---|---|---|
| `id` | uuid PK | สร้างอัตโนมัติ |
| `phone_normalized` | text UNIQUE | เบอร์มือถือไทย 10 หลัก `^0[689][0-9]{8}$` (ใช้เป็นชื่อล็อกอิน) |
| `display_name` | text | ยาว 2–24 ตัวอักษร (แสดงในอันดับ) |
| `pin_hash` | text | bcrypt ของ PIN ตัวเลข 4–8 หลัก |
| `failed_login_count` | smallint | นับครั้งที่ PIN ผิด สูงสุด 5 |
| `locked_until` | timestamptz | ผิดครบ 5 ครั้ง ล็อก 15 นาที |
| `school_name` | text | 2–120 ตัวอักษร ห้ามมีอักขระควบคุม |
| `training_year` | smallint | ชั้นปี นศท. 0–5 (0 = ยังไม่ระบุ/อื่น ๆ) |
| `created_at`, `updated_at` | timestamptz | |

### 3.2 `public.game_sessions` — เซสชันล็อกอิน

| คอลัมน์ | ชนิด | กติกา / ความหมาย |
|---|---|---|
| `id` | uuid PK | |
| `player_id` | uuid FK → `game_players` | ลบผู้ใช้แล้วเซสชันหายตาม |
| `token_hash` | text UNIQUE | SHA-256 ของ token (token จริงอยู่ในคุกกี้ HttpOnly เท่านั้น) |
| `expires_at` | timestamptz | อายุ 7 วัน |
| `created_at`, `last_seen_at` | timestamptz | |

ล็อกอินใหม่จะลบเซสชันที่หมดอายุ และเก็บเซสชันที่ยังใช้ได้ไม่เกิน 5 อันต่อคน

### 3.3 `nong_prom_private.game_attempts_v2` — ผลการฝึก (สูตรคะแนนปัจจุบัน)

| คอลัมน์ | ชนิด | กติกา / ความหมาย |
|---|---|---|
| `id` | uuid PK | |
| `player_id` | uuid FK → `game_players` | CASCADE |
| `client_attempt_id` | text | รูปแบบ `mission_<เลข 13 หลัก>` ใช้กันส่งซ้ำ (UNIQUE ร่วมกับ `player_id`) |
| `scenario_id` | text | `SCENARIO_ROTC_FIELD`, `SCENARIO_ROTC_BUILDING`, `SCENARIO_ROTC_ACTIVITY` |
| `sequence_score` | smallint | ลำดับการช่วยเหลือ 0–100 |
| `call_score` | smallint | แจ้งเหตุ 1669 0–100 |
| `cpr_rhythm_score` | smallint | จังหวะ CPR 0–100 |
| `overall_score` | smallint | คำนวณในฐานข้อมูลจากค่าเฉลี่ยสามส่วน |
| `audio_guided` | boolean | ใช้เสียงนำทางหรือไม่ (แยกอันดับสองโหมด) |
| `total_time_seconds` | integer | 20–86,400 วินาที |
| `completed_at` | timestamptz | |

กติกาตอนบันทึก (`submit_v2`): ส่งได้ 1 ครั้งต่อ 20 วินาที, ไม่เกิน 100 ครั้งต่อวัน (นับตามเวลาไทย), ส่ง ID เดิมซ้ำด้วยค่าเดิมได้ผลเดิม แต่ส่ง ID เดิมด้วยค่าใหม่จะถูกปฏิเสธ (`attempt_conflict`)

### 3.4 `nong_prom_private.app_feedback` — แบบประเมิน

| คอลัมน์ | ชนิด | กติกา / ความหมาย |
|---|---|---|
| `client_id` | uuid PK | |
| `player_id` | uuid FK, UNIQUE (ถ้าไม่ว่าง) | 1 คน 1 คำตอบ แก้ไขของตัวเองได้ |
| `content_rating`, `usability_rating`, `confidence_rating`, `app_rating` | smallint | คะแนน 1–5 (เนื้อหา / ใช้งานง่าย / ความมั่นใจ / ภาพรวม) |
| `knowledge_rating` | smallint | 1–5 (ฟิลด์รุ่นแรก) |
| `improvement_area` | text | `lessons`, `assessment`, `call1669`, `cpr`, `aed`, `interface` |
| `comment` | text | ไม่เกิน 300 ตัวอักษร |
| `created_at`, `updated_at` | timestamptz | |

### 3.5 `nong_prom_private.admin_config` — ผู้ดูแลระบบ (มีได้ 1 แถว)

| คอลัมน์ | ชนิด | กติกา / ความหมาย |
|---|---|---|
| `singleton` | boolean PK, CHECK = true | บังคับให้มีแถวเดียว |
| `player_id` | uuid FK → `game_players` UNIQUE | บัญชีที่เป็นผู้ดูแล (ลบบัญชีนี้ไม่ได้: RESTRICT) |
| `server_secret_hash` | text | SHA-256 (hex 64 ตัว) ของ `NONG_PROM_ADMIN_SECRET` |
| `created_at`, `updated_at` | timestamptz | |

### 3.6 `nong_prom_private.admin_audit_log` — บันทึกการกระทำของผู้ดูแล

| คอลัมน์ | ชนิด | ความหมาย |
|---|---|---|
| `id` | uuid PK | |
| `admin_player_id` | uuid | ผู้ดูแลที่ทำรายการ |
| `target_player_id` | uuid | ผู้ใช้ที่ถูกลบ (เก็บแค่ ID ไม่เก็บชื่อ/เบอร์) |
| `action` | text | ตอนนี้มีเฉพาะ `delete_player` |
| `created_at` | timestamptz | |

## 4. ฟังก์ชัน (RPC)

ทุกฟังก์ชันที่แอปเรียกอยู่ใน `public` และส่วนใหญ่เป็นตัวห่อ (wrapper) ที่ส่งต่อไปยัง `nong_prom_private`

| ฟังก์ชันใน `public` | ใครเรียก (API route) | ทำอะไร |
|---|---|---|
| `register_game_player_v3(phone, name, pin, school, year)` | `/api/player/auth` | สมัครโปรไฟล์ คืน token ครั้งเดียว |
| `login_game_player(phone, pin)` | `/api/player/auth` | ล็อกอิน มี lockout 5 ครั้ง / 15 นาที |
| `logout_game_player(token)` | `/api/player/session` | ลบเซสชัน |
| `get_game_player_v2(token)` | `/api/player/session`, `/attempt` | ข้อมูลโปรไฟล์ XP อันดับของตัวเอง |
| `submit_game_attempt_v2(token, …, audio_guided)` | `/api/player/attempt` | บันทึกผลฝึก (สูตรปัจจุบัน) |
| `get_public_leaderboard_v2(limit, audio_guided)` | `/api/player/leaderboard` | อันดับสาธารณะ ไม่เปิดเบอร์โทร |
| `submit_app_feedback_v2(token, …)` / `get_app_feedback_v2(token)` | `/api/player/feedback` | ส่งและอ่านแบบประเมินของตัวเอง |
| `admin_access(token, secret)` | `/api/player/admin/access` | ตรวจว่าเป็นผู้ดูแลหรือไม่ |
| `admin_overview(token, secret, search, page)` | `/api/player/admin/overview` | รายการผู้ใช้ ค้นหา แบ่งหน้า (25/หน้า) |
| `admin_player_detail(token, secret, player_id)` | `/api/player/admin/players/[id]` | ข้อมูลเต็มของผู้ใช้หนึ่งคน |
| `admin_delete_player(token, secret, player_id, confirmation)` | `/api/player/admin/players/[id]` | ลบถาวร ต้องพิมพ์ชื่อให้ตรง ลบผู้ดูแลไม่ได้ |
| `admin_training_analytics(token, secret, days, school, year)` | `/api/player/admin/analytics` | สถิติตามช่วงวัน โรงเรียน ชั้นปี |

ฟังก์ชันภายในที่ห้ามเรียกจากภายนอก ได้แก่ `nong_prom_private.require_admin` (ตรวจสิทธิ์ผู้ดูแล), `profile_v2`, `stats_v2`, `leaderboard_v2`, `submit_v2` และ `public.normalize_thai_mobile`, `set_nong_prom_updated_at` (trigger)

ฟังก์ชันรุ่นแรก (`register_game_player`, `get_game_player`, `submit_game_attempt`, `get_public_leaderboard`, `submit_app_feedback`) ดูหัวข้อ [11](#11-ของเก่าที่ยังอยู่-legacy)

## 5. สิทธิ์และความปลอดภัย

| บทบาท | ตาราง NONG PROM | ฟังก์ชัน |
|---|---|---|
| `anon` / `authenticated` (publishable key) | อ่านเขียนตรงไม่ได้ (RLS เปิด ไม่มี policy และถอน grant แล้ว) | เรียกได้เฉพาะ wrapper ที่ grant ไว้ |
| `service_role` | — | แอปไม่ใช้ และ**ห้ามใส่ service-role key ใน Vercel** |
| ผู้ดูแล | ไม่มีสิทธิ์พิเศษระดับตาราง | ผ่าน `admin_*` เมื่อ token + secret ถูกต้องเท่านั้น |

- ฟังก์ชัน `SECURITY DEFINER` ทุกตัวตั้ง `search_path = ''` และอ้างชื่อเต็ม (`schema.table`) กันการแทรก object ปลอม
- คำตอบจาก API ส่วนตัวใช้ `private, no-store`
- หลังแก้ฐานข้อมูลทุกครั้ง ให้เปิด **Supabase → Advisors → Security** แล้วตรวจว่าไม่มีคำเตือนใหม่ที่เกี่ยวกับตาราง NONG PROM

## 6. Migration

| ไฟล์ | สิ่งที่เพิ่ม |
|---|---|
| `20260920000000_training_progress.sql` | ตารางรุ่นแรกที่ผูกกับ Supabase Auth (ตอนนี้ไม่ใช้แล้ว ดูหัวข้อ 11) |
| `20260921000000_game_profiles_leaderboard.sql` | `game_players`, `game_sessions`, `game_attempts`, ล็อกอินด้วยเบอร์ + PIN |
| `20260921010000_security_hardening.sql` | เซสชัน 7 วัน, จำกัดเซสชัน, rate limit, ถอนสิทธิ์ตรง |
| `20261008083616_game_score_measured_v2.sql` | schema `nong_prom_private`, `game_attempts_v2`, คะแนน 3 ส่วน, อันดับแยกโหมดเสียง |
| `20261010101414_profile_school_year_feedback.sql` | โรงเรียน ชั้นปี และแบบประเมิน |
| `20261011070007_improve_app_feedback.sql` | แบบประเมิน 4 ด้าน + หัวข้อที่ควรปรับ |
| `20261017022541_single_admin_dashboard.sql` | `admin_config`, `admin_audit_log`, ฟังก์ชัน `admin_*` |
| `20261027155518_admin_training_analytics.sql` | สถิติการฝึกสำหรับหลังบ้าน |

**ผลทดสอบ (13 พ.ย. 2569):** รันทั้ง 8 ไฟล์ตามลำดับบนฐานข้อมูลเปล่าผ่านทั้งหมด ได้ 10 ตารางและ 35 ฟังก์ชัน ตรงกับของน้องพร้อมบน production ทุกตัว และทดสอบสมัครผู้เล่นได้

> ตาราง `supabase_migrations.schema_migrations` บน production บันทึกไว้แค่ 2 รายการ เพราะไฟล์ช่วงแรกถูกรันผ่าน SQL Editor ให้ถือไฟล์ใน repo เป็นหลัก ไม่ใช่ประวัติใน Dashboard

**การเพิ่ม migration ใหม่:** ตั้งชื่อ `YYYYMMDDHHMMSS_คำอธิบาย.sql` → ทดสอบบนโปรเจกต์ทดลองก่อน → apply บน production → ตรวจ Advisors → commit ไฟล์ลง Git → push โค้ดที่ใช้ฟังก์ชันใหม่

## 7. ติดตั้งบนโปรเจกต์ใหม่ / ย้ายระบบ

ใช้เมื่อส่งมอบให้บัญชีของหน่วยฝึก หรือย้ายออกจากโปรเจกต์ที่ใช้ร่วมกับระบบอื่น

1. **สร้างโปรเจกต์** Supabase ใหม่ (region Singapore) ด้วยอีเมลของผู้รับมอบ
2. **สร้างโครงสร้าง** เปิด SQL Editor แล้วรันไฟล์ใน `supabase/migrations/` ทีละไฟล์**ตามลำดับชื่อ** (หรือใช้ `supabase link` + `supabase db push`)
3. **ตรวจ** Advisors → Security และนับว่าได้ 4 ตารางใน `nong_prom_private` + 6 ตารางใน `public`
4. **ตั้งค่า Vercel** (Project → Settings → Environment Variables)
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL ใหม่
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key ใหม่
   - `NONG_PROM_ADMIN_SECRET` = ค่าสุ่มใหม่ (เช่น `openssl rand -hex 32`) ตั้งเป็น Sensitive
5. **Redeploy** แล้วเปิดเว็บ สมัครโปรไฟล์ของผู้ดูแล
6. **ผูกผู้ดูแล** ตามหัวข้อ [8.1](#81-ตั้งผู้ดูแลคนแรก)
7. **ย้ายข้อมูลเดิม (ถ้ามี)** ตามหัวข้อ [9.3](#93-ย้ายข้อมูลข้ามโปรเจกต์) ถ้าไม่ย้าย ผู้ใช้เดิมต้องสมัครใหม่
8. **Smoke test:** สมัคร → ฝึกจนจบ → ผลขึ้นในอันดับ → ส่งแบบประเมิน → เข้า `/admin` ได้ → เปิด `/api/player/admin/overview` แบบไม่ล็อกอินต้องได้ `401`

## 8. ตั้งค่าและเปลี่ยนผู้ดูแล

### 8.1 ตั้งผู้ดูแลคนแรก

สมัครโปรไฟล์ผ่านหน้าเว็บก่อน แล้วรันใน SQL Editor (แทนค่าในวงเล็บ อย่าบันทึกคำสั่งที่มี secret จริงลงไฟล์ใด ๆ):

```sql
insert into nong_prom_private.admin_config (player_id, server_secret_hash)
select id, encode(extensions.digest('<ค่า NONG_PROM_ADMIN_SECRET>', 'sha256'), 'hex')
from public.game_players
where phone_normalized = '<เบอร์ผู้ดูแล 10 หลัก>';
```

### 8.2 เปลี่ยนบัญชีผู้ดูแล (เช่น ส่งมอบให้ครูคนใหม่)

ให้ครูสมัครโปรไฟล์ของตัวเองก่อน แล้ว:

```sql
update nong_prom_private.admin_config
set player_id = (select id from public.game_players where phone_normalized = '<เบอร์ครู>'),
    updated_at = now()
where singleton;
```

### 8.3 หมุน secret (เมื่อสงสัยว่ารั่ว หรือหลังส่งมอบ)

ต้องเปลี่ยน**สองที่พร้อมกัน** ไม่อย่างนั้นหลังบ้านจะเข้าไม่ได้

1. Vercel: แก้ `NONG_PROM_ADMIN_SECRET` เป็นค่าใหม่
2. Supabase:
   ```sql
   update nong_prom_private.admin_config
   set server_secret_hash = encode(extensions.digest('<ค่าใหม่>', 'sha256'), 'hex'), updated_at = now()
   where singleton;
   ```
3. Redeploy บน Vercel แล้วทดสอบเข้า `/admin`

### 8.4 ผู้ดูแลลืม PIN / บัญชีถูกล็อก

```sql
-- ปลดล็อก
update public.game_players set failed_login_count = 0, locked_until = null
where phone_normalized = '<เบอร์>';

-- ตั้ง PIN ใหม่ (ตัวเลข 4–8 หลัก) แล้วตัดทุกเซสชันเดิม
update public.game_players
set pin_hash = extensions.crypt('<PIN ใหม่>', extensions.gen_salt('bf', 8)), updated_at = now()
where phone_normalized = '<เบอร์>';
delete from public.game_sessions
where player_id = (select id from public.game_players where phone_normalized = '<เบอร์>');
```

## 9. สำรองและกู้คืนข้อมูล

### 9.1 สำรอง

- **แพ็กเกจฟรี:** Supabase ไม่มี backup ให้ดาวน์โหลดเอง ให้สำรองด้วย CLI อย่างน้อยเดือนละครั้งและก่อนแก้ฐานข้อมูลทุกครั้ง
  ```bash
  # ใช้ connection string จาก Supabase → Connect (อย่า commit ค่านี้)
  pg_dump "$DB_URL" --data-only \
    --table=public.game_players --table=public.game_sessions \
    --schema=nong_prom_private > nongprom_data_$(date +%F).sql
  ```
  หรือ `supabase db dump --data-only -f nongprom_data.sql` (ไฟล์นี้มีเบอร์โทร เก็บในที่ปลอดภัย ห้ามใส่ใน Git)
- **แพ็กเกจเสียเงิน:** มี Daily backup / Point-in-time recovery ใน Dashboard

### 9.2 กู้คืน

1. หยุดการลบหรือแก้ข้อมูลจากหลังบ้าน
2. จดเวลาและ ID ที่ได้รับผลกระทบ
3. กู้จาก backup ของแพ็กเกจ หรือรันไฟล์ `.sql` ที่สำรองไว้บนโปรเจกต์ที่สร้างโครงสร้างตามหัวข้อ 7 แล้ว
4. ถ้าต้องแก้โครงสร้าง ให้ทำเป็น migration ใหม่

### 9.3 ย้ายข้อมูลข้ามโปรเจกต์

ลำดับการนำเข้า (ตาม FK): `game_players` → `game_sessions` (ไม่ต้องย้ายก็ได้ ผู้ใช้ล็อกอินใหม่) → `game_attempts_v2` → `app_feedback` → `admin_config` (ตั้งใหม่ตามหัวข้อ 8.1 ดีกว่า) → `admin_audit_log`

PIN ยังใช้ได้หลังย้าย เพราะ bcrypt hash ย้ายไปทั้งค่า

## 10. SQL ที่ใช้บ่อย

```sql
-- จำนวนผู้ใช้ ผลฝึก และแบบประเมิน
select (select count(*) from public.game_players)                 as players,
       (select count(*) from nong_prom_private.game_attempts_v2)  as attempts,
       (select count(*) from nong_prom_private.app_feedback)      as feedback;

-- ผลฝึกแยกโรงเรียน/ชั้นปี (ไม่แสดงเบอร์โทร)
select p.school_name, p.training_year, count(a.*) attempts,
       round(avg(a.overall_score)) avg_score, max(a.overall_score) best
from public.game_players p
left join nong_prom_private.game_attempts_v2 a on a.player_id = p.id
group by 1, 2 order by 1, 2;

-- คะแนนเฉลี่ยแบบประเมิน
select round(avg(content_rating),2) content, round(avg(usability_rating),2) usability,
       round(avg(confidence_rating),2) confidence, round(avg(app_rating),2) overall, count(*) n
from nong_prom_private.app_feedback;

-- ใครเป็นผู้ดูแลตอนนี้
select p.display_name, right(p.phone_normalized, 4) phone_last4
from nong_prom_private.admin_config c join public.game_players p on p.id = c.player_id;

-- ล้างเซสชันหมดอายุ
delete from public.game_sessions where expires_at <= now();
```

## 11. ของเก่าที่ยังอยู่ (Legacy)

migration ช่วงแรกสร้าง object ต่อไปนี้ไว้ และยังอยู่ใน production

| Object | สถานะ |
|---|---|
| `public.mission_attempts`, `learning_completions`, `mission_drafts`, view `user_progress_summary` | รุ่นแรกที่ผูกกับ Supabase Auth ปัจจุบันไม่มีผู้ใช้ (`auth.users` = 0) และแอปไม่เรียกแล้ว |
| `public.game_attempts` + `submit_game_attempt` | สูตรคะแนนรุ่นแรก API ยังรับไว้เพื่อรองรับเครื่องที่มีผลค้างจากรุ่นเก่า (`/api/player/attempt` เมื่อไม่มี `scoringVersion`) |
| `register_game_player`, `get_game_player`, `get_public_leaderboard`, `submit_app_feedback`, `game_player_profile` | ฟังก์ชันรุ่นก่อน v2/v3 โค้ดยังประกาศชื่อไว้แต่ไม่ได้ใช้ในเส้นทางหลัก |

อย่าลบด้วยมือ ถ้าจะเลิกใช้ ให้ลบในโค้ดก่อน แล้วเขียน migration `drop …` ทดสอบบนโปรเจกต์ทดลอง และรันเทสต์ทั้งหมด

## 12. สถานะปัจจุบันและเรื่องที่ต้องรู้

ข้อมูล ณ 13 พ.ย. 2569:

- ข้อมูลใน production มีผู้ใช้ 1 บัญชี (บัญชีผู้ดูแล), ผลฝึก 1 รายการ และแบบประเมิน 1 รายการ ทั้งหมดเป็นข้อมูลทดสอบ ยังไม่มีผู้ใช้จริง
- **โปรเจกต์ Supabase ปัจจุบัน (`NONG PROM — rordor37`) ใช้ร่วมกับระบบหอสมุด** (ตาราง `library_*`, `students`, `staff_users`, view `library_roster` และฟังก์ชัน `check_in`, `staff_*`) ห้ามแก้หรือลบ object เหล่านั้นในนามของน้องพร้อม และ**ห้ามส่งมอบโปรเจกต์นี้ทั้งก้อน** ให้ย้ายน้องพร้อมไปโปรเจกต์ใหม่ตามหัวข้อ 7
- ระบบยืม–คืนอุปกรณ์รุ่นเก่าถูกปิดสิทธิ์แล้ว (migration `disable_equipment_borrow_system`) และมีไฟล์สำรองแยกไว้
- แพ็กเกจฟรีของ Supabase อาจพักโปรเจกต์ที่ไม่มีการใช้งานต่อเนื่อง ตรวจเงื่อนไขปัจจุบันในหน้า Pricing และกำหนดคนเปิดใช้งานต่อ (Restore) หากถูกพัก
