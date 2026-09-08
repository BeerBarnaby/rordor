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
      <div className="bg-gradient-to-r from-emerald-900/80 to-teal-900/60 p-4 rounded-2xl border border-emerald-700/30 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            คลังการเรียนรู้ปฐมพยาบาล
          </h2>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            เรียนรู้ขั้นตอนและดูวิดีโอสาธิตก่อนลงภารกิจจำลอง
          </p>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-200 leading-snug">
          <strong className="font-semibold text-amber-400">คำเตือน: </strong>
          {PROTOTYPE_DISCLAIMER}
        </p>
      </div>

      {/* Topics Filter Bar */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300">เลือกหมวดหมู่การเรียนรู้</div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTopicId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
              selectedTopicId === 'all'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40 font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ทั้งหมด
          </button>
          {LEARNING_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                selectedTopicId === topic.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {getTopicIcon(topic.iconName)}
              {topic.title}
            </button>
          ))}
        </div>
      </div>

      {/* Micro-learning Steps Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4" />
            สรุปขั้นตอนสำคัญ (Micro-Learning)
          </h3>
          <span className="text-[10px] text-slate-400">8 ขั้นตอน CPR ผู้ใหญ่</span>
        </div>

        <div className="space-y-2">
          {MICRO_LEARNING_STEPS.map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:border-emerald-500/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xs font-bold shrink-0">
                {item.step}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">{item.title}</div>
                <div className="text-[11px] text-slate-400">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Video Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>วิดีโอสาธิตการปฏิบัติ ({filteredVideos.length})</span>
          <span className="text-[10px] text-slate-400 font-normal">YouTube Embed</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all shadow-md flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>

                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-mono text-white">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-3 space-y-1">
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {video.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{video.description}</p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-emerald-400/90 font-medium">
                  <span>ผู้จัดทำ: {video.provider}</span>
                  <span className="flex items-center gap-1 group-hover:underline">
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          เอกสารอ้างอิงและคู่มือทางการ ({filteredDocs.length})
        </h3>

        <div className="space-y-2">
          {filteredDocs.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-white leading-tight">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400">{doc.provider}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom CTA to start mission */}
      <div className="pt-2">
        <button
          onClick={onStartMission}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
