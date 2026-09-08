# น้องพร้อม (NONG PROM) 🚑

> **สโลแกน:** “เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา”

**น้องพร้อม (NONG PROM)** คือเว็บแอปพลิเคชันจำลองการฝึกอบรมปฐมพยาบาลขั้นพื้นฐานและการฟื้นคืนชีพ (CPR + AED) สำหรับนักศึกษาวิชาทหาร (นศท. / ROTC) เพื่อฝึกฝนการประเมินสถานการณ์ฉุกเฉิน การตัดสินใจตามลำดับขั้นตอน การโทรแจ้งเหตุ 1669 และจังหวะการกดหน้าอก CPR ผ่านการสื่อสารเชิงโต้ตอบในรูปแบบสถานการณ์จำลอง (Educational Simulation Game)

---

## 📌 คุณสมบัติสำคัญ (Core Features)

1. **คลังการเรียนรู้มัลติมีเดีย (Learning Center):**
   - รวมวิดีโอสาธิตการทำ CPR และ AED จาก **สพฉ. (1669 CHANNEL)** และ **สภากาชาดไทย** ผ่าน YouTube Embed
   - ลิงก์คู่มือและเอกสารอ้างอิงทางการจากสถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.)
   - การ์ดสรุปขั้นตอนสำคัญ 8 ประการ (Micro-Learning)
2. **ระบบประเมินลำดับการตัดสินใจ (Sequence Game):**
   - เรียงลำดับขั้นตอนสากลการเข้าช่วยเหลือผู้ประสบเหตุ (ตรวจความปลอดภัย -> ตรวจการตอบสนอง -> ขอความช่วยเหลือ -> โทร 1669 -> ประเมินการหายใจ -> เริ่ม CPR -> ใช้ AED)
   - มีระบบตัวลวงและข้อห้าม (Distractor items) พร้อมคำแนะนำเชิงการศึกษาทันทีหลังส่งคำตอบ
3. **ระบบจำลองการแจ้งเหตุ 1669 (Simulated 1669 Call):**
   - จำลองหน้าจอการสื่อสารกับเจ้าหน้าที่ศูนย์รับแจ้งเหตุ 1669 (พร้อมป้ายกำกับชัดเจนว่า **เป็นสถานการณ์จำลอง**)
   - ฝึกการระบุข้อมูลวิกฤต: เหตุการณ์, สถานที่, จำนวนผู้ประสบเหตุ, อาการผู้ป่วย, ระดับสติสัมปชัญญะ และข้อมูลติดต่อ
   - ตารางสรุปความครบถ้วนการสื่อสาร (Completeness Checklist)
4. **เกมฝึกจังหวะกดหน้าอก (CPR Rhythm Game):**
   - ปุ่มกดขนาดใหญ่บนมือถือพร้อมภาพและสัญลักษณ์คำแนะนำ
   - คำนวณจังหวะการกดสมจริง (BPM) โดยใช้เทคนิค **Rolling Window (5-8 การกดล่าสุด)** ด้วยสูตร `60,000 / avgIntervalMs` (ไม้นับการกดครั้งแรก)
   - แสดงสถานะ Real-time: ช้าไป (<100 BPM), จังหวะดี (100–120 BPM), เร็วไป (>120 BPM)
   - รองรับระบบสั่น Haptic Vibration (`navigator.vibrate`)
   - ขั้นตอนสลับช่วยหายใจ 30:2 (เปิดทางเดินหายใจ -> เป่าปาก 2 ครั้ง)
5. **จำลองการใช้งานเครื่อง AED (AED Simulation):**
   - จำลองขั้นตอนเสียงและคำแนะนำของเครื่อง AED: เปิดเครื่อง -> ติดแผ่นนำไฟฟ้า -> ห้ามสัมผัสตัวผู้ป่วย -> ตะโกนเคลียร์พื้นที่ -> กดปุ่ม SHOCK -> เข้าสู่ CPR
6. **การสรุปผลการปฏิบัติ (After Action Review - AAR):**
   - แสดงคะแนนรวม สมรรถนะรายหมวด 6 ด้าน (Assessment, Sequence, Rhythm, 1669 Call, AED, Response Time)
   - ลำดับเหตุการณ์ (Mission Timeline) และระบบทบทวนจุดที่ผิดพลาด
   - การเก็บบันทึกประวัติในเครื่องด้วย `localStorage`

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Modern Dark Military & Medical Teal Theme)
- **Icons:** Lucide React
- **Animations & Effects:** Framer Motion, Canvas Confetti
- **Testing:** Vitest
- **Storage:** Client-side `localStorage` (No Firebase / No External Backend required)

---

## 📁 โครงสร้างโปรเจกต์ (Directory Structure)

```text
rordor/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css          # Theme design tokens & CSS variables
│   │   ├── layout.tsx           # SEO Metadata & Viewport setup
│   │   └── page.tsx             # Main App Navigation & Mission State Machine
│   ├── components/
│   │   ├── AboutModal.tsx       # Modal ข้อมูลโครงการ & Medical Disclaimer
│   │   ├── MascotHeader.tsx     # Nong Prom Avatar & Dynamic speech bubble
│   │   ├── MobileContainer.tsx  # Portrait Mobile Viewport Frame & Bottom Nav
│   │   └── YouTubeModal.tsx     # Embedded YouTube Video Player
│   ├── data/
│   │   ├── learning.ts          # Video library, Documents, & Micro-learning steps
│   │   └── scenarios.ts         # Data-driven Protocol, 1669 Options, AED steps
│   ├── features/
│   │   ├── aed/
│   │   │   └── AEDSimulation.tsx
│   │   ├── cpr/
│   │   │   └── CPRGame.tsx      # CPR Rhythm Trainer & 30:2 Flow
│   │   ├── debrief/
│   │   │   └── AfterActionReview.tsx # AAR Dashboard & Timeline
│   │   ├── emergency-call/
│   │   │   └── EmergencyCallSimulation.tsx # 1669 Call Simulator
│   │   ├── learning/
│   │   │   └── LearningCenter.tsx  # Video & Doc Library
│   │   └── mission/
│   │       └── SequenceGame.tsx    # Step ordering exercise
│   ├── lib/
│   │   ├── __tests__/
│   │   │   └── rhythmCalculator.test.ts # Vitest unit test suite
│   │   ├── progress.ts          # LocalStorage persistence service
│   │   └── rhythmCalculator.ts  # Pure Rolling Window BPM calculation engine
│   └── types/
│       └── index.ts             # Data models & TypeScript interfaces
├── vite.config.ts               # Vitest configuration
├── package.json
└── README.md
```

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. รันในสภาพแวดล้อมพัฒนา (Development)

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

### 3. รัน Unit Tests (Vitest)

```bash
npm run test
```

### 4. ตรวจสอบ Lint และทดสอบ Build สำหรับ Production

```bash
npm run lint
npm run build
```

---

## ⚙️ การแก้ไขและเพิ่มข้อมูลการเรียนรู้ / สถานการณ์ (Data-Driven Customization)

### การเพิ่ม/แก้ไข วิดีโอเรียนรู้
แก้ไขที่ไฟล์ [src/data/learning.ts](file:///d:/Project/rordor/src/data/learning.ts):

```typescript
export const LEARNING_VIDEOS: LearningVideo[] = [
  {
    id: 'video_new_01',
    topicId: 'cpr',
    title: 'ชื่อวิดีโอใหม่',
    provider: 'ชื่อหน่วยงานผู้จัดทำ',
    youtubeId: 'YOUTUBE_VIDEO_ID', // เช่น hoCUvqxGm9k
    duration: '3:00 min',
    description: 'คำอธิบายวิดีโอ',
  },
];
```

### การเพิ่ม/แก้ไข เอกสารอ้างอิง
แก้ไขที่ไฟล์ [src/data/learning.ts](file:///d:/Project/rordor/src/data/learning.ts):

```typescript
export const LEARNING_DOCUMENTS: LearningDocument[] = [
  {
    id: 'doc_new_01',
    topicId: 'aed',
    title: 'ชื่อเอกสารคู่มือ',
    provider: 'สพฉ.',
    url: 'https://www.niems.go.th',
    description: 'รายละเอียดเอกสาร',
    type: 'pdf',
  },
];
```

### การปรับเปลี่ยนเนื้อหา Protocol / สถานการณ์จำลอง
แก้ไขที่ไฟล์ [src/data/scenarios.ts](file:///d:/Project/rordor/src/data/scenarios.ts) เพื่อเปลี่ยนข้อคำถาม 1669, ขั้นตอน AED หรือขั้นตอนการเรียงลำดับ

---

## ☁️ การนำไปติดตั้งบน Vercel (Deployment)

โปรเจกต์นี้ได้รับการออกแบบให้รองรับการ Deploy บน **Vercel** แบบ Zero-Configuration:

1. Push โค้ดขึ้นบน GitHub / GitLab Repository
2. เข้าสู่ Dashboard บน [Vercel](https://vercel.com) -> คลิก **Add New Project**
3. เลือก Repository ที่ต้องการ แล้วกด **Deploy**
4. Vercel จะทำการตรวจหา Next.js App Router และทำการ Build โดยอัตโนมัติ

---

## ⚠️ ข้อควรระวังและการขอรับรองทางแพทย์ (Medical Content Review & Limitations)

1. **เครื่องมือเสริมการเรียนรู้:**  
   “น้องเป็นเครื่องมือเสริมการเรียนรู้และการฝึกทบทวนผ่านสถานการณ์จำลอง ไม่สามารถทดแทนการฝึกภาคปฏิบัติกับครูฝึก บุคลากรทางการแพทย์ หรือหุ่นฝึกมาตรฐานได้”
2. **ข้อจำกัดการวัดผลผ่านหน้าจอมือถือ:**  
   คะแนน `Compression Rhythm Score` วัดเฉพาะความถี่ของเวลาการกดปุ่มบนหน้าจอสัมผัสเท่านั้น โทรศัพท์มือถือ**ไม่สามารถวัด** ความลึกในการกด (Compression Depth), ตำแหน่งการวางมือ, การคืนตัวของหน้าอก (Chest Recoil), หรือแรงกดจริงได้
3. **สถานะเนื้อหาต้นแบบ:**  
   เนื้อหาต้นแบบ (Prototype) ต้องผ่านการตรวจทานอย่างเป็นทางการจากครูฝึกและผู้เชี่ยวชาญทางการแพทย์ก่อนนำไปใช้งานจริงในหลักสูตร
