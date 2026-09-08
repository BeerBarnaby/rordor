'use client';

import React from 'react';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

interface MascotHeaderProps {
  message?: string;
  subtitle?: string;
  badgeText?: string;
  unitText?: string;
}

export const MascotHeader: React.FC<MascotHeaderProps> = ({
  message = 'วันนี้เราจะฝึกอะไรดี?',
  subtitle = 'เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา',
  badgeText = 'นศท. มทบ.37 ศูนย์วันอังคาร',
  unitText = 'รร.วิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย',
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-5 text-white shadow-xl border border-emerald-700/40">
      {/* Decorative background grid elements */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-4 top-4 text-emerald-500/10">
        <HeartPulse className="w-24 h-24" />
      </div>

      <div className="relative z-10 flex items-start gap-4">
        {/* Mascot Avatar Container */}
        <div className="relative shrink-0">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/50">
            <div className="w-full h-full bg-emerald-950 rounded-[14px] flex flex-col items-center justify-center overflow-hidden border border-emerald-400/30">
              {/* Custom Vector Mascot Graphic for Nong Prom */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                {/* ROTC Beret / Green Helmet Accent */}
                <div className="absolute top-0 w-8 h-3.5 bg-emerald-500 rounded-t-full shadow-inner" />
                <div className="absolute top-2 w-9 h-1.5 bg-emerald-600 rounded-full" />
                {/* Face & Medical Star */}
                <div className="mt-2 text-teal-200 font-extrabold text-sm tracking-tighter flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-300 drop-shadow" />
                </div>
              </div>
            </div>
          </div>
          {/* Status Dot */}
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-emerald-950 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>

        {/* Text & Speech Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-300" />
              น้องพร้อม (NONG PROM)
            </span>
            <span className="text-[10px] text-emerald-300/70 font-mono">{badgeText}</span>
          </div>

          <h2 className="text-lg font-bold text-white leading-tight drop-shadow-sm">
            {message}
          </h2>

          <p className="text-xs text-emerald-200/90 mt-1 font-medium leading-relaxed">
            {subtitle}
          </p>

          {unitText && (
            <div className="mt-2 pt-2 border-t border-emerald-800/60 text-[10px] text-emerald-300/80 font-medium flex items-center gap-1">
              <span>{unitText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
