// 주인 인증: 환경변수의 비밀번호 하나로 로그인하고, 서명한 쿠키로 30일 동안 기억한다.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "owner_session";
const SESSION_DAYS = 30;

function env(name: "OWNER_PASSWORD" | "SESSION_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 환경변수가 없습니다.`);
  return value;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", env("SESSION_SECRET")).update(String(expiresAt)).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // 길이가 달라도 비교 시간이 같도록 해시끼리 비교한다.
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export async function isOwner(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;

  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;
  return safeEqual(signature, sign(Number(expiresAt)));
}

/** 로그인하지 않았으면 로그인 페이지로 보낸다. 모든 페이지는 주인만 볼 수 있다. */
export async function requireOwner(): Promise<void> {
  if (!(await isOwner())) redirect("/login");
}

/** 비밀번호가 맞으면 쿠키를 발급하고 true. */
export async function logIn(password: string): Promise<boolean> {
  if (!safeEqual(password, env("OWNER_PASSWORD"))) return false;

  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const expiresAt = Date.now() + maxAge * 1000;
  (await cookies()).set(COOKIE_NAME, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return true;
}

export async function logOut(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
