import { AEDStepItem, EmergencyCallField, ScenarioVariant, SequenceCardItem } from '@/types';

export interface ProtocolMetadata {
  protocolId: string;
  version: string;
  reviewStatus: string;
  lastUpdated: string;
}

export const MAIN_PROTOCOL_METADATA: ProtocolMetadata = {
  protocolId: 'CPR_ADULT_ROTC_V1',
  version: '1.1.0',
  reviewStatus: 'prototype_pending_expert_review',
  lastUpdated: '2026-09-19',
};

// บริบทเปลี่ยนได้ แต่ลำดับและสาระทางการแพทย์ใช้ชุดที่รอตรวจทานชุดเดิม
export const SCENARIO_VARIANTS: ScenarioVariant[] = [
  {
    id: 'SCENARIO_ROTC_FIELD',
    code: 'สถานการณ์ 01',
    title: 'เพื่อนล้มลงระหว่างการฝึก',
    setting: 'สนามฝึก',
    opening: 'ระหว่างการฝึก เพื่อนคนหนึ่งล้มลงตรงหน้าคุณ เรียกแล้วไม่ตอบสนอง และไม่หายใจปกติ',
    situationAnswer: 'นักศึกษาวิชาทหารล้มลง ไม่ตอบสนอง และไม่หายใจปกติครับ',
    locationAnswer: 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37 ครับ',
    victimAnswer: 'มีผู้ประสบเหตุ 1 คนครับ เป็นนักศึกษาวิชาทหารชาย 1 ราย',
  },
  {
    id: 'SCENARIO_ROTC_BUILDING',
    code: 'สถานการณ์ 02',
    title: 'เพื่อนล้มลงบริเวณอาคารเรียน',
    setting: 'อาคารเรียน',
    opening: 'บริเวณหน้าอาคารเรียน เพื่อนคนหนึ่งล้มลงต่อหน้าคุณ เรียกแล้วไม่ตอบสนอง และไม่หายใจปกติ',
    situationAnswer: 'นักเรียนล้มลง ไม่ตอบสนอง และไม่หายใจปกติครับ',
    locationAnswer: 'หน้าอาคารเรียน โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงรายครับ',
    victimAnswer: 'มีผู้ประสบเหตุ 1 คนครับ เป็นนักเรียนชาย 1 ราย',
  },
  {
    id: 'SCENARIO_ROTC_ACTIVITY',
    code: 'สถานการณ์ 03',
    title: 'เพื่อนล้มลงในพื้นที่กิจกรรม',
    setting: 'พื้นที่กิจกรรม',
    opening: 'ระหว่างทำกิจกรรม เพื่อนคนหนึ่งล้มลงใกล้คุณ เรียกแล้วไม่ตอบสนอง และไม่หายใจปกติ',
    situationAnswer: 'ผู้ร่วมกิจกรรมล้มลง ไม่ตอบสนอง และไม่หายใจปกติครับ',
    locationAnswer: 'พื้นที่กิจกรรม โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงรายครับ',
    victimAnswer: 'มีผู้ประสบเหตุ 1 คนครับ เป็นผู้ร่วมกิจกรรมชาย 1 ราย',
  },
];

export const INITIAL_SEQUENCE_CARDS: SequenceCardItem[] = [
  {
    id: 'seq_1',
    title: 'ตรวจความปลอดภัยของพื้นที่',
    subtitle: 'ประเมินภัยรอบตัวก่อนเข้าช่วยเหลือ',
    isCorrect: true,
    correctOrder: 1,
    feedbackIfCorrect: 'ตรวจพื้นที่ก่อนช่วย เพื่อลดความเสี่ยงต่อผู้ช่วยเหลือและผู้ประสบเหตุ',
    feedbackIfWrong: 'ก่อนเข้าช่วย ควรตรวจความปลอดภัยของพื้นที่ก่อน เพื่อไม่ให้เกิดผู้บาดเจ็บเพิ่ม',
  },
  {
    id: 'seq_2',
    title: 'ตรวจการตอบสนอง',
    subtitle: 'ตบไหล่ทั้งสองข้างแรงๆ แล้วเรียก',
    isCorrect: true,
    correctOrder: 2,
    feedbackIfCorrect: 'ประเมินการตอบสนองด้วยการเรียกและตบไหล่ทั้งสองข้าง',
    feedbackIfWrong: 'หากพื้นที่ปลอดภัยแล้ว ต้องรีบประเมินการรู้สึกตัวของผู้ป่วย',
  },
  {
    id: 'seq_3',
    title: 'ประเมินการหายใจ',
    subtitle: 'ดูการหายใจไม่เกิน 10 วินาที',
    isCorrect: true,
    correctOrder: 3,
    feedbackIfCorrect: 'หากไม่หายใจปกติหรือหายใจเฮือก ให้สงสัยภาวะหัวใจหยุดเต้น',
    feedbackIfWrong: 'หลังพบว่าไม่ตอบสนอง ให้ประเมินการหายใจอย่างรวดเร็วไม่เกิน 10 วินาที',
  },
  {
    id: 'seq_4',
    title: 'ขอความช่วยเหลือ แจ้ง 1669 และนำ AED มา',
    subtitle: 'ระบุคนให้โทร เปิดลำโพง และนำ AED มา',
    isCorrect: true,
    correctOrder: 4,
    feedbackIfCorrect: 'การโทร 1669 และนำ AED มา ทำให้ระบบฉุกเฉินและการช่วยเหลือเริ่มได้เร็ว',
    feedbackIfWrong: 'ต้องระบุคนให้โทร 1669 และตามเครื่อง AED โดยเร็ว',
  },
  {
    id: 'seq_5',
    title: 'เริ่ม CPR (กดหน้าอก)',
    subtitle: 'กดตรงกลางหน้าอกที่ 100–120 ครั้ง/นาที',
    isCorrect: true,
    correctOrder: 5,
    feedbackIfCorrect: 'เริ่มกดหน้าอกทันทีและหยุดให้น้อยที่สุด',
    feedbackIfWrong: 'เมื่อผู้ป่วยไม่หายใจปกติหรือหายใจเฮือก ให้เริ่มกดหน้าอกทันที',
  },
  {
    id: 'seq_6',
    title: 'เปิดเครื่องและติดแผ่น AED',
    subtitle: 'เปิดหน้าอก เช็ดให้แห้ง และติดตามภาพบนแผ่น',
    isCorrect: true,
    correctOrder: 6,
    feedbackIfCorrect: 'เปิดเครื่อง ติดแผ่น และทำตามเสียงสั่งโดยเร็ว',
    feedbackIfWrong: 'เมื่อ AED มาถึง ให้เปิดเครื่องและติดแผ่นตามภาพโดยไม่ชะลอการช่วยเหลือ',
  },
  {
    id: 'seq_7',
    title: 'ทำตาม AED แล้วกลับเข้า CPR',
    subtitle: 'เคลียร์พื้นที่ วิเคราะห์ และกดหน้าอกต่อทันที',
    isCorrect: true,
    correctOrder: 7,
    feedbackIfCorrect: 'ไม่ว่าเครื่องจะแนะนำให้ช็อกหรือไม่ ให้กลับมากดหน้าอกทันที',
    feedbackIfWrong: 'ทำตามเสียงสั่งของ AED และกลับเข้าสู่ CPR ทันทีหลังวิเคราะห์หรือช็อก',
  },
  // Distractor items
  {
    id: 'dis_1',
    title: 'ป้อนน้ำเพื่อให้ฟื้น',
    subtitle: 'ลองให้ผู้ประสบเหตุดื่มน้ำก่อน',
    isCorrect: false,
    feedbackIfWrong: 'ห้ามป้อนน้ำหรืออาหารแก่ผู้ที่ไม่ตอบสนอง เพราะอาจสำลักและอุดกั้นทางเดินหายใจ',
  },
  {
    id: 'dis_2',
    title: 'พยุงให้ลุกนั่งทันที',
    subtitle: 'ยกตัวผู้ประสบเหตุขึ้นก่อนประเมิน',
    isCorrect: false,
    feedbackIfWrong: 'ไม่ควรเคลื่อนย้ายผู้ที่ไม่ตอบสนองโดยไม่จำเป็น เพราะอาจทำให้การบาดเจ็บรุนแรงขึ้น',
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
        text: 'นักศึกษาวิชาทหารล้มลง ไม่ตอบสนอง และไม่หายใจปกติครับ',
        isCorrect: true,
        feedback: 'ระบุเหตุการณ์ชัดเจน: ไม่ตอบสนอง และไม่หายใจปกติ',
      },
      {
        id: 'sit_opt_2',
        text: 'มีคนล้มอยู่ที่สนามครับ ยังไม่ทราบอาการ',
        isCorrect: false,
        status: 'incomplete',
        feedback: 'ข้อมูลยังไม่พอ ควรแจ้งการตอบสนองและการหายใจเท่าที่ตรวจพบ',
      },
      {
        id: 'sit_opt_3',
        text: 'ยังบอกไม่ได้ครับ ช่วยส่งรถมาก่อน',
        isCorrect: false,
        status: 'incorrect',
        feedback: 'ข้อมูลนี้ยังไม่ช่วยให้เจ้าหน้าที่ประเมินเหตุ ควรแจ้งสิ่งที่ตรวจพบให้ชัดเจน',
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
        text: 'สนามฝึก นศท. โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย (หน่วยฝึก นศท. มทบ.37)',
        isCorrect: true,
        feedback: 'สถานที่ชัดเจนและมีจุดสังเกตทำให้รถฉุกเฉินเข้าถึงได้รวดเร็ว',
      },
      {
        id: 'loc_opt_2',
        text: 'อยู่ในโรงเรียนที่เชียงรายครับ ใกล้สนาม',
        isCorrect: false,
        status: 'incomplete',
        feedback: 'สถานที่คลุมเครือทำให้ทีมแพทย์เสียเวลาค้นหาพื้นที่เกิดเหตุ',
      },
      {
        id: 'loc_opt_3',
        text: 'ไม่ทราบชื่อสถานที่ครับ อยู่แถวนี้',
        isCorrect: false,
        status: 'incorrect',
        feedback: 'ข้อมูลนี้ไม่ช่วยระบุตำแหน่งได้ชัดเจน ควรแจ้งชื่อสถานที่และจุดสังเกต',
      },
    ],
  },
  {
    id: 'hazards',
    label: 'ความเสี่ยงในพื้นที่',
    question: 'เจ้าหน้าที่ 1669: "บริเวณเกิดเหตุยังมีอันตรายหรือความเสี่ยงซ้ำไหมครับ?"',
    options: [
      {
        id: 'haz_opt_1',
        text: 'ตรวจแล้วพื้นที่ปลอดภัย ไม่มีไฟฟ้า รถ หรืออุปกรณ์ฝึกที่เป็นอันตรายครับ',
        isCorrect: true,
        feedback: 'แจ้งความปลอดภัยของพื้นที่ ช่วยให้ทีมเตรียมเข้าถึงผู้ประสบเหตุได้เหมาะสม',
      },
      {
        id: 'haz_opt_2',
        text: 'ยังไม่ได้ตรวจพื้นที่ครับ ผมเข้าไปช่วยทันที',
        isCorrect: false,
        status: 'incorrect',
        feedback: 'ควรตรวจอันตรายรอบตัวก่อนเข้าช่วย และแจ้งความเสี่ยงที่ยังมีอยู่',
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
        text: 'มีคนล้มครับ แต่มีคนยืนอยู่รอบๆ หลายคน',
        isCorrect: false,
        status: 'incomplete',
        feedback: 'ควรแยกจำนวนผู้ประสบเหตุออกจากผู้ที่อยู่ในบริเวณ แล้วแจ้งจำนวนให้ชัดเจน',
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
        text: 'ตบไหล่แล้วไม่ตอบสนอง ไม่หายใจปกติ กำลังเริ่มทำ CPR ครับ',
        isCorrect: true,
        feedback: 'แจ้งอาการสำคัญและการช่วยเหลือที่กำลังทำ ช่วยให้ศูนย์ 1669 ประเมินความเร่งด่วนและสั่งการหน่วยที่เหมาะสม',
      },
      {
        id: 'sym_opt_2',
        text: 'ยังไม่แน่ใจครับ ยังไม่ได้ตรวจการตอบสนองหรือการหายใจ',
        isCorrect: false,
        status: 'incomplete',
        feedback: 'รีบแจ้งสิ่งที่สังเกตได้ และทำตามคำแนะนำของเจ้าหน้าที่โดยไม่ชะลอการขอความช่วยเหลือ',
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
        text: 'นศท. สมชาย ใจดี โทร 081-234-5678 ครับ ผมจะถือสายรอคำแนะนำ',
        isCorrect: true,
        feedback: 'ให้ชื่อและเบอร์โทรครบถ้วน พร้อมถือสายไว้เพื่อรับคำแนะนำระหว่างรอ',
      },
      {
        id: 'con_opt_2',
        text: 'ผมเป็นนักศึกษาครับ เดี๋ยววางสายไปช่วยเพื่อนก่อน',
        isCorrect: false,
        status: 'incomplete',
        feedback: 'ควรแจ้งชื่อและเบอร์ติดต่อ และถือสายไว้จนกว่าเจ้าหน้าที่จะบอกให้วาง',
      },
    ],
  },
];

export function getEmergencyCallFields(
  scenario: ScenarioVariant,
): EmergencyCallField[] {
  return EMERGENCY_CALL_FIELDS.map((field) => ({
    ...field,
    options: field.options.map((option) => {
      if (!option.isCorrect) return { ...option };
      if (field.id === 'situation') return { ...option, text: scenario.situationAnswer };
      if (field.id === 'location') return { ...option, text: scenario.locationAnswer };
      if (field.id === 'victim_count') return { ...option, text: scenario.victimAnswer };
      return { ...option };
    }),
  }));
}

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
    description: 'เปิดหน้าอก เช็ดผิวให้แห้ง แล้วติดแผ่นแรกใต้ไหปลาร้าขวา แผ่นที่สองด้านซ้ายตามภาพบนแผ่น',
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
    title: '4. ทำตามผลวิเคราะห์ของ AED',
    description: 'สถานการณ์ฝึกนี้เครื่องแนะนำให้ช็อก จึงต้องเคลียร์พื้นที่ก่อนกดปุ่ม หากเครื่องไม่แนะนำให้ช็อก ให้กลับเข้า CPR ทันที',
    correctOrder: 4,
    icon: 'Zap',
  },
  {
    id: 'aed_step_5',
    title: '5. กลับเข้าสู่การกดหน้าอก CPR ทันที',
    description: 'หลังการวิเคราะห์หรือช็อก ให้เริ่มกดหน้าอกทันทีโดยไม่ดึงแผ่น AED ออก และทำต่อจนเครื่องสั่งใหม่',
    correctOrder: 5,
    icon: 'HeartPulse',
  },
];
