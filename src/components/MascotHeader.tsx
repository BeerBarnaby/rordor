'use client';

import React from 'react';
import { HeartPulse } from 'lucide-react';

interface MascotHeaderProps {
  message?: string;
  subtitle?: string;
}

export const MascotHeader: React.FC<MascotHeaderProps> = ({
  message = 'เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา',
  subtitle = 'เครื่องมือฝึกทบทวนสถานการณ์ฉุกเฉินสำหรับนักศึกษาวิชาทหาร',
}) => {
  return (
    <div className="rounded-2xl bg-[#DFF4EC] border border-[#D8E4DE] p-5 space-y-3">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#0F5C4D] flex items-center justify-center shadow-sm shrink-0">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-[#17221E] leading-tight">
            น้องพร้อม
          </h2>
          <span className="text-xs font-medium text-[#0F5C4D]">NONG PROM</span>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-sm font-semibold text-[#0F5C4D] leading-relaxed">
        &ldquo;{message}&rdquo;
      </p>

      {/* Supporting text */}
      <p className="text-xs text-[#5C6B65] leading-relaxed">
        {subtitle}
      </p>

      {/* ROTC37 Badge */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] font-bold text-[#0F5C4D] bg-white px-2.5 py-1 rounded-lg border border-[#D8E4DE]">
          ROTC37
        </span>
        <span className="text-[11px] text-[#5C6B65]">
          หน่วยฝึก นศท. มทบ.37
        </span>
      </div>
    </div>
  );
};
