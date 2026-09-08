'use client';

import React from 'react';
import { Home, BookOpen, ShieldCheck, Info, HeartPulse } from 'lucide-react';

interface MobileContainerProps {
  children: React.ReactNode;
  activeTab: 'home' | 'learn' | 'mission' | 'about';
  onTabChange: (tab: 'home' | 'learn' | 'mission' | 'about') => void;
  onOpenAbout: () => void;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  activeTab,
  onTabChange,
  onOpenAbout,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased font-sans selection:bg-emerald-500 selection:text-white">
      {/* Smartphone Viewport Centered Frame for Desktop, Fullscreen on Mobile */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col relative border-x border-slate-800/80 shadow-2xl overflow-x-hidden">
        {/* Top Status & App Title Bar */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-950">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                น้องพร้อม
                <span className="text-[10px] text-emerald-400 font-mono font-normal">NONG PROM</span>
              </h1>
            </div>
          </div>

          <button
            onClick={onOpenAbout}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors flex items-center gap-1 text-[11px] font-medium"
            aria-label="เกี่ยวกับน้องพร้อม"
          >
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>เกี่ยวกับ</span>
          </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 p-4 space-y-4">
          {children}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-3 py-2 z-40 flex items-center justify-around">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-emerald-400 font-bold bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">หน้าแรก</span>
          </button>

          <button
            onClick={() => onTabChange('learn')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'learn'
                ? 'text-emerald-400 font-bold bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">เรียนรู้</span>
          </button>

          <button
            onClick={() => onTabChange('mission')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'mission'
                ? 'text-emerald-400 font-bold bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px]">เริ่มภารกิจ</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
