-- 点赞表（评价 + 未来可扩展记录点赞）

create table if not exists likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  review_id  uuid references reviews(id) on delete cascade,
  record_id  uuid references records(id) on delete cascade,
  created_at timestamptz default now(),
  check (review_id is not null or record_id is not null)
);

-- 每人每目标只能点赞一次
create unique index if not exists idx_likes_user_review on likes(user_id, review_id) where review_id is not null;
create unique index if not exists idx_likes_user_record on likes(user_id, record_id) where record_id is not null;

alter table likes enable row level security;

-- 所有人可读
create policy "likes_select" on likes for select using (true);

-- 登录用户可点赞
create policy "likes_insert" on likes for insert with check (auth.uid() = user_id);

-- 本人可取消赞
create policy "likes_delete" on likes for delete using (auth.uid() = user_id);
