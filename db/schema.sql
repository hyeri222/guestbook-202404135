-- 방명록 스키마. 글 비밀번호는 scrypt 해시로만 저장한다 (docs/adr/0001).
create table if not exists entries (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 20),
  message text not null check (char_length(btrim(message)) between 1 and 500),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
