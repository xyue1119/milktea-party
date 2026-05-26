-- 评论表 — 记录评论 + 评价回复

create table comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  record_id  uuid references records(id) on delete cascade,
  review_id  uuid references reviews(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now(),
  check (record_id is not null or review_id is not null)
);

create index idx_comments_record on comments(record_id, created_at) where record_id is not null;
create index idx_comments_review on comments(review_id, created_at) where review_id is not null;
create index idx_comments_user   on comments(user_id);

alter table comments enable row level security;

-- 公开记录评论所有人可读
create policy "comments_select" on comments for select using (
  record_id is not null
  and exists (select 1 from records where id = record_id and is_public = true)
);

-- 自己记录的评论始终可读（含私密记录）
create policy "comments_select_own" on comments for select using (
  record_id is not null
  and exists (select 1 from records where id = record_id and user_id = auth.uid())
);

-- 评价回复所有人可读
create policy "comments_select_review" on comments for select using (
  review_id is not null
);

-- 登录用户可评论
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);

-- 本人可删评
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);
