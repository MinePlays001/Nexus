import { supabase } from './supabase'

export type Category = {
  id: string
  name: string
  image: string
  created_at: string
}

export type Product = {
  id: string
  category_id: string
  title: string
  description: string
  price: number
  stock: number
  image: string
  created_at: string
}

export type Order = {
  id: string
  buyer_email: string
  buyer_name: string
  items: { id: string; title: string; price: number }[]
  total: number
  transaction_id: string
  status: 'pending' | 'paid' | 'rejected'
  account_details?: string
  reject_reason?: string
  created_at: string
}

export type Settings = {
  jazzcash_number: string
  jazzcash_name: string
  site_name: string
  banner_title: string
  banner_subtitle: string
}

// ─── Local fallback ───────────────────────────────────────────────
const L = {
  get: <T>(k: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem('nv2_' + k)!) ?? fallback } catch { return fallback } },
  set: (k: string, v: unknown) => localStorage.setItem('nv2_' + k, JSON.stringify(v)),
}

function initLocal() {
  if (!L.get('settings', null)) {
    L.set('settings', {
      jazzcash_number: '03238581603',
      jazzcash_name: 'Shamim Akhtar',
      site_name: 'NexusVault',
      banner_title: 'Premium Digital Accounts',
      banner_subtitle: 'Instant delivery of verified Steam, Roblox, and Minecraft accounts',
    } satisfies Settings)
  }
  if (!L.get('categories', null)) {
    L.set('categories', [
      { id: 'c1', name: 'Steam', image: 'https://picsum.photos/seed/steam99/400/250', created_at: new Date().toISOString() },
      { id: 'c2', name: 'Roblox', image: 'https://picsum.photos/seed/roblox11/400/250', created_at: new Date().toISOString() },
      { id: 'c3', name: 'Minecraft', image: 'https://picsum.photos/seed/mccraft/400/250', created_at: new Date().toISOString() },
    ] satisfies Category[])
  }
  if (!L.get('products', null)) {
    L.set('products', [
      { id: 'p1', category_id: 'c1', title: 'Steam Account – GTA V', description: 'Full access Steam account with GTA V installed. Email included.', price: 799, stock: 10, image: 'https://picsum.photos/seed/steam-gtav/400/300', created_at: new Date().toISOString() },
      { id: 'p2', category_id: 'c1', title: 'Steam Account – CS2 Prime', description: 'CS2 Prime Status account ready for competitive play.', price: 1499, stock: 5, image: 'https://picsum.photos/seed/steam-cs2/400/300', created_at: new Date().toISOString() },
      { id: 'p3', category_id: 'c2', title: 'Roblox Account – 10k Robux', description: 'Account with 10,000 Robux balance. Email access included.', price: 899, stock: 8, image: 'https://picsum.photos/seed/roblox-robux/400/300', created_at: new Date().toISOString() },
      { id: 'p4', category_id: 'c2', title: 'Roblox Premium Account', description: 'Roblox Premium subscription active. Rare items included.', price: 599, stock: 12, image: 'https://picsum.photos/seed/roblox-prem/400/300', created_at: new Date().toISOString() },
      { id: 'p5', category_id: 'c3', title: 'Minecraft Java Full Access', description: 'Full access Minecraft Java account. Change skin & settings freely.', price: 499, stock: 15, image: 'https://picsum.photos/seed/mc-java/400/300', created_at: new Date().toISOString() },
      { id: 'p6', category_id: 'c3', title: 'Minecraft Hypixel Level 50+', description: 'Leveled Hypixel account. Great for Bedwars and Skywars.', price: 1299, stock: 3, image: 'https://picsum.photos/seed/mc-hypixel/400/300', created_at: new Date().toISOString() },
    ] satisfies Product[])
  }
  if (!L.get('orders', null)) L.set('orders', [])
}

initLocal()

// ─── Settings ─────────────────────────────────────────────────────
export async function getSettings(): Promise<Settings> {
  try {
    const { data } = await supabase.from('settings').select('*').single()
    if (data) return data
  } catch {}
  return L.get('settings', {} as Settings)
}

export async function updateSettings(s: Settings) {
  L.set('settings', s)
  try {
    const { data: ex } = await supabase.from('settings').select('id').single()
    if (ex) await supabase.from('settings').update(s).eq('id', ex.id)
    else await supabase.from('settings').insert([{ ...s, id: 'main' }])
  } catch {}
}

// ─── Categories ───────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await supabase.from('categories').select('*').order('created_at')
    if (data?.length) { L.set('categories', data); return data }
  } catch {}
  return L.get<Category[]>('categories', [])
}

export async function createCategory(c: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const item: Category = { ...c, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  try {
    const { data } = await supabase.from('categories').insert([item]).select()
    if (data?.[0]) { const arr = L.get<Category[]>('categories', []); arr.unshift(data[0]); L.set('categories', arr); return data[0] }
  } catch {}
  const arr = L.get<Category[]>('categories', []); arr.unshift(item); L.set('categories', arr); return item
}

export async function editCategory(id: string, u: Partial<Category>) {
  try { await supabase.from('categories').update(u).eq('id', id) } catch {}
  const arr = L.get<Category[]>('categories', [])
  const i = arr.findIndex(c => c.id === id); if (i >= 0) { arr[i] = { ...arr[i], ...u }; L.set('categories', arr) }
}

export async function removeCategory(id: string) {
  try { await supabase.from('categories').delete().eq('id', id) } catch {}
  L.set('categories', L.get<Category[]>('categories', []).filter(c => c.id !== id))
}

// ─── Products ─────────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  try {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data?.length) { L.set('products', data); return data }
  } catch {}
  return L.get<Product[]>('products', [])
}

export async function createProduct(p: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const item: Product = { ...p, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  try {
    const { data } = await supabase.from('products').insert([item]).select()
    if (data?.[0]) { const arr = L.get<Product[]>('products', []); arr.unshift(data[0]); L.set('products', arr); return data[0] }
  } catch {}
  const arr = L.get<Product[]>('products', []); arr.unshift(item); L.set('products', arr); return item
}

export async function editProduct(id: string, u: Partial<Product>) {
  try { await supabase.from('products').update(u).eq('id', id) } catch {}
  const arr = L.get<Product[]>('products', [])
  const i = arr.findIndex(p => p.id === id); if (i >= 0) { arr[i] = { ...arr[i], ...u }; L.set('products', arr) }
}

export async function removeProduct(id: string) {
  try { await supabase.from('products').delete().eq('id', id) } catch {}
  L.set('products', L.get<Product[]>('products', []).filter(p => p.id !== id))
}

// ─── Orders ───────────────────────────────────────────────────────
export async function getOrders(): Promise<Order[]> {
  try {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data?.length) { L.set('orders', data); return data }
  } catch {}
  return L.get<Order[]>('orders', [])
}

export async function createOrder(o: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
  const item: Order = { ...o, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  try {
    const { data } = await supabase.from('orders').insert([item]).select()
    if (data?.[0]) { const arr = L.get<Order[]>('orders', []); arr.unshift(data[0]); L.set('orders', arr); return data[0] }
  } catch {}
  const arr = L.get<Order[]>('orders', []); arr.unshift(item); L.set('orders', arr); return item
}

export async function updateOrderStatus(id: string, u: Partial<Order>) {
  try { await supabase.from('orders').update(u).eq('id', id) } catch {}
  const arr = L.get<Order[]>('orders', [])
  const i = arr.findIndex(o => o.id === id); if (i >= 0) { arr[i] = { ...arr[i], ...u }; L.set('orders', arr) }
}

// ─── Auth ─────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: name } }
  })
  if (error) throw error
  return data.user
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}
