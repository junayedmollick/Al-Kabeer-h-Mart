import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseServiceKey.includes('your-supabase')
);

export const supabaseAdmin = isSupabaseAdminConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
