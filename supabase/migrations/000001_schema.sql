-- 奶茶派对 · 核心数据库迁移
-- 7 张核心表 + 枚举 + 索引 + 触发器 + RLS

-- ============================================================
-- 1. 枚举类型
-- ============================================================

create type drink_category as enum (
  'milk_tea',    -- 奶茶
  'fruit_tea',   -- 果茶
  'cheese_tea',  -- 芝士茶/奶盖
  'pure_tea',    -- 纯茶
  'smoothie',    -- 冰沙
  'other'        -- 其他
);

create type sugar_level as enum ('0%','30%','50%','70%','100%');
create type ice_level   as enum ('no_ice','less_ice','normal_ice','extra_ice');
create type drink_size  as enum ('small','medium','large');

-- ============================================================
-- 2. 核心表（按依赖顺序创建）
-- ============================================================

-- 2a. brands — 奶茶品牌（无依赖，先创建）
create table brands (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  logo_url    text,
  description text,
  drink_count int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2b. drinks — 具体饮品（依赖 brands）
create table drinks (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references brands(id) on delete cascade,
  name        text not null,
  description text,
  image_url   text,
  category    drink_category default 'other',
  base_price  numeric(10,2),
  is_seasonal bool default false,
  is_active   bool default true,
  avg_rating  numeric(3,2),
  review_count int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(brand_id, name)
);

-- 2c. toppings — 小料目录（无依赖）
create table toppings (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null,
  icon       text,
  created_at timestamptz default now()
);

-- 2d. profiles — 用户档案（依赖 brands）
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  username          text unique not null,
  display_name      text,
  avatar_url        text,
  bio               text,
  favorite_brand_id uuid references brands(id) on delete set null,
  total_drinks      int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 2e. records — 打卡记录（依赖 profiles, drinks, brands）
create table records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  drink_id     uuid not null references drinks(id) on delete restrict,
  brand_id     uuid not null references brands(id) on delete restrict,
  rating       int check (rating >= 1 and rating <= 5),
  note         text,
  location     text,
  drank_at     date default current_date,
  sugar_level  sugar_level,
  ice_level    ice_level,
  size         drink_size default 'medium',
  price_paid   numeric(10,2),
  is_public    bool default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 2f. record_toppings — 记录与小料多对多（依赖 records, toppings）
create table record_toppings (
  record_id  uuid not null references records(id) on delete cascade,
  topping_id uuid not null references toppings(id) on delete restrict,
  primary key (record_id, topping_id)
);

-- 2g. reviews — 饮品评价（依赖 profiles, drinks）
create table reviews (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references profiles(id) on delete cascade,
  drink_id  uuid not null references drinks(id) on delete cascade,
  rating    int not null check (rating >= 1 and rating <= 5),
  content   text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, drink_id)
);

-- ============================================================
-- 3. 索引
-- ============================================================

-- records
create index idx_records_user_drank on records(user_id, drank_at desc);
create index idx_records_drink_id   on records(drink_id);
create index idx_records_brand_id   on records(brand_id);
create index idx_records_drank_at   on records(drank_at desc);
create index idx_records_public     on records(created_at desc) where is_public = true;

-- drinks
create index idx_drinks_brand    on drinks(brand_id);
create index idx_drinks_rating   on drinks(avg_rating desc nulls last);
create index idx_drinks_category on drinks(category);

-- reviews
create index idx_reviews_drink on reviews(drink_id);
create index idx_reviews_user  on reviews(user_id);

-- profiles
create index idx_profiles_username on profiles(username);

-- ============================================================
-- 4. 触发器 — 自动维护冗余计数
-- ============================================================

-- 4a. 新用户注册 → 自动创建 profile
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', '奶茶新友')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4b. review 变更 → 更新 drinks 评分
create or replace function update_drink_stats()
returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    update drinks
    set avg_rating = (
      select round(avg(rating)::numeric, 2) from reviews where drink_id = old.drink_id
    ),
    review_count = (
      select count(*) from reviews where drink_id = old.drink_id
    )
    where id = old.drink_id;
    return old;
  else
    update drinks
    set avg_rating = (
      select round(avg(rating)::numeric, 2) from reviews where drink_id = new.drink_id
    ),
    review_count = (
      select count(*) from reviews where drink_id = new.drink_id
    )
    where id = new.drink_id;
    return new;
  end if;
end;
$$ language plpgsql security definer;

create or replace trigger trg_update_drink_stats
  after insert or update or delete on reviews
  for each row execute function update_drink_stats();

-- 4c. drink 变更 → 更新 brands 饮品数量
create or replace function update_brand_drink_count()
returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    update brands set drink_count = (select count(*) from drinks where brand_id = old.brand_id)
    where id = old.brand_id;
    return old;
  else
    update brands set drink_count = (select count(*) from drinks where brand_id = new.brand_id)
    where id = new.brand_id;
    return new;
  end if;
end;
$$ language plpgsql security definer;

create or replace trigger trg_update_brand_drink_count
  after insert or delete on drinks
  for each row execute function update_brand_drink_count();

-- 4d. record 变更 → 更新用户饮品总数
create or replace function update_user_total_drinks()
returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    update profiles set total_drinks = (select count(*) from records where user_id = old.user_id)
    where id = old.user_id;
    return old;
  else
    update profiles set total_drinks = (select count(*) from records where user_id = new.user_id)
    where id = new.user_id;
    return new;
  end if;
end;
$$ language plpgsql security definer;

create or replace trigger trg_update_user_total_drinks
  after insert or delete on records
  for each row execute function update_user_total_drinks();

-- ============================================================
-- 5. RLS — 行级安全策略
-- ============================================================

alter table profiles enable row level security;
alter table brands enable row level security;
alter table drinks enable row level security;
alter table toppings enable row level security;
alter table records enable row level security;
alter table record_toppings enable row level security;
alter table reviews enable row level security;

-- profiles: 所有人可读，本人可写
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- brands: 所有人可读，仅 service_role 可写
create policy "brands_select" on brands for select using (true);
create policy "brands_insert" on brands for insert with check (auth.jwt() ->> 'role' = 'service_role');
create policy "brands_update" on brands for update using (auth.jwt() ->> 'role' = 'service_role');
create policy "brands_delete" on brands for delete using (auth.jwt() ->> 'role' = 'service_role');

-- drinks: 同上
create policy "drinks_select" on drinks for select using (true);
create policy "drinks_insert" on drinks for insert with check (auth.jwt() ->> 'role' = 'service_role');
create policy "drinks_update" on drinks for update using (auth.jwt() ->> 'role' = 'service_role');
create policy "drinks_delete" on drinks for delete using (auth.jwt() ->> 'role' = 'service_role');

-- toppings: 同上
create policy "toppings_select" on toppings for select using (true);
create policy "toppings_insert" on toppings for insert with check (auth.jwt() ->> 'role' = 'service_role');
create policy "toppings_update" on toppings for update using (auth.jwt() ->> 'role' = 'service_role');
create policy "toppings_delete" on toppings for delete using (auth.jwt() ->> 'role' = 'service_role');

-- records: 公开记录所有人可读，私密记录仅本人，仅本人可写
create policy "records_select_public" on records for select using (is_public = true);
create policy "records_select_own"   on records for select using (auth.uid() = user_id);
create policy "records_insert"       on records for insert with check (auth.uid() = user_id);
create policy "records_update"       on records for update using (auth.uid() = user_id);
create policy "records_delete"       on records for delete using (auth.uid() = user_id);

-- record_toppings: 跟随 record 的可见性
create policy "record_toppings_select" on record_toppings for select using (
  exists (select 1 from records where id = record_id and (is_public = true or user_id = auth.uid()))
);
create policy "record_toppings_insert" on record_toppings for insert with check (
  exists (select 1 from records where id = record_id and user_id = auth.uid())
);
create policy "record_toppings_delete" on record_toppings for delete using (
  exists (select 1 from records where id = record_id and user_id = auth.uid())
);

-- reviews: 所有人可读，本人可写
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update" on reviews for update using (auth.uid() = user_id);
create policy "reviews_delete" on reviews for delete using (auth.uid() = user_id);
