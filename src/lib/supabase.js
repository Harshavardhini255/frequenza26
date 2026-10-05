import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uonbntkleydlqjcfnzkq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bx93-0H55vkZKeYVImSMPw_roJo3aTd";

export const supabaseUrl = SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_ANON_KEY;
export const isSupabaseEnabled = !!SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
