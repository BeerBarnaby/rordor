"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import type { AdminPlayerDetail as Detail } from "@/lib/adminClient";

const date = (value: string) => new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function AdminPlayerDetail({ detail, confirmation, deleting, onConfirmation, onBack, onDelete }: {
  detail: Detail; confirmation: string; deleting: boolean;
  onConfirmation: (value: string) => void; onBack: () => void; onDelete: () => void;
}) {
  const { player } = detail;
  return <section className="admin-detail">
    <button className="admin-back" onClick={onBack}><ArrowLeft size={18}/> กลับไปรายชื่อ</button>
    <div className="admin-detail-head"><div><p className="protocol-code">รายละเอียดผู้ใช้</p><h2>{player.display_name}</h2></div>{player.is_admin && <span className="admin-chip">ผู้ดูแลระบบ</span>}</div>
    <dl className="admin-detail-grid">
      <div><dt>เบอร์โทร</dt><dd>{player.phone}</dd></div><div><dt>โรงเรียน</dt><dd>{player.school_name}</dd></div>
      <div><dt>ชั้นปี</dt><dd>{player.training_year ? `ชั้นปีที่ ${player.training_year}` : "บุคคลทั่วไป / อื่น ๆ"}</dd></div>
      <div><dt>XP</dt><dd>{detail.xp.toLocaleString("th-TH")}</dd></div><div><dt>สร้างบัญชี</dt><dd>{date(player.created_at)}</dd></div>
      <div><dt>เข้าใช้ล่าสุด</dt><dd>{detail.sessions[0] ? date(detail.sessions[0].last_seen_at) : "ยังไม่มีข้อมูล"}</dd></div>
    </dl>
    <div className="admin-section"><h3>ผลการฝึก ({detail.attempts.length})</h3>{detail.attempts.length ? <div className="admin-activity-list">{detail.attempts.map(a=><div key={a.id}><b>{a.overall_score}/100</b><span>{a.scoring_version} · CPR {a.cpr_rhythm_score}% · {date(a.completed_at)}</span></div>)}</div>:<p className="caption">ยังไม่มีผลการฝึก</p>}</div>
    <div className="admin-section"><h3>การเข้าสู่ระบบ ({detail.sessions.length})</h3>{detail.sessions.length ? <div className="admin-activity-list">{detail.sessions.map(s=><div key={s.id}><b>{date(s.last_seen_at)}</b><span>เริ่มเซสชัน {date(s.created_at)}</span></div>)}</div>:<p className="caption">ยังไม่มีข้อมูล</p>}</div>
    <div className="admin-section"><h3>แบบประเมิน</h3>{detail.feedback?<><div className="admin-rating-row"><span>เนื้อหา {detail.feedback.content_rating}/5</span><span>ใช้งาน {detail.feedback.usability_rating}/5</span><span>มั่นใจ {detail.feedback.confidence_rating}/5</span><span>ภาพรวม {detail.feedback.app_rating}/5</span></div>{detail.feedback.comment&&<p>{detail.feedback.comment}</p>}</>:<p className="caption">ยังไม่ได้ส่งแบบประเมิน</p>}</div>
    <div className="admin-danger"><h3>ลบผู้ใช้และข้อมูลทั้งหมด</h3><p>ลบถาวรทั้งโปรไฟล์ เซสชัน ผลฝึก และแบบประเมิน ไม่สามารถกู้คืนได้</p>
      {player.is_admin ? <p className="caption">ไม่สามารถลบบัญชีผู้ดูแลระบบได้</p> : <><label><span>พิมพ์ “{player.display_name}” เพื่อยืนยัน</span><input value={confirmation} onChange={e=>onConfirmation(e.target.value)} /></label><button className="admin-delete" disabled={deleting||confirmation!==player.display_name} onClick={onDelete}><Trash2 size={18}/>{deleting?"กำลังลบ...":"ลบผู้ใช้ถาวร"}</button></>}
    </div>
  </section>;
}
