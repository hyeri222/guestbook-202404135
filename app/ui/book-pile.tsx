"use client";

import { useLayoutEffect, useRef } from "react";
import { Usagi } from "./usagi";

/**
 * 화면 아래 책상 위에 책을 쌓는다. 책이 위까지 차면 더미를 위아래로 끌어 볼 수 있다.
 * 터치는 기본 스크롤을 쓰고, 마우스는 끌기를 직접 처리한다.
 */
export function BookPile({ children }: { children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startTop: number; moved: boolean } | null>(null);

  // 처음에는 책상 바로 위, 맨 아래 책이 보이도록 끝까지 내려 둔다.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [children]);

  return (
    <div className="flex h-[calc(100dvh-12.5rem)] min-h-72 flex-col">
      <div
        ref={scroller}
        className="flex flex-1 cursor-grab flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || !scroller.current) return;
          drag.current = { startY: event.clientY, startTop: scroller.current.scrollTop, moved: false };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state || !scroller.current) return;
          const dy = event.clientY - state.startY;
          if (Math.abs(dy) > 4) state.moved = true;
          scroller.current.scrollTop = state.startTop - dy;
        }}
        onPointerUp={() => {
          // 끌기가 끝난 직후의 클릭이 책을 열지 않도록 한 박자 뒤에 지운다.
          setTimeout(() => (drag.current = null));
        }}
        onPointerLeave={() => (drag.current = null)}
        onClickCapture={(event) => {
          if (drag.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        {/* 책이 적으면 아래로 붙어 책상 위에 놓인다. */}
        {/* 좁은 화면에서는 책상 위 우사기 자리만큼 오른쪽을 비운다. */}
        <div className="mt-auto flex flex-col items-center pr-14 pt-6 sm:pr-0">{children}</div>
      </div>

      {/* 책상. 오른쪽 끝에 우사기가 걸터앉아 있다. */}
      <div aria-hidden className="relative mx-auto w-full max-w-lg">
        <Usagi size={64} className="absolute -top-14 right-2 scale-x-[-1] rotate-[8deg]" />
        <div className="h-4 rounded-t-xl bg-desk shadow-[inset_0_-3px_0_var(--desk-edge)]" />
        <div className="mx-6 flex justify-between">
          <span className="h-6 w-3 rounded-b bg-desk-edge" />
          <span className="h-6 w-3 rounded-b bg-desk-edge" />
        </div>
      </div>
    </div>
  );
}
