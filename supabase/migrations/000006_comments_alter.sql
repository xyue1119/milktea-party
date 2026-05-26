-- 扩展 comments 表，增加评价回复支持

-- 1. record_id 改为可空，新增 review_id
alter table comments alter column record_id drop not null;
alter table comments add column if not exists review_id uuid references reviews(id) on delete cascade;

-- 2. 检查约束：至少填一个
alter table comments add constraint comments_target_check check (record_id is not null or review_id is not null);

-- 3. 评价回复索引
create index if not exists idx_comments_review on comments(review_id, created_at) where review_id is not null;

-- 4. 评价回复可读策略
drop policy if exists "comments_select_review" on comments;
create policy "comments_select_review" on comments for select using (review_id is not null);
