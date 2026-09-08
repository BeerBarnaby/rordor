'use client';

import React from 'react';
import { X, ExternalLink, Play } from 'lucide-react';
import { LearningVideo } from '@/types';

interface YouTubeModalProps {
  video: LearningVideo | null;
  onClose: () => void;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-white truncate">{video.title}</h3>
              <p className="text-[11px] text-slate-400 truncate">{video.provider}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Video Container */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer info & external link */}
        <div className="p-4 bg-slate-900/90 text-slate-300 text-xs flex flex-col gap-2">
          <p className="leading-relaxed text-slate-300">{video.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span>ที่มา: {video.provider}</span>
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              เปิดใน YouTube <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
