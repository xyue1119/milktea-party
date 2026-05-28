-- 新增煲珠公、比星咖啡
insert into brands (name, description) values
  ('煲珠公', '珍珠奶茶专门店，黑糖珍珠封神'),
  ('比星咖啡', '精品咖啡连锁，性价比之王')
on conflict (name) do nothing;
