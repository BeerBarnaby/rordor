"use client";
import { ExternalLink } from "lucide-react";
import { LearningVideo } from "@/types";
import { AppDialog } from "./AppDialog";
export function YouTubeModal({
  video,
  onClose,
}: {
  video: LearningVideo | null;
  onClose: () => void;
}) {
  return (
    <AppDialog
      open={!!video}
      onClose={onClose}
      title={video?.title || "วิดีโอประกอบ"}
    >
      {video && (
        <>
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="dialog-body page-stack">
            <p>{video.description}</p>
            <p className="caption">ที่มา: {video.provider}</p>
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-button"
            >
              เปิดใน YouTube
              <ExternalLink size={20} />
            </a>
          </div>
        </>
      )}
    </AppDialog>
  );
}
