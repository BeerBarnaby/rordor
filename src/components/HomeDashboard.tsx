"use client";

import { ArrowRight, Check, ChevronRight, Trophy } from "lucide-react";
import { LeaderboardEntry, PlayerProfile, UserProgress } from "@/types";
import { getGameProgress } from "@/lib/gameProgress";

const steps = [
  { title: "ลำดับช่วยเหลือ", detail: "ประเมินเหตุและลงมือให้ถูกลำดับ" },
  { title: "แจ้งเหตุ 1669", detail: "บอกข้อมูลสำคัญให้ครบ" },
  { title: "จังหวะ CPR", detail: "รักษาจังหวะ 100–120 ครั้ง/นาที" },
  { title: "ใช้ AED", detail: "ฟังคำสั่ง เคลียร์พื้นที่ แล้วทำต่อ" },
];

export function TrainingSteps({ current = -1 }: { current?: number }) {
  const safeCurrent = Math.min(Math.max(current, 0), steps.length - 1);

  return (
    <div className="simulation-progress" aria-label="ความคืบหน้าการฝึก">
      <div className="progress-heading">
        <strong>{steps[safeCurrent].title}</strong>
        <span className="progress-count">
          {String(safeCurrent + 1).padStart(2, "0")} / 04
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
  onOpenLesson?: (id: string) => void;
  onStart: () => void;
  hasSavedMission?: boolean;
  onNewMission?: () => void;
  currentStep?: number;
  leaderboard: LeaderboardEntry[];
  leaderboardStatus?: 'loading' | 'ready' | 'error';
  onRetryLeaderboard?: () => void;
  player: PlayerProfile | null;
  onOpenPlayer: () => void;
}

export function HomeDashboard({
  progress,
  onLearn,
  onOpenLesson,
  onStart,
  hasSavedMission = false,
  onNewMission,
  currentStep,
  leaderboard,
  leaderboardStatus = 'ready',
  onRetryLeaderboard,
  player,
  onOpenPlayer,
}: Props) {
  const continuing = currentStep !== undefined;
  const currentLabel = continuing
    ? steps[Math.min(currentStep, steps.length - 1)].title
    : null;
  const game = getGameProgress(progress);

  return (
    <div className="home-screen">
      <div className="home-top-grid">
        <section className="home-hero">
          <p className="field-label">สถานการณ์ฝึก {continuing || hasSavedMission ? '· รอบที่ค้างไว้' : '· เริ่มได้ทันที'}</p>
          <h1 className="display-title home-title">
            เจอคนหมดสติ
            <span className="home-question">เราจะทำอะไรก่อน?</span>
          </h1>
          <p className="mission-meta">First Aid & CPR · 4 ขั้น · ประมาณ 5 นาที</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onStart}>
              {hasSavedMission ? 'กลับมาฝึกต่อ' : continuing
                ? `ทำต่อ: ${currentLabel}`
                : progress.missionAttemptsCount
                  ? "ลองสถานการณ์ใหม่"
                  : "เริ่มฝึกสถานการณ์"}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button className="text-button" onClick={onLearn}>
              เปิดบทเรียน
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="caption mt-3">ไม่ต้องเข้าสู่ระบบ · เป็นการฝึกจำลอง ไม่ใช่สายฉุกเฉินจริง</p>
          {hasSavedMission && <details className="checkpoint-note"><summary>บันทึกไว้ที่ขั้น {(currentStep ?? 0) + 1}/4 · ดูรายละเอียด</summary><p className="caption">กลับมาเริ่มต้นกิจกรรมที่ค้าง ไม่เก็บคำตอบย่อยหรือจังหวะแตะค้างไว้</p><button className="text-button" onClick={onNewMission}>เริ่มภารกิจใหม่แทน</button></details>}
          {continuing && !hasSavedMission && (
            <p className="caption mt-3">
                ค้างอยู่ที่ขั้น {currentStep + 1} จาก 4 · หลังรีเฟรชกลับมาเริ่มต้นกิจกรรมที่ค้างได้
            </p>
          )}
        </section>

        <section className="training-plan" aria-labelledby="training-plan-title">
          <h2 id="training-plan-title" className="section-title">กิจกรรมในรอบนี้</h2>
          <ol className="field-route">
            {steps.map((step, index) => {
              const state = currentStep === undefined ? 'pending' : index < currentStep ? 'complete' : index === currentStep ? 'current' : 'pending';
              return <li key={step.title} data-state={state}>
                <span className="field-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <button className="field-lesson-link" onClick={() => onOpenLesson ? onOpenLesson(['assessment','call1669','cpr','aed'][index]) : onLearn()}><span>{step.title}</span><small>เปิดบทเรียน <ChevronRight size={14} aria-hidden="true" /></small></button>
                <span className="field-step-state">{state === 'complete' ? 'ทำจบแล้ว' : state === 'current' ? 'ฝึกค้างไว้' : 'ยังไม่เริ่ม'}</span>
              </li>;
            })}
          </ol>
          <p className="caption mt-3">สถานะบอกกิจกรรมที่จบ ไม่ใช่การรับรองทักษะ · เปิดบทเรียนได้ทุกลำดับ</p>
        </section>
      </div>

      <section className="game-hub" aria-labelledby="game-hub-title">
        <div className="game-progress-card">
          <div className="game-heading">
            <div>
              <p className="field-label">บันทึกการฝึกในอุปกรณ์นี้</p>
              <h2 id="game-hub-title" className="section-title !mb-1">
                Level {game.level}
              </h2>
              <p className="caption">
                บันทึกว่าอ่านแล้ว {game.completedTopicCount} จาก 4 บท · ทุกบทเปิดให้เรียน
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
          <p className="content-meta mt-1">ภารกิจละ 250 XP · โบนัสคะแนนเดิมคงไว้ ไม่ใช่ระดับทักษะภาคปฏิบัติ</p>
        </div>

        <div className="leaderboard-card">
          <div className="game-heading">
            <div>
              <p className="protocol-code">อันดับผู้ฝึก</p>
              <h2 className="section-title !mb-1">Leaderboard</h2>
            </div>
            <Trophy className="leaderboard-trophy" aria-hidden="true" />
          </div>
          {leaderboardStatus === 'loading' ? <p className="caption" role="status">กำลังโหลดอันดับ… คุณเรียนและฝึกต่อได้</p> : leaderboardStatus === 'error' ? (
            <div><p className="caption" role="status">โหลดอันดับไม่สำเร็จ ผลฝึกในเครื่องยังอยู่ คุณเรียนและฝึกต่อได้</p><button className="secondary-button mt-3" onClick={onRetryLeaderboard}>ลองโหลดอันดับอีกครั้ง</button></div>
          ) : leaderboard.length > 0 ? (
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
              ยังไม่มีคะแนนสูตรเดิมบนลีดเดอร์บอร์ด
            </p>
          )}
          <button className="text-button" onClick={onOpenPlayer}>
            {player ? `โปรไฟล์ของ ${player.displayName}` : "โปรไฟล์ผู้เล่น (ไม่บังคับ)"}
            <ChevronRight size={18} />
          </button>
          <p className="content-meta mt-2">
            อันดับนี้ใช้คะแนนสูตรเดิม ผลแบบฝึกสูตรใหม่เก็บในเครื่องระหว่างปรับระบบอันดับ ไม่ใช่ผลประเมินภาคปฏิบัติ
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
