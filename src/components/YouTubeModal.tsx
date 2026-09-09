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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white border border-[#D8E4DE] rounded-2xl overflow-hidden shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#D8E4DE]">
          <div className="flex items-center gap-2.5 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-[#17221E] truncate">{video.title}</h3>
              <p className="text-xs text-[#5C6B65] truncate">{video.provider}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7FAF8] border border-[#D8E4DE] text-[#5C6B65] hover:text-[#17221E] flex items-center justify-center transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Video Container */}
        <div className="relative w-full aspect-video bg-gray-900">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer info & external link */}
        <div className="p-4 bg-white text-[#5C6B65] text-xs flex flex-col gap-2">
          <p className="leading-relaxed text-[#17221E]">{video.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-[#D8E4DE] text-xs text-[#5C6B65]">
            <span>ที่มา: {video.provider}</span>
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0F5C4D] hover:underline flex items-center gap-1 font-medium"
            >
              เปิดใน YouTube <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
