"use client";

import { FormEvent, useState } from "react";
import { LogOut, ShieldCheck, Trophy } from "lucide-react";
import { AppDialog } from "./AppDialog";
import type { PlayerProfile } from "@/types";
import {
  loginPlayer,
  logoutPlayer,
  registerPlayer,
} from "@/lib/player";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "register" | "login";

export function PlayerModal({
  open,
  onClose,
  player,
  onPlayerChange,
}: {
  open: boolean;
  onClose: () => void;
  player: PlayerProfile | null;
  onPlayerChange: (player: PlayerProfile | null) => void;
}) {
  const [mode, setMode] = useState<Mode>("register");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const configured = isSupabaseConfigured();

  function handleClose() {
    setPin("");
    setStatus("");
    setSubmitting(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      const session =
        mode === "register"
          ? await registerPlayer(phone, displayName, pin)
          : await loginPlayer(phone, pin);
      onPlayerChange(session.profile);
      setStatus(`พร้อมแล้ว ${session.profile.displayName} คะแนนครั้งต่อไปจะขึ้นลีดเดอร์บอร์ด`);
      setPin("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setSubmitting(true);
    await logoutPlayer();
    onPlayerChange(null);
    setStatus("ออกจากโปรไฟล์บนเครื่องนี้แล้ว ยังเล่นแบบ Guest ได้ตามปกติ");
    setSubmitting(false);
  }

  return (
    <AppDialog open={open} onClose={handleClose} title="โปรไฟล์ผู้เล่น">
      <div className="dialog-body page-stack player-dialog">
        {player ? (
          <>
            <section className="player-summary">
              <span className="player-level-mark" aria-hidden="true">
                <Trophy />
              </span>
              <div>
                <p className="protocol-code">พร้อมขึ้นอันดับ</p>
                <h3 className="section-title !mb-1">{player.displayName}</h3>
                <p className="caption">
                  {player.rank ? `อันดับปัจจุบัน #${player.rank}` : "ทำภารกิจแรกเพื่อขึ้นลีดเดอร์บอร์ด"}
                </p>
              </div>
            </section>
            <dl className="player-stats">
              <div><dt>คะแนนดีที่สุด</dt><dd>{player.bestScore}</dd></div>
              <div><dt>จังหวะ CPR</dt><dd>{player.bestRhythmScore}%</dd></div>
              <div><dt>ภารกิจ</dt><dd>{player.attemptsCount}</dd></div>
            </dl>
            <p className="notice">
              <strong>การเข้าสู่ระบบเป็นทางเลือก</strong>
              ออกจากโปรไฟล์แล้วก็ยังเรียนและฝึกแบบ Guest ได้ คะแนนในเครื่องจะไม่หาย
            </p>
            <button
              className="secondary-button"
              disabled={submitting}
              onClick={handleLogout}
            >
              <LogOut size={18} /> ออกจากโปรไฟล์บนเครื่องนี้
            </button>
          </>
        ) : (
          <>
            <section>
              <p className="protocol-code">เล่นก่อน สมัครทีหลังได้</p>
              <h3 className="page-title">เก็บคะแนนข้ามเครื่อง</h3>
              <p className="caption mt-2">
                ใช้ชื่อเล่น เบอร์โทร และ PIN ที่ตั้งเอง ไม่มีอีเมลและไม่มี SMS
              </p>
            </section>
            <div className="auth-mode" role="tablist" aria-label="เลือกรูปแบบโปรไฟล์">
              <button
                role="tab"
                aria-selected={mode === "register"}
                onClick={() => { setMode("register"); setStatus(""); }}
              >
                สร้างโปรไฟล์
              </button>
              <button
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => { setMode("login"); setStatus(""); }}
              >
                มีโปรไฟล์แล้ว
              </button>
            </div>
            {configured ? (
              <form className="player-form" onSubmit={handleSubmit}>
                {mode === "register" && (
                  <label>
                    <span>ชื่อที่แสดงบนลีดเดอร์บอร์ด</span>
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      minLength={2}
                      maxLength={24}
                      autoComplete="nickname"
                      placeholder="เช่น พร้อมช่วย"
                      required
                    />
                  </label>
                )}
                <label>
                  <span>เบอร์โทร</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="08x xxx xxxx"
                    required
                  />
                </label>
                <label>
                  <span>PIN ที่ตั้งเอง 4–8 หลัก</span>
                  <input
                    type="password"
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
                    inputMode="numeric"
                    autoComplete="off"
                    pattern="[0-9]{4,8}"
                    placeholder="••••"
                    required
                  />
                </label>
                <p className="content-meta">
                  PIN ถูกแฮชก่อนเก็บและเบอร์โทรจะไม่แสดงต่อผู้อื่น ระบบนี้ไม่ยืนยันเจ้าของเบอร์และไม่สามารถกู้ PIN ได้
                </p>
                <button className="primary-button" disabled={submitting}>
                  <ShieldCheck size={18} />
                  {submitting
                    ? "กำลังเชื่อมต่อ..."
                    : mode === "register"
                      ? "สร้างโปรไฟล์และเก็บคะแนน"
                      : "เข้าสู่โปรไฟล์"}
                </button>
              </form>
            ) : (
              <p className="notice">
                <strong>ยังเล่นแบบ Guest ได้ตามปกติ</strong>
                ระบบคะแนนออนไลน์กำลังเตรียมใช้งาน
              </p>
            )}
          </>
        )}
        {status && <p className="feedback-panel" role="status">{status}</p>}
        <button className="text-button" onClick={handleClose}>ไว้ทีหลัง กลับไปเล่น</button>
      </div>
    </AppDialog>
  );
}
