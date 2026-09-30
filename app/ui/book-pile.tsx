"use client";

import { useRef } from "react";
import { Usagi } from "./usagi";

/**
 * 화면 아래 책상 위에 책을 쌓는다. 책이 위까지 차면 맨 위(가장 최근) 책이 보이는 데서 시작하고,
 * 더미를 위아래로 끌어 아래쪽 책을 볼 수 있다. 터치는 기본 스크롤을 쓰고, 마우스는 끌기를 직접 처리한다.
 */
export function BookPile({ children }: { children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startTop: number; moved: boolean } | null>(null);

  return (
    <div className="flex h-[calc(100dvh-12.5rem)] min-h-72 flex-col">
      <div
        ref={scroller}
        className="flex flex-1 cursor-grab select-none flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        onPointerDown={(event) => {
          // 마우스 왼쪽 버튼만 끌기로 받는다.
          if (event.pointerType !== "mouse" || event.button !== 0 || !scroller.current) return;
          drag.current = { startY: event.clientY, startTop: scroller.current.scrollTop, moved: false };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state || !scroller.current) return;
          const dy = event.clientY - state.startY;
          if (!state.moved && Math.abs(dy) > 4) {
            state.moved = true;
            // 끌기가 시작된 뒤에만 포인터를 잡아, 빨리 끌어 더미 밖으로 나가도 끊기지 않게 한다.
            // 그냥 클릭할 때는 잡지 않아야 책 링크가 열린다.
            scroller.current.setPointerCapture(event.pointerId);
          }
          if (state.moved) scroller.current.scrollTop = state.startTop - dy;
        }}
        onPointerUp={(event) => {
          if (scroller.current?.hasPointerCapture(event.pointerId)) {
            scroller.current.releasePointerCapture(event.pointerId);
          }
          // 끌기가 끝난 직후의 클릭이 책을 열지 않도록 한 박자 뒤에 지운다.
          setTimeout(() => (drag.current = null));
        }}
        onPointerCancel={() => (drag.current = null)}
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
