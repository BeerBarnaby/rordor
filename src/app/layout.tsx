import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0F5C4D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "น้องพร้อม (NONG PROM) - หน่วยฝึก นศท. มทบ.37 ศูนย์วันอังคาร รร.วิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย",
  description:
    "น้องพร้อม - สื่อจำลองการฝึก CPR และปฐมพยาบาลขั้นพื้นฐานสำหรับนักศึกษาวิชาทหาร (นศท.) หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37 ศูนย์วันอังคาร โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย เชียงราย — เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา",
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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#F7FAF8] text-[#17221E] font-sans">
        {children}
      </body>
    </html>
  );
}
