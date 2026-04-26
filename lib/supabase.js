import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Public client (used in frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with elevated permissions (used in API routes only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

// =============================================
// SUPABASE SETUP SQL
// Run this in your Supabase SQL Editor once:
// =============================================
//
// create table orders (
//   id uuid default gen_random_uuid() primary key,
//   reference text unique not null,
//   network text not null,
//   bundle_size text not null,
//   bundle_price text not null,
//   phone text not null,
//   recipient text,
//   payment_method text not null,
//   status text default 'pending',
//   created_at timestamp with time zone default now(),
//   updated_at timestamp with time zone default now()
// );
//
// -- Enable Row Level Security
// alter table orders enable row level security;
//
// -- Allow inserts from anyone (customers placing orders)
// create policy "Allow inserts" on orders for insert with check (true);
//
// -- Only allow reads/updates via service role (admin)
// create policy "Service role full access" on orders
//   using (auth.role() = 'service_role');
