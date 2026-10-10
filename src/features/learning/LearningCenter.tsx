"use client";
import { useState } from "react";
import Image from 'next/image';
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
} from "@/data/learning";
import { LearningVideo, UserProgress } from "@/types";
import { YouTubeModal } from "@/components/YouTubeModal";
import { ContentMetadata } from "@/components/TrainingUI";
import { ProgressService } from "@/lib/progress";
import { CPR_LESSONS, CPR_LESSON_SCOPE, CPR_SOURCES } from '@/data/cprLessons';

const modules = [
  {
    id: "assessment",
    title: "ประเมินสถานการณ์",
    detail: "ความปลอดภัย · การตอบสนอง",
    icon: ShieldCheck,
    cover: '/images/training/lesson-assessment-v1.png',
  },
  { id: "call1669", title: "แจ้งเหตุ 1669", detail: "ข้อมูลที่ต้องแจ้ง", icon: PhoneCall, cover: '/images/training/lesson-call1669-v1.png' },
  { id: "cpr", title: "การทำ CPR เบื้องต้น", detail: "ตำแหน่งมือ · จังหวะการกด", icon: HeartPulse, cover: '/images/training/lesson-cpr-v1.png' },
  {
    id: "aed",
    title: "AED · บทเรียนเสริม",
    detail: "สำหรับผู้สนใจ · ไม่บังคับในภารกิจหลัก",
    icon: Zap,
    cover: '/images/training/prom-aed-clear-v1.png',
  },
];
export function LearningCenter({
  onStartMission,
  onPracticeAED,
  progress,
  initialTopic = null,
}: {
  onStartMission: () => void;
  onPracticeAED: () => void;
  progress: UserProgress;
  initialTopic?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(initialTopic);
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
    openModule(null);
  }
  return (
    <div className="page-stack learning-screen">
      <header>
        <p className="protocol-code">
          {selected === 'aed' ? 'บทเรียนเสริม · สำหรับผู้สนใจ' : topic ? `บทเรียนหลัก ${activeModuleIndex + 1} จาก 3` : "บทเรียนภาคสนาม"}
        </p>
        <h1 className="page-title">
          {activeModule?.title || "บทเรียน"}
        </h1>
        {!topic && (
          <p className="lead mt-3">
            เลือกเรียนได้ตามต้องการ ไม่ต้องเรียงลำดับ
          </p>
        )}
      </header>
      {!topic ? (
        <>
          <div className="module-grid">
            {modules.filter(item => item.id !== 'aed').map((item, index) => {
              const completed = progress.completedTopicIds.includes(item.id);
              return (
                <button
                  className="learning-module lesson-card"
                  data-module={item.id}
                  data-complete={completed}
                  key={item.id}
                  onClick={() => openModule(item.id)}
                >
                  <span className="lesson-cover"><Image src={item.cover} alt="" width={1536} height={1024} sizes="(min-width: 1024px) 280px, 110px" /></span>
                  <span className="lesson-card-copy">
                    <span className="module-number">บทเรียน {index + 1}{completed ? ' · เรียนแล้ว' : ''}</span>
                    <strong>{item.title}</strong>
                    <span className="caption block mt-1">{item.detail}</span>
                  <span className="module-open" aria-hidden="true">{completed ? <Check size={18} /> : <ArrowRight size={18} />}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <section className="section-rule" aria-label="บทเรียนเสริม">
            <h2 className="section-title">บทเรียนเสริม: การใช้ AED</h2>
            <p className="caption mb-3">เรียนรู้การเปิดเครื่อง ติดแผ่น และทำตามคำสั่งของเครื่อง</p>
            <button className="learning-module lesson-card" data-module="aed" onClick={() => openModule('aed')}><span className="lesson-cover"><Image src={modules[3].cover} alt="" width={1536} height={1024} sizes="110px" /></span><span className="lesson-card-copy"><span className="module-number">เลือกเรียนเพิ่มเติม</span><strong>การใช้ AED</strong><span className="caption">เปิดเครื่อง ติดแผ่น และทำตามคำสั่งของเครื่อง</span><span className="module-open" aria-hidden="true"><ArrowRight size={18} /></span></span></button>
          </section>
          <aside className="notice">
            ต้องฝึกภาคปฏิบัติกับครูฝึกควบคู่กัน
          </aside>
        </>
      ) : (
        <>
          <button className="text-button !pl-0 self-start" onClick={() => openModule(null)}><ArrowLeft size={20} />บทเรียนทั้งหมด</button>
          <section
            id="learning-detail"
            className="page-stack"
          >
            <section className="lesson-intro">
              <Image src={activeModule!.cover} alt="" width={1536} height={1024} sizes="(min-width: 768px) 240px, 160px" />
              <div><p>{topic.description}</p></div>
            </section>
            <section>
              <h2 className="section-title">ขั้นตอนสำคัญ</h2>
              <ol className="protocol-list">
                {topic.summarySteps.map((step, index) => <li key={step}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><span>{step}</span></li>)}
              </ol>
            </section>
            {selected === 'aed' && <section className="page-stack"><button className="primary-button" onClick={onPracticeAED}>ทบทวน AED ทีละขั้น <ArrowRight size={20} aria-hidden="true" /></button><p className="caption">ลองผลช็อกและไม่ช็อกได้ · ไม่เพิ่ม XP หรือคะแนนทักษะ</p></section>}
            {selected === 'cpr' && (
              <section aria-labelledby="cpr-reading-title" className="cpr-reading">
                <h2 id="cpr-reading-title" className="section-title">การทำ CPR</h2>
                <p className="caption">{CPR_LESSON_SCOPE}</p>
                <div className="cpr-reading-list">
                  {CPR_LESSONS.map((lesson, index) => (
                    <details className="cpr-reading-item" key={lesson.id}>
                      <summary><strong>{index + 1}. {lesson.title}</strong><span className="caption">{lesson.takeaway}</span></summary>
                      <div className="cpr-reading-body">
                        {lesson.points.map(point => <p key={point}>{point}</p>)}
                        <a className="text-button" href={CPR_SOURCES[lesson.source].url} target="_blank" rel="noopener noreferrer">{CPR_SOURCES[lesson.source].title}<ExternalLink size={16} aria-label="เปิดแท็บใหม่" /></a>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
            {videos.length > 0 && (
              <section>
                <h3 className="section-title">วิดีโอประกอบทั้งหมด</h3>
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
                  {selected === 'aed' ? 'จบบทเรียนเสริม AED' : `จบบทเรียน ${activeModuleIndex + 1}`}
                </h3>
                <p className="caption">
                  {activeModuleIndex === modules.length - 1
                    ? "เรียนจบบทนี้แล้วกลับไปเลือกบทอื่นได้"
                    : "เลือกเรียนบทอื่นต่อได้ทุกลำดับ"}
                </p>
              </div>
              <button className="primary-button" onClick={completeModule}>
                เรียนจบบทนี้
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
        <summary>แหล่งอ้างอิงเนื้อหา</summary>
        <p className="caption">ภาพหน้าปกใช้ประกอบหัวข้อ ไม่ใช่ภาพสาธิตการรักษา</p>
        {selected === 'cpr' && <p className="caption">บทอ่าน CPR อ้างอิง AHA 2025 และ American Red Cross</p>}
        <ContentMetadata />
      </details>
      <YouTubeModal video={video} onClose={() => setVideo(null)} />
    </div>
  );
}
