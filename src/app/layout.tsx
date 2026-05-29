import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "جواب | سیستم مدیریت آزمایشگاه",
  description:
    "سیستم مدرن و سریع مدیریت نتایج آزمایشگاهی - از ثبت بیمار تا تحویل جواب با تفسیر هوشمند",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
