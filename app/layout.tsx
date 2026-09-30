import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { logOutAction } from "@/app/actions";
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

export const metadata: Metadata = {
  title: "독서 기록",
  description: "읽고 싶은 책과 다 읽은 책의 평점, 감상평을 모아 두는 독서 기록장",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const owner = await isOwner();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-foreground/10">
          <div className="mx-auto max-w-2xl px-4 py-4">
            <Link href="/" className="text-lg font-semibold">
              독서 기록
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-foreground/10">
          <div className="mx-auto max-w-2xl px-4 py-4 text-xs text-foreground/60">
            {owner ? (
              <form action={logOutAction}>
                <button type="submit" className="underline">
                  로그아웃
                </button>
              </form>
            ) : (
              <Link href="/login" className="underline">
                주인 로그인
              </Link>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
