'use client';

import React from 'react';
import { X, ShieldAlert, HeartPulse, FileText, Award } from 'lucide-react';
import { PROTOTYPE_DISCLAIMER } from '@/data/learning';
import { MAIN_PROTOCOL_METADATA } from '@/data/scenarios';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-[#D8E4DE] rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#D8E4DE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F5C4D] text-white flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17221E]">เกี่ยวกับน้องพร้อม</h3>
              <p className="text-xs text-[#5C6B65]">NONG PROM — ROTC37 Training Companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7FAF8] border border-[#D8E4DE] text-[#5C6B65] hover:text-[#17221E] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-[#17221E] leading-relaxed">
          {/* Main Positioning Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>ข้อจำกัดและข้อควรระวังสำคัญ</span>
            </div>
            <p className="text-xs leading-relaxed">
              &ldquo;น้องพร้อมเป็นเครื่องมือเสริมการเรียนรู้และการฝึกทบทวนผ่านสถานการณ์จำลอง ไม่สามารถทดแทนการฝึกภาคปฏิบัติกับครูฝึก บุคลากรทางการแพทย์ หรือหุ่นฝึกมาตรฐานได้&rdquo;
            </p>
          </div>

          {/* Prototype disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#0F5C4D] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#17221E] text-xs mb-0.5">สถานะเนื้อหาต้นแบบ (Prototype)</div>
              <p className="text-xs text-[#5C6B65]">{PROTOTYPE_DISCLAIMER}</p>
            </div>
          </div>

          {/* Technical Limitations */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#17221E] flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-red-500" />
              ข้อจำกัดการวัดผลผ่านอุปกรณ์มือถือ
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-[#5C6B65] text-xs">
              <li>
                คะแนน <strong className="text-[#0F5C4D]">Compression Rhythm Score</strong> วัดเฉพาะความถี่ของเวลาในการกดปุ่มบนหน้าจอสัมผัสเท่านั้น
              </li>
              <li>
                โทรศัพท์มือถือ<strong className="text-red-600">ไม่สามารถวัด</strong>: ความลึกในการกด (Compression depth), ตำแหน่งวางมือ, การคืนตัวของหน้าอก (Chest recoil), หรือแรงกดจริง
              </li>
              <li>
                ระบบจำลองการแจ้งเหตุ 1669 และ AED เป็นสื่อเพื่อการศึกษาเท่านั้น ไม่มีการโทรออกสายจริง
              </li>
            </ul>
          </div>

          {/* Protocol Info */}
          <div className="p-3.5 rounded-xl bg-[#DFF4EC] border border-[#D8E4DE] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0F5C4D] font-medium">Protocol ID:</span>
              <span className="font-mono text-[#17221E]">{MAIN_PROTOCOL_METADATA.protocolId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#0F5C4D] font-medium">Version:</span>
              <span className="font-mono text-[#17221E]">{MAIN_PROTOCOL_METADATA.version}</span>
            </div>
            <div className="flex items-start justify-between text-xs gap-2 pt-1.5 border-t border-[#D8E4DE]">
              <span className="text-[#0F5C4D] font-medium shrink-0">หน่วยฝึก:</span>
              <span className="text-[#17221E] text-right">หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37 (มทบ.37)</span>
            </div>
            <div className="flex items-start justify-between text-xs gap-2">
              <span className="text-[#0F5C4D] font-medium shrink-0">ศูนย์ฝึก:</span>
              <span className="text-[#17221E] text-right">ศูนย์วันอังคาร โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย</span>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-[#17221E] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0F5C4D]" />
              สโลแกนโครงการ
            </h4>
            <p className="text-sm italic text-[#0F5C4D] font-medium bg-[#DFF4EC] p-3 rounded-lg border border-[#D8E4DE]">
              &ldquo;เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา&rdquo;
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#D8E4DE] text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#0F5C4D] hover:bg-[#0a4a3d] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            เข้าใจแล้ว เข้าสู่แอป
          </button>
        </div>
      </div>
    </div>
  );
};
