/** 작성 시각을 한국 시간으로 보여준다. */
export function WrittenAt({ iso }: { iso: string }) {
  const text = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
  return <time dateTime={iso}>{text}</time>;
}
