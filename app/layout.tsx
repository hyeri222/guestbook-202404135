import type { Metadata } from "next";
import { Geist, Geist_Mono, Jua } from "next/font/google";
import Link from "next/link";
import { isOwner } from "@/lib/auth";
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
  title: "독서 기록",
  description: "읽고 싶은 책과 다 읽은 책의 평점, 감상평을 모아 두는 독서 기록장",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const owner = await isOwner();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${jua.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header>
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-cute text-2xl">
              📚 독서 기록
            </Link>
            {owner && (
              <Link
                href="/me"
                aria-label="마이페이지"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-xl transition hover:scale-105"
              >
                🐻
              </Link>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-6 pt-2">{children}</main>
      </body>
    </html>
  );
}
