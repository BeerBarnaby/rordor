'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { acknowledgeAttempt, outboxSnapshot, pendingAttempts, subscribeOutbox } from './attemptOutbox';
import { submitMeasuredAttempt } from './player';
import type { PlayerProfile } from '@/types';

export function useAttemptSync(playerId: string | undefined, onSaved: (profile: PlayerProfile) => void) {
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; message: string }>({ kind: 'idle', message: '' });
  const [retryTick, setRetryTick] = useState(0);
  const queue = useSyncExternalStore(subscribeOutbox, outboxSnapshot, () => '[]');
  const callback = useRef(onSaved);
  useEffect(() => { callback.current = onSaved; }, [onSaved]);
  useEffect(() => {
    if (!playerId) return;
    let active = true; let busy = false; let timer: ReturnType<typeof setTimeout> | undefined;
    const run = async () => {
      if (!active || busy) return;
      const pending = pendingAttempts(playerId)[0];
      if (!pending) return;
      busy = true;
      setStatus({ kind: 'saving', message: 'กำลังบันทึกคะแนนออนไลน์…' });
      try {
        const profile = await submitMeasuredAttempt(pending);
        acknowledgeAttempt(playerId, pending.clientAttemptId);
        if (active) {
          callback.current(profile);
          setStatus({ kind: 'saved', message: 'บันทึกคะแนนและ XP ออนไลน์แล้ว' });
        }
      } catch (error) {
        if (active) setStatus({ kind: 'error', message: `${error instanceof Error ? error.message : 'ส่งคะแนนไม่สำเร็จ'} · ผลยังรอส่งอยู่ในเครื่อง` });
      } finally { busy = false; }
      // Pace a backlog; do not trip the DB's 20-second rate limit.
      if (active && pendingAttempts(playerId).length && !pendingAttempts(playerId).some(item => item.clientAttemptId === pending.clientAttemptId)) timer = setTimeout(run, 25000);
    };
    const requestRun = () => { void run(); };
    void run();
    window.addEventListener('online', requestRun); window.addEventListener('training-outbox', requestRun);
    return () => { active = false; clearTimeout(timer); window.removeEventListener('online', requestRun); window.removeEventListener('training-outbox', requestRun); };
  }, [playerId, retryTick]);
  // Snapshot subscription also refreshes the pending count after an ACK.
  const pendingCount = playerId && queue ? pendingAttempts(playerId).length : 0;
  return { status: playerId ? status : { kind: 'idle' as const, message: '' }, pendingCount, retry: () => setRetryTick(value => value + 1) };
}
