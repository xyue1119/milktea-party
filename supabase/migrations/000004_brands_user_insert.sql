-- 允许认证用户创建品牌
grant insert on public.brands to authenticated;

-- 更新 brands 的 RLS，允许用户新建品牌
drop policy if exists "brands_insert" on brands;
create policy "brands_insert" on brands for insert with check (auth.role() = 'authenticated');
