"use client";

import { ArrowRight, Check, ChevronRight, Trophy } from "lucide-react";
import Image from 'next/image';
import { LeaderboardEntry, PlayerProfile, UserProgress } from "@/types";
import { getGameProgress, getLevelProgress, TOPIC_ORDER } from "@/lib/gameProgress";

const steps = [
  { title: "ลำดับช่วยเหลือ", detail: "ประเมินเหตุและลงมือให้ถูกลำดับ" },
  { title: "แจ้งเหตุ 1669", detail: "บอกข้อมูลสำคัญให้ครบ" },
  { title: "จังหวะ CPR", detail: "รักษาจังหวะ 100–120 ครั้ง/นาที" },
];
const lessonSteps = [...steps, { title: 'AED · บทเสริม', detail: 'สำหรับผู้สนใจ' }];

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
  leaderboardGuided: boolean;
  onLeaderboardMode: (guided: boolean) => void;
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
  leaderboardGuided, onLeaderboardMode, leaderboardLoading, leaderboardError, onReloadLeaderboard,
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
          <p className="protocol-code">สถานการณ์ฝึก · ช่วยเพื่อนหมดสติ</p>
          <h1 className="display-title">
            <span className="hero-title-line">เจอคนหมดสติ</span>
            <span className="hero-title-line">เราจะทำอะไรก่อน?</span>
          </h1>
          <p className="lead">
            ฝึกประเมินเหตุ แจ้ง 1669 และรักษาจังหวะ CPR
          </p>
          <p className="mission-meta">3 ขั้น · ประมาณ 5 นาที · ไม่ต้องเข้าสู่ระบบ</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onStart}>
              {continuing
                ? `ทำต่อ: ${currentLabel}`
                : progress.missionAttemptsCount
                  ? "ลองสถานการณ์ใหม่"
                  : "เริ่มฝึกกับน้องพร้อม"}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button className="secondary-button" onClick={onLearn}>
              เรียนรู้พื้นฐาน
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          {continuing && (
            <p className="caption mt-3">
              บันทึกไว้ที่ขั้น {currentStep + 1} จาก 3
            </p>
          )}
          <div className="home-companion">
            <div><strong>ฝึกไปกับน้องพร้อม</strong><p>ค่อย ๆ คิด ตัดสินใจ แล้วลองลงมือ<br />มีคำแนะนำหลังฝึก</p></div>
            <Image src="/images/training/prom-companion-home-v1.png" width={1024} height={1536} sizes="(min-width: 640px) 160px, 110px" alt="น้องพร้อม ตัวละครนักศึกษาวิชาทหาร ยิ้มต้อนรับพร้อมสมุดฝึก" />
          </div>
        </section>

        <section className="training-plan" aria-labelledby="training-plan-title">
          <h2 id="training-plan-title" className="section-title">
            เส้นทางการฝึก
          </h2>
          <ol className="training-rail">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="rail-number">0{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="game-hub" aria-labelledby="game-hub-title">
        <div className="game-progress-card">
          <div className="game-heading">
            <div>
              <p className="protocol-code">เส้นทางผู้ช่วยชีวิต</p>
              <h2 id="game-hub-title" className="section-title !mb-1">
                Level {game.level}
              </h2>
              <p className="caption">
                3 บทเรียนหลัก + AED บทเสริม · ทุกบทเปิดให้เรียน
              </p>
            </div>
            <span className="level-badge">LV.{game.level}</span>
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
          <p className="content-meta mt-1">ภารกิจละ 250 XP + โบนัสคะแนนดีที่สุด · {player ? 'XP ที่บันทึกออนไลน์ของโปรไฟล์นี้' : 'XP ในเครื่อง'} · ไม่ใช่ระดับทักษะภาคปฏิบัติ</p>
          {syncMessage && <p className="caption mt-2" role="status">{syncMessage}</p>}
          {pendingCount > 0 && <button className="text-button" onClick={onRetrySync}>ลองส่งคะแนนที่รออีกครั้ง ({pendingCount})</button>}
          <ol className="lesson-progress" aria-label="ความคืบหน้าบทเรียน">
            {TOPIC_ORDER.map((topicId, index) => {
              const completed = progress.completedTopicIds.includes(topicId);
              return (
                <li key={topicId} data-complete={completed}>
                  <span>{completed ? <Check /> : index + 1}</span>
                  <small>{lessonSteps[index].title}</small>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="leaderboard-card">
          <div className="game-heading">
            <div>
              <p className="protocol-code">อันดับผู้ฝึก</p>
              <h2 className="section-title !mb-1">Leaderboard</h2>
            </div>
            <Trophy className="leaderboard-trophy" aria-hidden="true" />
          </div>
          <div className="leaderboard-modes" role="group" aria-label="แยกอันดับตามตัวช่วยเสียง"><button className="secondary-button" aria-pressed={!leaderboardGuided} onClick={() => onLeaderboardMode(false)}>ฝึกเอง</button><button className="secondary-button" aria-pressed={leaderboardGuided} onClick={() => onLeaderboardMode(true)}>ใช้เสียงนำ</button></div>
          <p className="caption mt-2">คะแนนสูตรใหม่ · เฉลี่ยลำดับ / 1669 / จังหวะ</p>
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
              ยังไม่มีคะแนนสูตรใหม่ในหมวดนี้
            </p>
          )}
          <button className="text-button" onClick={onOpenPlayer}>
            {player ? `โปรไฟล์ของ ${player.displayName}` : "โปรไฟล์ผู้เล่น (ไม่บังคับ)"}
            <ChevronRight size={18} />
          </button>
          <p className="content-meta mt-2">
            แยกจากคะแนนสูตรเดิมและแยกผลที่ใช้เสียงนำ เรียงจากคะแนนดีที่สุด ตามด้วยจังหวะ และจำนวนครั้งที่ฝึก ไม่ใช่ผลประเมินภาคปฏิบัติ
          </p>
        </div>
      </section>

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
    </div>
  );
}
