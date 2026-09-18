"use client";
import { ReactNode } from "react";
import { House, BookOpen, ShieldCheck, Info } from "lucide-react";

type Tab = "home" | "learn" | "mission" | "about";
interface Props {
  children: ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenAbout: () => void;
}
export function AppHeader({ onOpenAbout }: { onOpenAbout: () => void }) {
  return (
    <header className="app-header">
      <div className="brand">
        <small>ROTC37</small>
        <strong>น้องพร้อม</strong>
        <span>NONG PROM</span>
      </div>
      <button
        className="icon-button"
        aria-label="เกี่ยวกับน้องพร้อม"
        onClick={onOpenAbout}
      >
        <Info size={20} />
      </button>
    </header>
  );
}
export function BottomNavigation({
  activeTab,
  onTabChange,
}: Pick<Props, "activeTab" | "onTabChange">) {
  return (
    <nav className="bottom-nav" aria-label="เมนูหลัก">
      {(
        [
          { id: "home", label: "หน้าแรก", icon: House },
          { id: "learn", label: "คู่มือ", icon: BookOpen },
          { id: "mission", label: "ฝึกสถานการณ์", icon: ShieldCheck },
        ] as const
      ).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className="nav-item"
          aria-current={activeTab === id ? "page" : undefined}
          onClick={() => onTabChange(id)}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
export function MobileContainer({
  children,
  activeTab,
  onTabChange,
  onOpenAbout,
}: Props) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        ข้ามไปเนื้อหา
      </a>
      <AppHeader onOpenAbout={onOpenAbout} />
      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <main id="main-content" className="app-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
