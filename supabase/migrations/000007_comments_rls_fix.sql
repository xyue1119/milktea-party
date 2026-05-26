-- 修复：000005 因 table already exists 失败，RLS 和多数策略未创建
-- 补全 comments 表的 RLS 和缺失策略

-- 确保 authenticated 角色有表权限
grant all on table comments to authenticated;
grant all on table comments to anon;

alter table comments enable row level security;

-- 公开记录评论所有人可读
drop policy if exists "comments_select" on comments;
create policy "comments_select" on comments for select using (
  record_id is not null
  and exists (select 1 from records where id = record_id and is_public = true)
);

-- 自己记录的评论始终可读（含私密记录）
drop policy if exists "comments_select_own" on comments;
create policy "comments_select_own" on comments for select using (
  record_id is not null
  and exists (select 1 from records where id = record_id and user_id = auth.uid())
);

-- 登录用户可评论
drop policy if exists "comments_insert" on comments;
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);

-- 本人可删评
drop policy if exists "comments_delete" on comments;
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);
