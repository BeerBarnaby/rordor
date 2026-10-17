"use client";

import Link from "next/link";
import { Search, ShieldCheck, Users, Activity, ClipboardCheck, LogIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminClientError, deleteAdminPlayer, fetchAdminOverview, fetchAdminPlayer, type AdminOverview, type AdminPlayerDetail } from "@/lib/adminClient";
import { AdminPlayerDetail as PlayerDetail } from "./AdminPlayerDetail";

export const canConfirmDelete = (expected: string, entered: string) => expected === entered;

export function AdminDashboard() {
  const [data,setData]=useState<AdminOverview|null>(null), [detail,setDetail]=useState<AdminPlayerDetail|null>(null);
  const [search,setSearch]=useState(""),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const [confirmation,setConfirmation]=useState(""),[deleting,setDeleting]=useState(false);
  const load=useCallback(async()=>{setLoading(true);setError("");try{setData(await fetchAdminOverview(search,page));}catch(e){setError(e instanceof AdminClientError&&[401,403].includes(e.status)?"ไม่มีสิทธิ์เข้าหลังบ้าน":"โหลดข้อมูลไม่สำเร็จ");}finally{setLoading(false);}},[search,page]);
  useEffect(()=>{const timer=setTimeout(()=>void load(),300);return()=>clearTimeout(timer);},[load]);
  async function openPlayer(id:string){setLoading(true);try{setDetail(await fetchAdminPlayer(id));setConfirmation("");}catch{setError("เปิดข้อมูลผู้ใช้ไม่สำเร็จ");}finally{setLoading(false);}}
  async function removePlayer(){if(!detail||!canConfirmDelete(detail.player.display_name,confirmation))return;setDeleting(true);try{await deleteAdminPlayer(detail.player.id,confirmation);setDetail(null);setConfirmation("");await load();}catch{setError("ลบผู้ใช้ไม่สำเร็จ");}finally{setDeleting(false);}}
  if(error&&!data)return <main className="admin-auth-state"><ShieldCheck/><h1>หลังบ้านน้องพร้อม</h1><p>{error}</p><Link href="/">กลับหน้าแรกเพื่อเข้าสู่ระบบ</Link></main>;
  return <main className="admin-shell">
    <header className="admin-header"><div><span className="admin-mark">พ</span><div><b>น้องพร้อม · หลังบ้าน</b><small>บัญชีผู้ดูแลระบบ</small></div></div><Link href="/">กลับหน้าเว็บ</Link></header>
    <div className="admin-layout"><aside className="admin-sidebar"><b>จัดการข้อมูล</b><a className="active" href="#users"><Users size={18}/>ผู้ใช้งาน</a><a href="#attempts"><Activity size={18}/>ผลการฝึก</a><a href="#feedback"><ClipboardCheck size={18}/>แบบประเมิน</a><a href="#sessions"><LogIn size={18}/>การเข้าสู่ระบบ</a></aside>
      <section className="admin-main">{detail?<PlayerDetail detail={detail} confirmation={confirmation} deleting={deleting} onConfirmation={setConfirmation} onBack={()=>setDetail(null)} onDelete={removePlayer}/>:<>
        <div className="admin-title-row"><div><p className="protocol-code">ภาพรวมข้อมูล</p><h1>ผู้ใช้งานทั้งหมด</h1></div><label className="admin-search"><Search size={18}/><input aria-label="ค้นหาผู้ใช้" value={search} onChange={e=>{setSearch(e.target.value.slice(0,80));setPage(1);}} placeholder="ค้นหาชื่อ เบอร์ หรือโรงเรียน"/></label></div>
        {loading&&!data?<div className="admin-loading">กำลังตรวจสิทธิ์และโหลดข้อมูล...</div>:data&&<><div className="admin-stats"><div><span>ผู้ใช้ทั้งหมด</span><b>{data.summary.total_users}</b></div><div><span>เข้าใช้วันนี้</span><b>{data.summary.active_today}</b></div><div><span>ภารกิจที่จบ</span><b>{data.summary.completed_missions}</b></div><div><span>แบบประเมิน</span><b>{data.summary.feedback_count}</b></div></div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ผู้ใช้</th><th>โรงเรียน</th><th>ชั้นปี</th><th>คะแนนสูงสุด</th><th>เข้าใช้ล่าสุด</th><th></th></tr></thead><tbody>{data.users.map(u=><tr key={u.id}><td><b>{u.display_name}</b><small>{u.masked_phone}</small></td><td>{u.school_name}</td><td>{u.training_year?`ปี ${u.training_year}`:"อื่น ๆ"}</td><td>{u.best_score}</td><td>{new Intl.DateTimeFormat("th-TH",{dateStyle:"short",timeStyle:"short"}).format(new Date(u.last_activity_at))}</td><td><button onClick={()=>void openPlayer(u.id)}>ดูข้อมูล</button></td></tr>)}</tbody></table>{!data.users.length&&<p className="admin-empty">ไม่พบผู้ใช้</p>}</div>
          <div className="admin-pages"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>ก่อนหน้า</button><span>หน้า {page} · {data.total_count} คน</span><button disabled={page*data.page_size>=data.total_count} onClick={()=>setPage(p=>p+1)}>ถัดไป</button></div></>}
      </>}</section></div>
  </main>;
}
