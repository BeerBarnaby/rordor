import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const promptThai = Prompt({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt-thai",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F4F4F1",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title:
    "น้องพร้อม (NONG PROM) — หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37",
  description:
    "น้องพร้อม — สื่อจำลองการฝึก CPR และปฐมพยาบาลขั้นพื้นฐานสำหรับนักศึกษาวิชาทหาร หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37 เรียนให้รู้ ฝึกให้พร้อม ช่วยได้เมื่อถึงเวลา",
  keywords: [
    "น้องพร้อม",
    "NONG PROM",
    "นศท",
    "นักศึกษาวิชาทหาร",
    "มทบ.37",
    "มณฑลทหารบกที่ 37",
    "CPR",
    "AED",
    "1669",
    "ปฐมพยาบาล",
    "จำลองการฝึก",
  ],
  authors: [
    {
      name: "หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${promptThai.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
