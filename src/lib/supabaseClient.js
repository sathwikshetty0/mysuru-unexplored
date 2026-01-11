
import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// Note: In Vite, env variables must start with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not configured. Authentication will not work until you set up your .env file.');
    console.warn('📝 See .env.example for instructions.');
}

// Export null if not configured, otherwise create client
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

