import { createClient } from '@supabase/supabase-js'

// Replace these with your own Supabase project values
// Found in: Supabase Dashboard → Settings → API
export const SUPABASE_URL = 'https://qauauoigtvwoictiofia.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdWF1b2lndHZ3b2ljdGlvZmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzYxMDQsImV4cCI6MjA5MTMxMjEwNH0.idiTK0wWnElwgfUsN11mbvRKCFoEtYAhDBupCcnmhy8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin credentials (stored locally — never expose secret keys in frontend)
export const ADMIN_USERNAME = 'Furqan'
export const ADMIN_PASSWORD = 'Muggy122%%'
