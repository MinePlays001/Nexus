# NexusVault — Digital Accounts Marketplace

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Supabase Setup
You need to create these tables in your Supabase project (Settings → SQL Editor):

```sql
-- Settings table
create table settings (
  id text primary key default 'main',
  site_name text default 'NexusVault',
  banner_title text,
  banner_subtitle text,
  jazzcash_number text default '03238581603',
  jazzcash_name text default 'Shamim Akhtar'
);

-- Categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text,
  created_at timestamptz default now()
);

-- Products table
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  title text not null,
  description text,
  price integer not null,
  stock integer default 0,
  image text,
  created_at timestamptz default now()
);

-- Orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_email text not null,
  buyer_name text,
  items jsonb,
  total integer,
  transaction_id text,
  status text default 'pending',
  account_details text,
  reject_reason text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow anon read/write for demo)
alter table settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

create policy "public_all" on settings for all using (true) with check (true);
create policy "public_all" on categories for all using (true) with check (true);
create policy "public_all" on products for all using (true) with check (true);
create policy "public_all" on orders for all using (true) with check (true);
```

> **Note:** The anon key used in `src/lib/supabase.ts` is the **public anon key** — safe to use in frontend. Never use your service_role key in frontend code.

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Netlify
- Build command: `vite build`
- Publish directory: `dist/client`

---

## Admin Login
- URL: `/admin/login`
- Username: `Furqan`
- Password: `Muggy122%%`

## Buyer Flow
1. Buyer browses → adds to cart → must login to checkout
2. Pays via JazzCash to 03238581603 (Shamim Akhtar)
3. Enters Transaction ID → submits order
4. Admin marks as paid + enters account details
5. Buyer sees account details in My Orders page + email
