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
} from "lucide-react";
import {
  LEARNING_TOPICS,
  LEARNING_VIDEOS,
  LEARNING_DOCUMENTS,
  PROTOTYPE_DISCLAIMER,
} from "@/data/learning";
import { LearningVideo } from "@/types";
import { YouTubeModal } from "@/components/YouTubeModal";
import { ContentMetadata } from "@/components/TrainingUI";

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
}: {
  onStartMission: () => void;
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
  return (
    <div className="page-stack learning-screen">
      <header>
        <p className="protocol-code">
          {topic ? `บท ${activeModuleIndex + 1} จาก 4` : "คู่มือภาคสนาม"}
        </p>
        <h1 className="page-title">
          {activeModule?.title || "คู่มือ 4 ขั้นก่อนลงมือ"}
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
              return (
                <button
                  className="learning-module"
                  key={item.id}
                  onClick={() => openModule(item.id)}
                >
                  <span>0{index + 1}</span>
                  <Icon className="module-icon" aria-hidden="true" />
                  <span className="flex-1">
                    <strong>{item.title}</strong>
                    <span className="caption block mt-1">{item.detail}</span>
                  </span>
                  <ArrowRight size={20} />
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
            <div className="module-tabs" role="tablist" aria-label="บทในคู่มือ">
              {modules.map((item) => (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  role="tab"
                  aria-selected={selected === item.id}
                  aria-controls="learning-detail"
                  tabIndex={selected === item.id ? 0 : -1}
                  onKeyDown={(event) => {
                    const i = modules.findIndex((m) => m.id === selected);
                    const next =
                      event.key === "ArrowRight"
                        ? (i + 1) % 4
                        : event.key === "ArrowLeft"
                          ? (i + 3) % 4
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? 3
                              : -1;
                    if (next >= 0) {
                      event.preventDefault();
                      setSelected(modules[next].id);
                      document
                        .getElementById(`tab-${modules[next].id}`)
                        ?.focus();
                    }
                  }}
                  onClick={() => setSelected(item.id)}
                >
                  0{modules.indexOf(item) + 1}
                  <span className="sr-only"> {item.title}</span>
                </button>
              ))}
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
                <h3 className="section-title">แหล่งอ้างอิง</h3>
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
