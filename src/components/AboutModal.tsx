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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">เกี่ยวกับน้องพร้อม</h3>
              <p className="text-xs text-slate-400">NONG PROM Companion App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Main Positioning Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>ข้อจำกัดและข้อควรระวังสำคัญ</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              &ldquo;น้องพร้อมเป็นเครื่องมือเสริมการเรียนรู้และการฝึกทบทวนผ่านสถานการณ์จำลอง ไม่สามารถทดแทนการฝึกภาคปฏิบัติกับครูฝึก บุคลากรทางการแพทย์ หรือหุ่นฝึกมาตรฐานได้&rdquo;
            </p>
          </div>

          {/* Prototype disclaimer */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200 mb-0.5">สถานะเนื้อหาต้นแบบ (Prototype)</div>
              <p className="text-[11px] text-slate-300">{PROTOTYPE_DISCLAIMER}</p>
            </div>
          </div>

          {/* Technical Limitations */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              ข้อจำกัดการวัดผลผ่านอุปกรณ์มือถือ
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
              <li>
                คะแนน <strong className="text-emerald-400">Compression Rhythm Score</strong> วัดเฉพาะความถี่ของเวลาในการกดปุ่มบนหน้าจอสัมผัสเท่านั้น
              </li>
              <li>
                โทรศัพท์มือถือ<strong className="text-rose-300">ไม่สามารถวัด</strong>: ความลึกในการกด (Compression depth), ตำแหน่งวางมือ, การคืนตัวของหน้าอก (Chest recoil), หรือแรงกดจริง
              </li>
              <li>
                ระบบจำลองการแจ้งเหตุ 1669 และ AED เป็นสื่อเพื่อการศึกษาเท่านั้น ไม่มีการโทรออกสายจริง
              </li>
            </ul>
          </div>

          {/* Protocol Info */}
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">Protocol ID:</span>
              <span className="font-mono text-emerald-200">{MAIN_PROTOCOL_METADATA.protocolId}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">Version:</span>
              <span className="font-mono text-emerald-200">{MAIN_PROTOCOL_METADATA.version}</span>
            </div>
            <div className="flex items-start justify-between text-[11px] gap-2 pt-1 border-t border-emerald-800/40">
              <span className="text-emerald-400 font-medium shrink-0">หน่วยฝึก:</span>
              <span className="text-emerald-200 text-right">หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37 (มทบ.37)</span>
            </div>
            <div className="flex items-start justify-between text-[11px] gap-2">
              <span className="text-emerald-400 font-medium shrink-0">ศูนย์ฝึก:</span>
              <span className="text-emerald-200 text-right">ศูนย์วันอังคาร โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย</span>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              สโลแกนโครงการ
            </h4>
            <p className="text-[12px] italic text-emerald-300 font-medium bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
              &ldquo;เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา&rdquo;
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-900/40"
          >
            เข้าใจแล้ว เข้าสู่แอป
          </button>
        </div>
      </div>
    </div>
  );
};
