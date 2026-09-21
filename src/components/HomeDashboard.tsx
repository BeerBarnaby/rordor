"use client";

import { ArrowRight, Check, ChevronRight, LockKeyhole, Trophy } from "lucide-react";
import { LeaderboardEntry, PlayerProfile, UserProgress } from "@/types";
import { getGameProgress, TOPIC_ORDER } from "@/lib/gameProgress";

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
  onStart: () => void;
  currentStep?: number;
  leaderboard: LeaderboardEntry[];
  player: PlayerProfile | null;
  onOpenPlayer: () => void;
}

export function HomeDashboard({
  progress,
  onLearn,
  onStart,
  currentStep,
  leaderboard,
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
          <p className="protocol-code">Practice before the pressure</p>
          <h1 className="display-title">
            <span className="hero-title-line">ถ้าเหตุฉุกเฉิน</span>
            <span className="hero-title-line">เกิดขึ้น เรา<span className="hero-accent-word">พร้อม</span></span>
            <span className="hero-title-line">ช่วยหรือยัง?</span>
          </h1>
          <p className="lead">
            ฝึกคิด · ฝึกตัดสินใจ · ฝึกช่วยชีวิต
            <br />ผ่านสถานการณ์จำลอง First Aid &amp; CPR
          </p>
          <p className="mission-meta">4 ขั้น · ประมาณ 5 นาที · เปลี่ยนสถานการณ์ทุกครั้ง</p>
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
              บันทึกไว้ที่ขั้น {currentStep + 1} จาก 4
            </p>
          )}
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
                <ChevronRight aria-hidden="true" />
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
                ปลดล็อกแล้ว {game.unlockedTopicCount} จาก 4 บท
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
          <ol className="unlock-path" aria-label="บทเรียนที่ปลดล็อก">
            {TOPIC_ORDER.map((topicId, index) => {
              const unlocked = index < game.unlockedTopicCount;
              const completed = progress.completedTopicIds.includes(topicId);
              return (
                <li key={topicId} data-unlocked={unlocked} data-complete={completed}>
                  <span>{completed ? <Check /> : unlocked ? index + 1 : <LockKeyhole />}</span>
                  <small>{steps[index].title}</small>
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
          {leaderboard.length > 0 ? (
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
              ยังไม่มีคะแนนบนลีดเดอร์บอร์ด เป็นคนแรกที่ทำภารกิจให้จบได้เลย
            </p>
          )}
          <button className="text-button" onClick={onOpenPlayer}>
            {player ? `โปรไฟล์ของ ${player.displayName}` : "เก็บคะแนนบนลีดเดอร์บอร์ด"}
            <ChevronRight size={18} />
          </button>
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
            </div>
            <dl className="metric-list">
              <div>
                <dt>จังหวะกดในช่วงเป้าหมาย</dt>
                <dd>{progress.lastMissionResult.cprRhythmScore}%</dd>
              </div>
              <div>
                <dt>คะแนนดีที่สุด</dt>
                <dd>{progress.bestOverallScore}</dd>
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
