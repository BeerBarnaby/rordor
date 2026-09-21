"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  FileText,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  HeartPulse,
  Zap,
  LockKeyhole,
  Check,
} from "lucide-react";
import {
  LEARNING_TOPICS,
  LEARNING_VIDEOS,
  LEARNING_DOCUMENTS,
  PROTOTYPE_DISCLAIMER,
} from "@/data/learning";
import { LearningVideo, UserProgress } from "@/types";
import { YouTubeModal } from "@/components/YouTubeModal";
import { ContentMetadata } from "@/components/TrainingUI";
import { isTopicUnlocked } from "@/lib/gameProgress";
import { ProgressService } from "@/lib/progress";

const modules = [
  {
    id: "assessment",
    title: "ประเมินสถานการณ์",
    detail: "ความปลอดภัย · การตอบสนอง",
    icon: ShieldCheck,
  },
  { id: "call1669", title: "ขอความช่วยเหลือ", detail: "โทร 1669 · ขอ AED", icon: PhoneCall },
  { id: "cpr", title: "เริ่ม CPR", detail: "ตำแหน่งมือ · ความเร็ว · จังหวะ", icon: HeartPulse },
  {
    id: "aed",
    title: "ใช้ AED",
    detail: "เปิดเครื่อง · ติดแผ่น · ทำตามคำสั่ง",
    icon: Zap,
  },
];
export function LearningCenter({
  onStartMission,
  progress,
}: {
  onStartMission: () => void;
  progress: UserProgress;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [video, setVideo] = useState<LearningVideo | null>(null);
  const topic = LEARNING_TOPICS.find((item) => item.id === selected);
  const activeModule = modules.find((item) => item.id === selected);
  const activeModuleIndex = modules.findIndex((item) => item.id === selected);
  const videos = LEARNING_VIDEOS.filter(
    (item) =>
      item.topicId === selected ||
      (selected === "aed" && item.topicId === "cpr"),
  );
  const docs = LEARNING_DOCUMENTS.filter(
    (item) => item.topicId === selected && item.isAvailable,
  );
  function openModule(id: string | null) {
    setSelected(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function completeModule() {
    if (!selected) return;
    ProgressService.markTopicCompleted(selected);
    const next = activeModuleIndex + 1;
    if (next < modules.length) openModule(modules[next].id);
  }
  return (
    <div className="page-stack learning-screen">
      <header>
        <p className="protocol-code">
          {topic ? `บท ${activeModuleIndex + 1} จาก 4` : "บทเรียนภาคสนาม"}
        </p>
        <h1 className="page-title">
          {activeModule?.title || "บทเรียน 4 ขั้นก่อนลงมือ"}
        </h1>
        {!topic && (
          <p className="lead mt-3">
            ทบทวนเฉพาะสิ่งจำเป็นก่อนเริ่มสถานการณ์ เลือกอ่านทีละบทได้
          </p>
        )}
      </header>
      {!topic ? (
        <>
          <div className="module-grid">
            {modules.map((item, index) => {
              const Icon = item.icon;
              const unlocked = isTopicUnlocked(item.id, progress.completedTopicIds);
              const completed = progress.completedTopicIds.includes(item.id);
              return (
                <button
                  className="learning-module"
                  data-module={item.id}
                  data-locked={!unlocked}
                  data-complete={completed}
                  key={item.id}
                  disabled={!unlocked}
                  onClick={() => unlocked && openModule(item.id)}
                >
                  <span className="module-number">0{index + 1}</span>
                  {unlocked ? (
                    <Icon className="module-icon" aria-hidden="true" />
                  ) : (
                    <LockKeyhole className="module-icon" aria-hidden="true" />
                  )}
                  <span className="flex-1">
                    <strong>{item.title}</strong>
                    <span className="caption block mt-1">{item.detail}</span>
                  </span>
                  <span className="module-open">
                    {completed ? (
                      <>ทบทวนอีกครั้ง <Check size={18} /></>
                    ) : unlocked ? (
                      <>เปิดบทเรียน <ArrowRight size={18} /></>
                    ) : (
                      <>จบบท {String(index).padStart(2, "0")} เพื่อปลดล็อก <LockKeyhole size={16} /></>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <aside className="notice">
            <strong>ใช้ทบทวนก่อนฝึก</strong>
            {PROTOTYPE_DISCLAIMER} และไม่ทดแทนการฝึกภาคปฏิบัติ
          </aside>
        </>
      ) : (
        <>
          <div className="chapter-header">
            <button
              className="text-button !pl-0"
              onClick={() => openModule(null)}
            >
              <ArrowLeft size={20} />
              ทุกบท
            </button>
            <div className="module-tabs" role="tablist" aria-label="รายการบทเรียน">
              {modules.map((item, index) => {
                const Icon = item.icon;
                const unlocked = isTopicUnlocked(item.id, progress.completedTopicIds);
                return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  role="tab"
                  aria-selected={selected === item.id}
                  aria-controls="learning-detail"
                  tabIndex={selected === item.id ? 0 : -1}
                  disabled={!unlocked}
                  onKeyDown={(event) => {
                    const available = modules.filter((m) =>
                      isTopicUnlocked(m.id, progress.completedTopicIds),
                    );
                    const i = available.findIndex((m) => m.id === selected);
                    const next =
                      event.key === "ArrowRight"
                        ? (i + 1) % available.length
                        : event.key === "ArrowLeft"
                          ? (i + available.length - 1) % available.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? available.length - 1
                              : -1;
                    if (next >= 0) {
                      event.preventDefault();
                      setSelected(available[next].id);
                      document
                        .getElementById(`tab-${available[next].id}`)
                        ?.focus();
                    }
                  }}
                  onClick={() => unlocked && setSelected(item.id)}
                  data-module={item.id}
                  data-locked={!unlocked}
                >
                  <Icon aria-hidden="true" />
                  <span>0{index + 1}</span>
                  <small>{item.title}</small>
                </button>
                );
              })}
            </div>
          </div>
          <section
            id="learning-detail"
            role="tabpanel"
            aria-labelledby={`tab-${selected}`}
            className="page-stack"
          >
            {videos.length > 0 && (
              <section>
                <h3 className="section-title">วิดีโอแนะนำ</h3>
                <div className="video-grid">
                  {videos.map((item) => (
                    <button
                      key={item.id}
                      className="video-resource"
                      onClick={() => setVideo(item)}
                    >
                      <div className="video-thumbnail">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                          alt=""
                          width={480}
                          height={270}
                          loading="lazy"
                        />
                        <span className="video-play"><Play /></span>
                        {item.contextLabel && (
                          <span className="video-context-label">
                            {item.contextLabel}
                          </span>
                        )}
                        {item.duration && (
                          <span className="video-duration">
                            {item.duration.replace("min", "นาที")}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-3 font-semibold">{item.title}</h4>
                      <p className="caption mt-1">{item.provider}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <div className="detail-grid">
              <section>
                <p>{topic.description}</p>
                <h2 className="section-title mt-6">ลำดับการช่วยเหลือ</h2>
                <ol className="protocol-list">
                  {topic.summarySteps.map((step, index) => (
                    <li key={step}>
                      <span className="step-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
              {docs.length > 0 && <section>
                <h3 className="section-title">แหล่งอ้างอิงทางการ</h3>
                {docs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-row"
                  >
                    <FileText />
                    <span>
                      <span className="block">{doc.title}</span>
                      <span className="caption block mt-1">{doc.provider}</span>
                      <span className="caption block">ตรวจลิงก์ล่าสุด {doc.checkedAt}</span>
                    </span>
                    <ExternalLink aria-label="เปิดแท็บใหม่" />
                  </a>
                ))}
              </section>}
            </div>
            <section className="chapter-complete">
              <div>
                <p className="protocol-code">
                  {progress.completedTopicIds.includes(selected ?? "") ? "ทบทวนแล้ว" : "ปลดล็อกบทถัดไป"}
                </p>
                <h3 className="section-title !mb-1">
                  {activeModuleIndex === modules.length - 1
                    ? "พร้อมเข้าสู่สถานการณ์จำลอง"
                    : `จบบท ${String(activeModuleIndex + 1).padStart(2, "0")}`}
                </h3>
                <p className="caption">
                  {activeModuleIndex === modules.length - 1
                    ? "คุณเปิดครบทั้ง 4 บทแล้ว"
                    : `ทำเครื่องหมายบทนี้เพื่อเปิด ${modules[activeModuleIndex + 1].title}`}
                </p>
              </div>
              <button className="primary-button" onClick={completeModule}>
                {activeModuleIndex === modules.length - 1 ? "จบบทนี้" : "จบบทและไปต่อ"}
                <ArrowRight size={18} />
              </button>
            </section>
          </section>
        </>
      )}
      <div className="section-rule">
        <button className="primary-button" onClick={onStartMission}>
          เริ่มฝึกสถานการณ์
          <ArrowRight size={20} />
        </button>
      </div>
      <details className="reference-details">
        <summary>แหล่งอ้างอิงและสถานะการตรวจทานเนื้อหา</summary>
        <ContentMetadata />
      </details>
      <YouTubeModal video={video} onClose={() => setVideo(null)} />
    </div>
  );
}
