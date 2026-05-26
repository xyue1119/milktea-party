-- 允许认证用户创建饮品（方案 A：打卡时搜不到就新建）
drop policy if exists "drinks_insert" on drinks;
create policy "drinks_insert" on drinks for insert with check (auth.role() = 'authenticated');
