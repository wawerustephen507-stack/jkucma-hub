import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ijqvkeqgfpfeeyprhqwe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcXZrZXFnZnBmZWV5cHJocXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODc0ODUsImV4cCI6MjA4ODQ2MzQ4NX0.d90iMEbBTXmsVM7vfnhDpjECHuQBdgN8YuOYJGxB3e8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);