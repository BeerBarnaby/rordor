import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0F291E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "น้องพร้อม (NONG PROM) - หน่วยฝึก นศท. มทบ.37 ศูนย์วันอังคาร รร.วิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย",
  description:
    "น้องพร้อม - สื่อจำลองการฝึก CPR และปฐมพยาบาลขั้นพื้นฐานสำหรับนักศึกษาวิชาทหาร (นศท.) หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37 ศูนย์วันอังคาร โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย “เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา”",
  keywords: [
    "น้องพร้อม",
    "NONG PROM",
    "นศท",
    "นักศึกษาวิชาทหาร",
    "มทบ.37",
    "มณฑลทหารบกที่ 37",
    "ศูนย์วันอังคาร",
    "โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย",
    "จภ.ชร.",
    "PCSHSCR",
    "CPR",
    "AED",
    "1669",
    "ปฐมพยาบาล",
    "จำลองการฝึก",
  ],
  authors: [{ name: "หน่วยฝึกนักศึกษาวิชาทหาร มทบ.37 ศูนย์วันอังคาร รร.วิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
