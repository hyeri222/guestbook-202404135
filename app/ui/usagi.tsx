import Image from "next/image";

/** 주인이 넣은 우사기 그림(public/usagi.png, 295×400). 장식이라 스크린리더에서는 숨긴다. */
export function Usagi({ size, className }: { size: number; className?: string }) {
  return (
    <Image
      src="/usagi.png"
      alt=""
      aria-hidden
      width={Math.round((size * 295) / 400)}
      height={size}
      className={`select-none ${className ?? ""}`}
      draggable={false}
    />
  );
}
