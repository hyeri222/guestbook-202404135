-- 독서 기록장 스키마. Neon 콘솔의 SQL Editor에서 한 번 실행한다.
-- 규칙의 1차 검사는 책 규칙 모듈(lib/books/rules.ts)이 하고, 아래 CHECK 제약은 2차 방어선이다.

create table if not exists books (
  id bigint generated always as identity primary key,
  title text not null check (length(btrim(title)) > 0),
  author text,
  -- 중복 판정 키: 공백과 영문 대소문자를 무시한 제목 + 저자
  normalized_key text not null unique,
  status text not null default 'want_to_read'
    check (status in ('want_to_read', 'reading', 'finished')),
  rating numeric(2, 1)
    check (rating between 0.5 and 5.0 and mod(rating * 2, 1) = 0),
  review text check (char_length(review) <= 2000),
  started_on date,
  finished_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 다 읽은 책에는 평점과 다 읽은 날이 있어야 한다.
  check (status <> 'finished' or (rating is not null and finished_on is not null)),
  -- 다 읽은 날은 시작한 날보다 이를 수 없다. 재독 중에는 이전 다 읽은 날이 남아 있으므로 다 읽음일 때만 검사한다.
  check (status <> 'finished' or started_on is null or finished_on >= started_on)
);
