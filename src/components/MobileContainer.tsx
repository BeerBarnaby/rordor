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
    <div className="min-h-screen bg-[#F7FAF8] text-[#17221E] flex flex-col items-center justify-start antialiased font-sans">
      {/* Smartphone Viewport Centered Frame for Desktop, Fullscreen on Mobile */}
      <div className="w-full max-w-md min-h-screen bg-[#F7FAF8] flex flex-col relative border-x border-[#D8E4DE] shadow-sm overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D8E4DE] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F5C4D] flex items-center justify-center shadow-sm">
              <HeartPulse className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-[#17221E] leading-tight">
                น้องพร้อม
                <span className="text-xs text-[#5C6B65] font-medium ml-1">NONG PROM</span>
              </h1>
              <div className="text-[10px] text-[#0F5C4D] font-semibold tracking-wide">
                ROTC37 Training Companion
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAbout}
            className="p-2 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] text-[#5C6B65] hover:text-[#0F5C4D] hover:border-[#0F5C4D]/30 transition-colors flex items-center gap-1.5 text-xs font-medium"
            aria-label="เกี่ยวกับน้องพร้อม"
          >
            <Info className="w-4 h-4" />
            <span>เกี่ยวกับ</span>
          </button>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 px-4 py-5 space-y-4">
          {children}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-[#D8E4DE] px-3 py-2 z-40 flex items-center justify-around">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-[#0F5C4D] font-bold bg-[#DFF4EC]'
                : 'text-[#5C6B65] hover:text-[#17221E]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px]">หน้าแรก</span>
          </button>

          <button
            onClick={() => onTabChange('learn')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all ${
              activeTab === 'learn'
                ? 'text-[#0F5C4D] font-bold bg-[#DFF4EC]'
                : 'text-[#5C6B65] hover:text-[#17221E]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[11px]">เรียนรู้</span>
          </button>

          <button
            onClick={() => onTabChange('mission')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl transition-all ${
              activeTab === 'mission'
                ? 'text-[#0F5C4D] font-bold bg-[#DFF4EC]'
                : 'text-[#5C6B65] hover:text-[#17221E]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[11px]">ภารกิจ</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
