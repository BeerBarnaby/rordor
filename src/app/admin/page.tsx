import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "หลังบ้าน | น้องพร้อม", robots: { index: false, follow: false } };
export default function AdminPage(){return <AdminDashboard/>;}
