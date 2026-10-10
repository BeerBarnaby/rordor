"use client";

import { ArrowRight, Check, ChevronRight, Trophy } from "lucide-react";
import Image from 'next/image';
import { LeaderboardEntry, PlayerProfile, UserProgress } from "@/types";
import { getGameProgress, getLevelProgress } from "@/lib/gameProgress";

const steps = [
  { title: "ลำดับการช่วยเหลือ", detail: "ฝึกช่วยเหลือตามลำดับ" },
  { title: "แจ้งเหตุ 1669", detail: "ฝึกแจ้งเหตุ 1669" },
  { title: "ฝึกจังหวะ CPR", detail: "ฝึกจังหวะกดหน้าอก 100–120 ครั้ง/นาที" },
];

export function TrainingSteps({ current = -1 }: { current?: number }) {
  const safeCurrent = Math.min(Math.max(current, 0), steps.length - 1);

  return (
    <div className="simulation-progress" aria-label="ความคืบหน้าการฝึก">
      <div className="progress-heading">
        <strong>{steps[safeCurrent].title}</strong>
        <span className="progress-count">
          {String(safeCurrent + 1).padStart(2, "0")} / 03
        </span>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li
            key={step.title}
            aria-current={index === safeCurrent ? "step" : undefined}
            data-complete={index < safeCurrent}
          >
            <span className="progress-marker" aria-hidden="true">
              {index < safeCurrent ? <Check /> : index + 1}
            </span>
            <span className="progress-label">{step.title}</span>
            <span className="sr-only">{index < safeCurrent ? " เสร็จแล้ว" : ""}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface Props {
  progress: UserProgress;
  onLearn: () => void;
  onStart: () => void;
  currentStep?: number;
  leaderboard: LeaderboardEntry[];
  player: PlayerProfile | null;
  onOpenPlayer: () => void;
  leaderboardLoading: boolean;
  leaderboardError: string;
  onReloadLeaderboard: () => void;
  syncMessage: string;
  pendingCount: number;
  onRetrySync: () => void;
}

export function HomeDashboard({
  progress,
  onLearn,
  onStart,
  currentStep,
  leaderboard,
  player,
  onOpenPlayer,
  leaderboardLoading, leaderboardError, onReloadLeaderboard,
  syncMessage, pendingCount, onRetrySync,
}: Props) {
  const continuing = currentStep !== undefined;
  const currentLabel = continuing
    ? steps[Math.min(currentStep, steps.length - 1)].title
    : null;
  const localGame = getGameProgress(progress);
  const game = player?.xp == null ? localGame : getLevelProgress(player.xp, localGame.completedTopicCount);

  return (
    <div className="home-screen">
      <div className="home-top-grid">
        <section className="home-hero">
          <h1 className="display-title">
            <span className="hero-title-line">เจอคนหมดสติ</span>
            <span className="hero-title-line">ต้องทำอย่างไร?</span>
          </h1>
          <p className="lead">
            ฝึกประเมินเหตุ แจ้ง 1669 และฝึกจังหวะ CPR
          </p>
          <p className="mission-meta">3 ขั้น · ประมาณ 5 นาที</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onStart}>
              {continuing
                ? `ทำต่อ: ${currentLabel}`
                : progress.missionAttemptsCount
                  ? "เริ่มฝึกอีกครั้ง"
                  : "เริ่มฝึก"}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button className="secondary-button" onClick={onLearn}>
              บทเรียน
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          {!player && !progress.missionAttemptsCount && <p className="caption mt-2">ฝึกได้โดยไม่ต้องเข้าสู่ระบบ</p>}
          {continuing && (
            <p className="caption mt-3">
              บันทึกไว้ที่ขั้น {currentStep + 1} จาก 3
            </p>
          )}
          <div className="home-companion">
            <Image src="/images/training/prom-companion-home-v1.png" width={1024} height={1536} sizes="(min-width: 640px) 160px, 110px" alt="น้องพร้อม ตัวละครนักศึกษาวิชาทหาร ยิ้มต้อนรับพร้อมสมุดฝึก" />
          </div>
        </section>

        <section className="training-plan" aria-labelledby="training-plan-title">
          <h2 id="training-plan-title" className="section-title">
            บทเรียน
          </h2>
          <ol className="training-rail">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="rail-number">0{index + 1}</span>
                <button className="text-button" onClick={onLearn} aria-label={`ดูบทเรียน: ${step.title}`}>
                  <strong>{step.title}</strong>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
          <button className="text-button" onClick={onLearn}>การใช้ AED · บทเสริม <ChevronRight size={18} aria-hidden="true" /></button>
        </section>
      </div>

      <section className="home-result" aria-labelledby="latest-result-title">
        {progress.lastMissionResult ? (
          <>
            <div>
              <p className="protocol-code">ผลล่าสุด</p>
              <h2 id="latest-result-title" className="section-title">
                {progress.lastMissionResult.scenarioTitle}
              </h2>
              <p className="caption">{progress.lastMissionResult.completedAt}</p>
              <p className="home-result-score mt-4">
                <span className="score-number">
                  {progress.lastMissionResult.overallScore}
                </span>
                <span className="caption">/ 100 คะแนน</span>
              </p>
              <p className="caption">{progress.lastMissionResult.scoringVersion ? 'เฉลี่ย 3 แบบฝึก · บันทึกในเครื่อง' : 'ผลจากสูตรเดิม'}</p>
            </div>
            <dl className="metric-list">
              <div>
                <dt>จังหวะกดในช่วงเป้าหมาย</dt>
                <dd>{progress.lastMissionResult.cprRhythmScore}%</dd>
              </div>
              <div>
                <dt>คะแนนดีที่สุด ({progress.lastMissionResult.scoringVersion ? 'สูตรใหม่' : 'สูตรเดิม'})</dt>
                <dd>{progress.lastMissionResult.scoringVersion ? progress.measuredBestOverallScore ?? progress.lastMissionResult.overallScore : progress.bestOverallScore}</dd>
              </div>
              <div>
                <dt>ฝึกแล้ว</dt>
                <dd>{progress.missionAttemptsCount} ครั้ง</dd>
              </div>
            </dl>
          </>
        ) : (
          <div>
            <p className="protocol-code">ผลการฝึก</p>
            <h2 id="latest-result-title" className="section-title">
              ยังไม่มีผลการฝึก
            </h2>
            <p className="caption">
              ใช้เวลาประมาณ 5 นาที แล้วระบบจะสรุปสิ่งที่ทำได้ดีและจุดที่ควรทบทวน
            </p>
          </div>
        )}
      </section>

      <section className="game-hub" aria-labelledby="game-hub-title">
        <div className="game-progress-card">
          <div className="game-heading">
            <div>
              <p className="protocol-code">ความคืบหน้า</p>
              <h2 id="game-hub-title" className="section-title !mb-1">
                Level {game.level}
              </h2>
            </div>
          </div>
          <div
            className="xp-track"
            role="progressbar"
            aria-label="ความคืบหน้าไปยังเลเวลถัดไป"
            aria-valuemin={0}
            aria-valuemax={game.xpForNextLevel}
            aria-valuenow={game.xpInLevel}
          >
            <span style={{ width: `${(game.xpInLevel / game.xpForNextLevel) * 100}%` }} />
          </div>
          <p className="content-meta mt-2">
            {game.level === 10
              ? "ถึงเลเวลสูงสุดแล้ว"
              : `${game.xpInLevel} / ${game.xpForNextLevel} XP ไปยัง Level ${game.level + 1}`}
          </p>
          <p className="content-meta mt-1">ฝึกจบรับ 250 XP พร้อมโบนัสจากคะแนนดีที่สุด</p>
          <details className="reference-details"><summary>ระบบ XP</summary><p className="content-meta">รับ 250 XP เมื่อจบภารกิจหลัก โบนัสคิดจากคะแนนดีที่สุด ไม่ได้ให้ซ้ำทุกครั้ง {player ? 'บันทึก XP ออนไลน์ในโปรไฟล์นี้' : 'บันทึก XP ในเครื่องนี้'} ระดับและ XP ไม่ใช่การรับรองทักษะภาคปฏิบัติ</p></details>
          {syncMessage && <p className="caption mt-2" role="status">{syncMessage}</p>}
          {pendingCount > 0 && <button className="text-button" onClick={onRetrySync}>ลองส่งคะแนนที่รออีกครั้ง ({pendingCount})</button>}
          <p className="caption mt-2">เรียนแล้ว {localGame.completedTopicCount} จาก 4 บท</p>
        </div>

        <div className="leaderboard-card">
          <div className="game-heading">
            <div>
              <h2 className="section-title !mb-1">อันดับผู้ฝึก</h2>
            </div>
            <Trophy className="leaderboard-trophy" aria-hidden="true" />
          </div>
          <p className="caption mt-2">เรียงตามคะแนนการฝึกสูงสุด</p>
          {leaderboardLoading ? <p className="caption" role="status">กำลังโหลดอันดับ…</p> : leaderboardError ? <div><p className="caption" role="status">{leaderboardError}</p><button className="text-button" onClick={onReloadLeaderboard}>โหลดอันดับอีกครั้ง</button></div> : leaderboard.length > 0 ? (
            <ol className="leaderboard-list">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <li key={`${entry.rank}-${entry.displayName}-${index}`}>
                  <span className="leaderboard-rank">#{entry.rank}</span>
                  <span>
                    <strong>{entry.displayName}</strong>
                    <small>Level {entry.level} · ฝึก {entry.attemptsCount} ครั้ง</small>
                  </span>
                  <b>{entry.bestScore}</b>
                </li>
              ))}
            </ol>
          ) : (
            <p className="caption leaderboard-empty">
              ยังไม่มีผู้ส่งคะแนนในหมวดนี้
            </p>
          )}
          <button className="text-button" onClick={onOpenPlayer}>
            {player ? `โปรไฟล์ของ ${player.displayName}` : "โปรไฟล์ผู้เล่น (ไม่บังคับ)"}
            <ChevronRight size={18} />
          </button>
          <details className="reference-details"><summary>วิธีคิดคะแนนและจัดอันดับ</summary><p className="content-meta mt-2">คะแนนคือค่าเฉลี่ยจากลำดับช่วยเหลือ การแจ้งเหตุ และจังหวะ CPR ใช้คะแนนที่ดีที่สุดในการจัดอันดับ หากเท่ากัน ดูคะแนนจังหวะ แล้วดูจำนวนครั้งที่ฝึก</p><p className="content-meta mt-2">ไม่รวมคะแนนสูตรเดิม และไม่ใช่ผลประเมินภาคปฏิบัติ</p></details>
        </div>
      </section>

    </div>
  );
}
