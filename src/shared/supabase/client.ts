import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import type { Database } from './database.types';

// EXPO_PUBLIC_* values are inlined at build time, so they must be read with
// static property access. They are public by design: the publishable key
// only grants what the row level security policies allow.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Supabase não configurado: defina EXPO_PUBLIC_SUPABASE_URL e ' +
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env ' +
      '(veja supabase/README.md) e reinicie o Expo.',
  );
}

export const supabase = createClient<Database>(url, publishableKey, {
  auth: {
    // Session persisted in the device's SQLite-backed localStorage.
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Email links come back as ?code=..., exchanged on this same device.
    flowType: 'pkce',
  },
});

// Refresh tokens only while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') void supabase.auth.startAutoRefresh();
  else void supabase.auth.stopAutoRefresh();
});
