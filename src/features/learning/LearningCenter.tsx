'use client';

import React, { useState } from 'react';
import { 
  LEARNING_TOPICS, 
  LEARNING_VIDEOS, 
  LEARNING_DOCUMENTS, 
  MICRO_LEARNING_STEPS, 
  PROTOTYPE_DISCLAIMER 
} from '@/data/learning';
import { LearningVideo } from '@/types';
import { YouTubeModal } from '@/components/YouTubeModal';
import { 
  Play, 
  FileText, 
  ExternalLink, 
  ShieldAlert, 
  HeartPulse, 
  PhoneCall, 
  Zap, 
  BookOpen, 
  ArrowRight
} from 'lucide-react';

interface LearningCenterProps {
  onStartMission: () => void;
}

export const LearningCenter: React.FC<LearningCenterProps> = ({ onStartMission }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<LearningVideo | null>(null);

  const filteredVideos = selectedTopicId === 'all' 
    ? LEARNING_VIDEOS 
    : LEARNING_VIDEOS.filter(v => v.topicId === selectedTopicId);

  const filteredDocs = selectedTopicId === 'all'
    ? LEARNING_DOCUMENTS
    : LEARNING_DOCUMENTS.filter(d => d.topicId === selectedTopicId);

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'PhoneCall': return <PhoneCall className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-[#DFF4EC] p-4 rounded-2xl border border-[#D8E4DE] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#17221E] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0F5C4D]" />
            คลังการเรียนรู้ปฐมพยาบาล
          </h2>
          <p className="text-xs text-[#5C6B65] mt-1">
            เรียนรู้ขั้นตอนและดูวิดีโอสาธิตก่อนลงภารกิจจำลอง
          </p>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-snug">
          <strong className="font-semibold text-amber-700">คำเตือน: </strong>
          {PROTOTYPE_DISCLAIMER}
        </p>
      </div>

      {/* Topics Filter Bar */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#17221E]">เลือกหมวดหมู่การเรียนรู้</div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTopicId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all border ${
              selectedTopicId === 'all'
                ? 'bg-[#0F5C4D] text-white border-[#0F5C4D] shadow-sm font-semibold'
                : 'bg-white text-[#5C6B65] border-[#D8E4DE] hover:border-[#0F5C4D]/30'
            }`}
          >
            ทั้งหมด
          </button>
          {LEARNING_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all border ${
                selectedTopicId === topic.id
                  ? 'bg-[#0F5C4D] text-white border-[#0F5C4D] shadow-sm font-semibold'
                  : 'bg-white text-[#5C6B65] border-[#D8E4DE] hover:border-[#0F5C4D]/30'
              }`}
            >
              {getTopicIcon(topic.iconName)}
              {topic.title}
            </button>
          ))}
        </div>
      </div>

      {/* Micro-learning Steps Section */}
      <div className="bg-white border border-[#D8E4DE] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#17221E] flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-[#0F5C4D]" />
            สรุปขั้นตอนสำคัญ
          </h3>
          <span className="text-[11px] text-[#5C6B65]">8 ขั้นตอน CPR ผู้ใหญ่</span>
        </div>

        <div className="space-y-2">
          {MICRO_LEARNING_STEPS.map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#F7FAF8] border border-[#D8E4DE] hover:border-[#0F5C4D]/30 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#DFF4EC] text-[#0F5C4D] border border-[#D8E4DE] flex items-center justify-center text-xs font-bold shrink-0">
                {item.step}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-[#17221E]">{item.title}</div>
                <div className="text-xs text-[#5C6B65]">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Video Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#17221E]">
          วิดีโอสาธิตการปฏิบัติ ({filteredVideos.length})
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group cursor-pointer bg-white border border-[#D8E4DE] rounded-2xl overflow-hidden hover:border-[#0F5C4D]/40 transition-all shadow-sm hover:shadow-md flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/10" />
                
                {/* Play Button Overlay */}
                <div className="absolute w-12 h-12 rounded-full bg-[#0F5C4D]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>

                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[11px] font-mono text-white">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-3.5 space-y-1">
                <h4 className="text-sm font-semibold text-[#17221E] group-hover:text-[#0F5C4D] transition-colors line-clamp-1">
                  {video.title}
                </h4>
                <p className="text-xs text-[#5C6B65] line-clamp-2">{video.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#5C6B65]">
                  <span>ผู้จัดทำ: {video.provider}</span>
                  <span className="flex items-center gap-1 text-[#0F5C4D] font-medium group-hover:underline">
                    รับชม <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Document Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#17221E]">
          เอกสารอ้างอิงและคู่มือทางการ ({filteredDocs.length})
        </h3>

        <div className="space-y-2">
          {filteredDocs.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#D8E4DE] hover:border-[#0F5C4D]/40 transition-all text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#DFF4EC] text-[#0F5C4D] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-[#17221E] leading-tight">{doc.title}</h4>
                  <p className="text-[11px] text-[#5C6B65]">{doc.provider}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#5C6B65] shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom CTA to start mission */}
      <div className="pt-2">
        <button
          onClick={onStartMission}
          className="w-full py-3.5 px-4 rounded-xl bg-[#0F5C4D] hover:bg-[#0a4a3d] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>เรียนพร้อมแล้ว? เข้าสู่ภารกิจจำลอง</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Video Modal Player */}
      <YouTubeModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};
