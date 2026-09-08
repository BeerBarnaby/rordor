import { AEDStepItem, EmergencyCallField, SequenceCardItem } from '@/types';

export interface ProtocolMetadata {
  protocolId: string;
  version: string;
  reviewStatus: string;
  lastUpdated: string;
}

export const MAIN_PROTOCOL_METADATA: ProtocolMetadata = {
  protocolId: 'CPR_ADULT_ROTC_V1',
  version: '1.0.0',
  reviewStatus: 'prototype_pending_expert_review',
  lastUpdated: '2026-09-09',
};

export const INITIAL_SEQUENCE_CARDS: SequenceCardItem[] = [
  {
    id: 'seq_1',
    title: 'ตรวจความปลอดภัยของพื้นที่',
    subtitle: 'ประเมินภัยรอบตัวก่อนเข้าช่วยเหลือ',
    isCorrect: true,
    correctOrder: 1,
    feedbackIfCorrect: 'ถูกต้อง! การตรวจภัยรอบตัวช่วยป้องกันอันตรายซ้ำซ้อนแก่ผู้ช่วยเหลือ',
    feedbackIfWrong: 'ก่อนเข้าช่วย ควรตรวจความปลอดภัยของพื้นที่ก่อน เพื่อไม่ให้เกิดผู้บาดเจ็บเพิ่ม',
  },
  {
    id: 'seq_2',
    title: 'ตรวจการตอบสนอง',
    subtitle: 'ตบไหล่ทั้งสองข้างแรงๆ แล้วเรียก',
    isCorrect: true,
    correctOrder: 2,
    feedbackIfCorrect: 'เยี่ยมมาก! ประเมินสติผู้ป่วยด้วยการตบไหล่ทั้งสองข้าง',
    feedbackIfWrong: 'หากพื้นที่ปลอดภัยแล้ว ต้องรีบประเมินการรู้สึกตัวของผู้ป่วย',
  },
  {
    id: 'seq_3',
    title: 'ขอความช่วยเหลือ',
    subtitle: 'ตะโกนเรียกผู้คนที่อยู่ใกล้เคียง',
    isCorrect: true,
    correctOrder: 3,
    feedbackIfCorrect: 'ถูกต้อง! การขอความช่วยเหลือทำให้มีคนช่วยโทร 1669 และนำ AED มา',
    feedbackIfWrong: 'เมื่อพบผู้ป่วยไม่รู้สึกตัว ต้องรีบตะโกนขอความช่วยเหลือทันที',
  },
  {
    id: 'seq_4',
    title: 'แจ้ง 1669 และขอ AED',
    subtitle: 'ระบุบุคคลให้โทรแจ้งเหตุฉุกเฉิน',
    isCorrect: true,
    correctOrder: 4,
    feedbackIfCorrect: 'ดีมาก! การโทร 1669 และตาม AED ช่วยให้ระบบการแพทย์ฉุกเฉินทำงานทันที',
    feedbackIfWrong: 'ต้องระบุคนให้โทร 1669 และตามเครื่อง AED โดยเร็ว',
  },
  {
    id: 'seq_5',
    title: 'ประเมินการหายใจ',
    subtitle: 'ดูการขยับของหน้าอก 5-10 วินาที',
    isCorrect: true,
    correctOrder: 5,
    feedbackIfCorrect: 'ถูกต้อง! สังเกตหน้าอกหากไม่หายใจหรือหายใจเฮือก ให้เริ่ม CPR',
    feedbackIfWrong: 'ก่อนเริ่มกดหน้าอก ต้องตรวจดูว่าผู้ป่วยยังหายใจปกติหรือไม่',
  },
  {
    id: 'seq_6',
    title: 'เริ่ม CPR (กดหน้าอก)',
    subtitle: 'วางส้นมือตรงกึ่งกลางหน้าอก กด 100-120 BPM',
    isCorrect: true,
    correctOrder: 6,
    feedbackIfCorrect: 'ถูกต้อง! เริ่มกดหน้าอกทันทีเมื่อพบว่าผู้ป่วยไม่หายใจปกติ',
    feedbackIfWrong: 'เมื่อผู้ป่วยไม่หายใจ ให้เริ่มกดหน้าอกทันที',
  },
  {
    id: 'seq_7',
    title: 'เตรียมและใช้งาน AED',
    subtitle: 'เปิดเครื่อง ติดแผ่น ปฏิบัติตามคำแนะนำ',
    isCorrect: true,
    correctOrder: 7,
    feedbackIfCorrect: 'ถูกต้อง! เมื่อ AED มาถึง ให้เปิดเครื่องและติดแผ่นนำไฟฟ้าทันที',
    feedbackIfWrong: 'เมื่อเครื่อง AED มาถึง ให้รีบเปิดเครื่องและทำตามคำสั่ง',
  },
  // Distractor items
  {
    id: 'dis_1',
    title: 'ให้ผู้ป่วยดื่มน้ำ',
    subtitle: 'นำขวดน้ำมาป้อนผู้ป่วยทันที',
    isCorrect: false,
    feedbackIfWrong: 'ข้อควรระวัง: ห้ามให้ผู้ป่วยหมดสติป้อนน้ำหรืออาหาร เพราะอาจเกิดการสำลักอุดกั้นทางเดินหายใจ!',
  },
  {
    id: 'dis_2',
    title: 'รีบยกผู้ป่วยขึ้นทันที',
    subtitle: 'พยุงตัวผู้ป่วยให้ลุกนั่งหรือยืน',
    isCorrect: false,
    feedbackIfWrong: 'ข้อควรระวัง: ห้ามเคลื่อนย้ายผู้ป่วยหมดสติโดยไม่จำเป็น เพราะอาจทำให้บาดเจ็บกระดูกคอหรือรุนแรงขึ้น!',
  },
];

export const EMERGENCY_CALL_FIELDS: EmergencyCallField[] = [
  {
    id: 'situation',
    label: 'เกิดเหตุอะไรขึ้น',
    question: 'เจ้าหน้าที่ 1669: "เกิดเหตุอะไรขึ้นครับ?"',
    options: [
      {
        id: 'sit_opt_1',
        text: 'นักศึกษาวิชาทหารล้มลงหมดสติ ไม่ตอบสนอง และไม่หายใจครับ',
        isCorrect: true,
        feedback: 'ระบุเหตุการณ์ชัดเจน: หมดสติ ไม่ตอบสนอง และไม่หายใจ',
      },
      {
        id: 'sit_opt_2',
        text: 'มีคนเหนื่อยเฉยๆ ครับ ไม่ต้องรีบ',
        isCorrect: false,
        feedback: 'การแจ้งข้อมูลไม่ชัดเจนอาจทำให้ทีมแพทย์ประเมินความรุนแรงคลาดเคลื่อน',
      },
    ],
  },
  {
    id: 'location',
    label: 'สถานที่เกิดเหตุ',
    question: 'เจ้าหน้าที่ 1669: "สถานที่เกิดเหตุอยู่ที่ไหนครับ?"',
    options: [
      {
        id: 'loc_opt_1',
        text: 'สนามฝึก นศท. ศูนย์วันอังคาร โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย (หน่วยฝึก นศท. มทบ.37)',
        isCorrect: true,
        feedback: 'สถานที่ชัดเจนและมีจุดสังเกตทำให้รถฉุกเฉินเข้าถึงได้รวดเร็ว',
      },
      {
        id: 'loc_opt_2',
        text: 'อยู่ที่สนามฝึกในโรงเรียนครับ ไม่แน่ใจจุดไหน',
        isCorrect: false,
        feedback: 'สถานที่คลุมเครือทำให้ทีมแพทย์เสียเวลาค้นหาพื้นที่เกิดเหตุ',
      },
    ],
  },
  {
    id: 'victim_count',
    label: 'จำนวนผู้ประสบเหตุ',
    question: 'เจ้าหน้าที่ 1669: "มีผู้บาดเจ็บหรือผู้ประสบเหตุทั้งหมดกี่คนครับ?"',
    options: [
      {
        id: 'cnt_opt_1',
        text: 'มีผู้ประสบเหตุ 1 คนครับ เป็นนักศึกษาวิชาทหาร ชาย 1 ราย',
        isCorrect: true,
        feedback: 'แจ้งจำนวนผู้ป่วย 1 ราย ช่วยให้เตรียมรถฉุกเฉินและอุปกรณ์เหมาะสม',
      },
      {
        id: 'cnt_opt_2',
        text: 'มีคนเยอะแยะรอบๆ ครับ ไม่ได้นับ',
        isCorrect: false,
        feedback: 'จำแนกให้ชัดเจนระหว่างไทยมุงกับผู้บาดเจ็บจริง',
      },
    ],
  },
  {
    id: 'symptoms',
    label: 'อาการและสติสัมปชัญญะ',
    question: 'เจ้าหน้าที่ 1669: "ผู้ป่วยมีสติไหม หายใจอยู่หรือเปล่า?"',
    options: [
      {
        id: 'sym_opt_1',
        text: 'หมดสติ ตบไหล่ไม่ตอบสนอง หน้าอกไม่ขยับ กำลังเริ่มทำ CPR ครับ',
        isCorrect: true,
        feedback: 'แจ้งอาการวิกฤต (หมดสติ ไม่หายใจ ทำ CPR) รถฉุกเฉินจะเปิดไซเรนขั้นวิกฤต (ALS)',
      },
      {
        id: 'sym_opt_2',
        text: 'น่าจะหลับไปมั้งครับ ยังไม่ได้ตรวจดู',
        isCorrect: false,
        feedback: 'ต้องตรวจการหายใจและสติให้แน่ชัดก่อนแจ้ง 1669',
      },
    ],
  },
  {
    id: 'contact_info',
    label: 'ชื่อและเบอร์ติดต่อผู้แจ้ง',
    question: 'เจ้าหน้าที่ 1669: "ขอทราบชื่อผู้แจ้งและเบอร์โทรศัพท์ติดต่อกลับด้วยครับ"',
    options: [
      {
        id: 'con_opt_1',
        text: 'นศท. สมชาย ใจดี โทร 081-234-5678 ครับ (ถือสายไว้จนกว่าจะวางสาย)',
        isCorrect: true,
        feedback: 'ให้ชื่อและเบอร์โทรครบถ้วน พร้อมถือสายไว้เผื่อเจ้าหน้าที่แนะคำสอนระหว่างรอ',
      },
      {
        id: 'con_opt_2',
        text: 'แค่นี้นะครับ รีบมาแล้วกัน Bye',
        isCorrect: false,
        feedback: 'อย่าเพิ่งวางสายจนกว่าเจ้าหน้าที่ 1669 จะบอกให้วางสาย!',
      },
    ],
  },
];

export const AED_STEPS: AEDStepItem[] = [
  {
    id: 'aed_step_1',
    title: '1. เปิดเครื่อง AED',
    description: 'กดปุ่มเปิดเครื่อง (Power) หรือเปิดฝาเครื่อง เพื่อฟังคำแนะนำระบบเสียง',
    correctOrder: 1,
    icon: 'Power',
  },
  {
    id: 'aed_step_2',
    title: '2. ติดแผ่นนำไฟฟ้า (AED Pads)',
    description: 'แปะแผ่นแรกใต้ไหปลาร้าขวา และแผ่นที่สองใต้ราวนมซ้ายด้านข้างลำตัว',
    correctOrder: 2,
    icon: 'FileCheck',
  },
  {
    id: 'aed_step_3',
    title: '3. ห้ามสัมผัสผู้ป่วยขณะเครื่องวิเคราะห์',
    description: 'ตะโกน "ถอย! ห้ามแตะตัวผู้ป่วย" เพื่อให้เครื่องวิเคราะห์คลื่นหัวใจได้อย่างแม่นยำ',
    correctOrder: 3,
    icon: 'AlertTriangle',
  },
  {
    id: 'aed_step_4',
    title: '4. ตะโกนเคลียร์พื้นที่ & กดปุ่ม SHOCK',
    description: 'เมื่อเครื่องเตือน "แนะนำให้ทำการช็อก" ตะโกน "ฉันถอย คุณถอย ทุกคนถอย" แล้วกดปุ่มช็อก',
    correctOrder: 4,
    icon: 'Zap',
  },
  {
    id: 'aed_step_5',
    title: '5. กลับเข้าสู่การกดหน้าอก CPR ทันที',
    description: 'หลังการช็อก ให้เริ่มกดหน้าอก CPR ทันทีโดยไม่ต้องดึงแผ่น AED ออก',
    correctOrder: 5,
    icon: 'HeartPulse',
  },
];
