"use client";
import { ReactNode } from "react";
import { House, BookOpen, ShieldCheck, Info, X, UserRound } from "lucide-react";

type Tab = "home" | "learn" | "mission" | "about";
interface Props {
  children: ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenAbout: () => void;
  onOpenPlayer: () => void;
  playerName?: string;
  focusMode?: boolean;
  onExitTraining?: () => void;
  trainingTone?: "standard" | "aed";
}
export function AppHeader({
  onOpenAbout,
  onOpenPlayer,
  playerName,
  focusMode = false,
  onExitTraining,
  trainingTone = "standard",
}: {
  onOpenAbout: () => void;
  onOpenPlayer: () => void;
  playerName?: string;
  focusMode?: boolean;
  onExitTraining?: () => void;
  trainingTone?: "standard" | "aed";
}) {
  return (
    <header
      className="app-header"
      data-mode={focusMode ? trainingTone : "default"}
    >
      <div className="brand">
        <span className="brand-stamp" aria-hidden="true">
          37
        </span>
        <span className="brand-copy">
          <strong>{focusMode ? "โหมดฝึก" : "น้องพร้อม"}</strong>
          <small>{focusMode ? "NONG PROM" : "ROTC TRAINING COMPANION"}</small>
        </span>
      </div>
      {focusMode ? (
        <button className="header-exit" onClick={onExitTraining}>
          ออกจากการฝึก
          <X size={19} aria-hidden="true" />
        </button>
      ) : (
        <div className="header-actions">
          <button
            className="icon-button player-button"
            data-connected={Boolean(playerName)}
            aria-label={playerName ? `โปรไฟล์ผู้เล่น ${playerName}` : "สร้างหรือเข้าสู่โปรไฟล์ผู้เล่น"}
            onClick={onOpenPlayer}
          >
            <UserRound size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="เกี่ยวกับน้องพร้อม"
            onClick={onOpenAbout}
          >
            <Info size={20} />
          </button>
        </div>
      )}
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
          { id: "learn", label: "บทเรียน", icon: BookOpen },
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
  onOpenPlayer,
  playerName,
  focusMode = false,
  onExitTraining,
  trainingTone = "standard",
}: Props) {
  return (
    <div className="app-shell" data-training-tone={focusMode ? trainingTone : undefined}>
      <a className="skip-link" href="#main-content">
        ข้ามไปเนื้อหา
      </a>
      <AppHeader
        onOpenAbout={onOpenAbout}
        onOpenPlayer={onOpenPlayer}
        playerName={playerName}
        focusMode={focusMode}
        onExitTraining={onExitTraining}
        trainingTone={trainingTone}
      />
      {!focusMode && (
        <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
      )}
      <main id="main-content" className="app-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
