/** 주인이 사는 한국 시간 기준 오늘 날짜("YYYY-MM-DD"). Vercel 서버는 UTC라서 따로 계산한다. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}
