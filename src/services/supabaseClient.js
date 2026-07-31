import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const defaultSupabaseUrl = 'https://vhujcpjrlknpldpfhkqf.supabase.co';
const defaultSupabasePublishableKey = 'sb_publishable_sybF5LOOdPfWLASYtm9bww_CZUUUG2Z';

if (!supabaseUrl || !supabasePublishableKey) {
  console.info('IsiVoltPro usa la configuración pública del proyecto de producción. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY para otro entorno.');
}

export const supabase = createClient(
  supabaseUrl || defaultSupabaseUrl,
  supabasePublishableKey || defaultSupabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.sessionStorage
    }
  }
);
