"use client";
import { useState, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { playCue, setSoundEnabled, soundEnabled, subscribeSound } from '@/lib/trainingAudio';
export function SoundToggle() {
  const enabled = useSyncExternalStore(subscribeSound, soundEnabled, () => false);
  const [unavailable, setUnavailable] = useState(false);
  return <span className="sound-control">
    <button className="icon-button sound-toggle" aria-label={enabled ? 'ปิดเสียงฝึก' : 'เปิดเสียงฝึก'} aria-pressed={enabled} title={enabled ? 'ปิดเสียงฝึก' : 'เปิดเสียงฝึก'} onClick={() => {
      const available = setSoundEnabled(!enabled);
      setUnavailable(!available);
      if (!available) setSoundEnabled(false);
      else if (!enabled) playCue('select');
    }}>{enabled ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}</button>
    {unavailable && <span className="sound-unavailable" role="status">อุปกรณ์นี้เปิดเสียงไม่ได้ ฝึกต่อแบบเงียบได้</span>}
  </span>;
}
