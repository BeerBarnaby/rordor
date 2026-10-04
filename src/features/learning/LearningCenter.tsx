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
import { ProgressService } from "@/lib/progress";

const modules = [
  {
    id: "assessment",
    shortTitle: "ประเมิน",
    title: "ประเมินสถานการณ์",
    detail: "ความปลอดภัย · การตอบสนอง",
    icon: ShieldCheck,
  },
  { id: "call1669", shortTitle: "แจ้งเหตุ", title: "ขอความช่วยเหลือ", detail: "โทร 1669 · ขอ AED", icon: PhoneCall },
  { id: "cpr", shortTitle: "CPR", title: "เริ่ม CPR", detail: "ตำแหน่งมือ · ความเร็ว · จังหวะ", icon: HeartPulse },
  {
    id: "aed",
    shortTitle: "AED",
    title: "ใช้ AED",
    detail: "เปิดเครื่อง · ติดแผ่น · ทำตามคำสั่ง",
    icon: Zap,
  },
];
export function LearningCenter({
  onStartMission,
  progress,
  selected,
  onSelect,
}: {
  onStartMission: () => void;
  progress: UserProgress;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [video, setVideo] = useState<LearningVideo | null>(null);
  const topic = LEARNING_TOPICS.find((item) => item.id === selected);
  const activeModule = modules.find((item) => item.id === selected);
  const activeModuleIndex = modules.findIndex((item) => item.id === selected);
  const videos = LEARNING_VIDEOS.filter(
    (item) =>
      item.topicId === selected ||
      (selected === "aed" && item.topicId === "cpr"),
  ).sort((a, b) => Number(Boolean(a.contextLabel)) - Number(Boolean(b.contextLabel)));
  const docs = LEARNING_DOCUMENTS.filter(
    (item) => item.topicId === selected && item.isAvailable,
  );
  function openModule(id: string | null) {
    onSelect(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function completeModule() {
    if (!selected) return;
    ProgressService.markTopicCompleted(selected);
    openModule(null);
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
            {modules.map((item) => {
              const Icon = item.icon;
              const completed = progress.completedTopicIds.includes(item.id);
              return (
                <button
                  className="learning-module"
                  data-module={item.id}
                  data-complete={completed}
                  key={item.id}
                  onClick={() => openModule(item.id)}
                >
                  <Icon className="module-icon" aria-hidden="true" />
                  <span className="flex-1">
                    <strong>{item.title}</strong>
                    <span className="caption block mt-1">{item.detail}</span>
                  </span>
                  <span className="module-open">
                    {completed ? (
                      <>ทบทวนอีกครั้ง <Check size={18} /></>
                    ) : (
                      <>เปิดบทเรียน <ArrowRight size={18} /></>
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
              {modules.map((item) => {
                return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  role="tab"
                  aria-label={item.title}
                  aria-selected={selected === item.id}
                  aria-controls="learning-detail"
                  tabIndex={selected === item.id ? 0 : -1}
                  onKeyDown={(event) => {
                    const i = modules.findIndex((m) => m.id === selected);
                    const next =
                      event.key === "ArrowRight"
                        ? (i + 1) % modules.length
                        : event.key === "ArrowLeft"
                          ? (i + modules.length - 1) % modules.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? modules.length - 1
                              : -1;
                    if (next >= 0) {
                      event.preventDefault();
                      onSelect(modules[next].id);
                      document
                        .getElementById(`tab-${modules[next].id}`)
                        ?.focus();
                    }
                  }}
                  onClick={() => openModule(item.id)}
                  data-module={item.id}
                >
                  <span>{item.shortTitle}</span>
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
            <section className="lesson-essentials" aria-labelledby="lesson-essentials-title">
              <h2 id="lesson-essentials-title" className="section-title">สิ่งที่ต้องจำ</h2>
              <p className="caption">{topic.description}</p>
              <ol className="protocol-list mt-4">
                {topic.summarySteps.map((step, index) => <li key={step}><span className="step-number">{index + 1}</span><span>{step}</span></li>)}
              </ol>
            </section>
            {videos.length > 0 && (
              <section>
                <h3 className="section-title">วิดีโอแนะนำ</h3>
                <div className="video-grid">
                  {videos.slice(0, 1).map((item) => (
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
                      <h4 className="mt-3 font-bold">{item.title}</h4>
                      <p className="caption mt-1">{item.provider}</p>
                    </button>
                  ))}
                </div>
                {videos.length > 1 && <details className="reference-details mt-4" key={selected}>
                  <summary>ดูคลิปเพิ่มเติม ({videos.length - 1})</summary>
                  <div className="lesson-extra-videos">
                    {videos.slice(1).map(item => <button key={item.id} className="resource-row" onClick={() => setVideo(item)}><Play size={20} aria-hidden="true" /><span><strong>{item.title}</strong><span className="caption block">{item.provider} · {item.duration?.replace('min', 'นาที')}</span>{item.contextLabel && <span className="caption block">{item.contextLabel}</span>}</span><ArrowRight size={18} aria-hidden="true" /></button>)}
                  </div>
                </details>}
              </section>
            )}
            <div className="detail-grid">
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
                  {progress.completedTopicIds.includes(selected ?? "") ? "ทบทวนแล้ว" : "บันทึกความคืบหน้า"}
                </p>
                <h3 className="section-title !mb-1">
                  อ่านแล้ว บันทึกไว้ทบทวน
                </h3>
                <p className="caption">
                  {activeModuleIndex === modules.length - 1
                    ? "เรียนจบบทนี้แล้วกลับไปเลือกบทอื่นได้"
                    : "เลือกเรียนบทอื่นต่อได้ทุกลำดับ"}
                </p>
              </div>
              <button className="secondary-button" onClick={completeModule}>
                บันทึกว่าอ่านแล้ว
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
