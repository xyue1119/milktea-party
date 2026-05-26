-- profiles 表权限修复
grant all on table profiles to authenticated;
grant select on table profiles to anon;
