"use client";
import { useSyncExternalStore } from 'react';
import { EXPERIENCE_KEY, experienceSnapshot, readExperience, subscribeExperience } from '@/lib/experiencePreferences';
export function ExperienceSettings() {
  const raw = useSyncExternalStore(subscribeExperience, experienceSnapshot, () => '');
  const settings = readExperience(raw);
  function change(key: 'reduceMotion' | 'haptics', checked: boolean) {
    try {
      localStorage.setItem(EXPERIENCE_KEY, JSON.stringify({...settings, [key]: checked}));
      window.dispatchEvent(new Event('experience-preferences'));
    } catch { /* Preferences are optional, training remains available. */ }
  }
  return <section className="page-stack">
    <h3 className="section-title">ปรับประสบการณ์ในอุปกรณ์นี้</h3>
    <label className="experience-option"><input type="checkbox" checked={settings.reduceMotion} onChange={e=>change('reduceMotion', e.target.checked)} /><span>ลดการเคลื่อนไหวเพิ่มเติม</span></label>
    <label className="experience-option"><input type="checkbox" checked={settings.haptics} onChange={e=>change('haptics', e.target.checked)} /><span>สั่นเมื่อแตะฝึก CPR (เฉพาะอุปกรณ์ที่รองรับ)</span></label>
    <p className="caption">ไม่ใช้เสียงหรือการสั่นเป็นเงื่อนไขในการฝึก และเคารพการตั้งค่าลดการเคลื่อนไหวของอุปกรณ์เสมอ</p>
  </section>;
}
