import type { Metadata } from "next";
import { Geist, Geist_Mono, Jua } from "next/font/google";
import Link from "next/link";
import { DEVELOPER } from "@/lib/developer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 책등과 제목에 쓰는 둥근 한글 글꼴. 한글 조각이 많아 미리 불러오지 않는다.
const jua = Jua({
  variable: "--font-jua",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "책 더미 방명록",
  description: "이름과 메시지를 책으로 쌓는 미니 방명록",
};

export default function RootLayout({ children }: LayoutProps<"/">) {

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${jua.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header>
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-cute text-2xl">
              📚 책 더미 방명록
            </Link>
            <p className="text-right text-xs leading-tight text-foreground/60">
              만든 사람
              <br />
              <span className="font-cute text-sm text-foreground">
                {DEVELOPER.name} · {DEVELOPER.studentId}
              </span>
            </p>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-6 pt-2">{children}</main>
      </body>
    </html>
  );
}
