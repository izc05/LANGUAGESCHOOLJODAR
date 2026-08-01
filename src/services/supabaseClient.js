import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

export const backendConfiguration = {
  configured: Boolean(supabaseUrl && supabasePublishableKey),
  url: supabaseUrl || '',
  mode: import.meta.env.VITE_BACKEND_MODE || 'self-hosted'
};

if (!backendConfiguration.configured) {
  console.error(
    'IsiVoltPro Activos no tiene backend configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY durante el despliegue.'
  );
}

// Estos valores solo permiten construir y previsualizar la interfaz.
// No apuntan a Supabase Cloud y no permiten autenticar usuarios.
const unconfiguredUrl = 'http://127.0.0.1:8000';
const unconfiguredKey = 'isivoltpro-local-backend-not-configured';

export const supabase = createClient(
  supabaseUrl || unconfiguredUrl,
  supabasePublishableKey || unconfiguredKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.sessionStorage
    }
  }
);
