import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Upload an image to the 'products' bucket and return the public CDN URL.
 */
export async function uploadProductImage(file, customName) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const fileName = customName ? `${customName}.${ext}` : `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * Upload an avatar to the 'avatars' bucket and return the public CDN URL.
 */
export async function uploadAvatarImage(userId, fileOrBlob) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const ext = 'jpg';
  const fileName = `${userId}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, fileOrBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/jpeg',
    });

  if (error) throw error;
  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
  return `${urlData.publicUrl}?t=${Date.now()}`;
}
