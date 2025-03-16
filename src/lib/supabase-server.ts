import { createServerClient } from '@supabase/ssr';

// This is a simplified version that doesn't use cookies directly
// It's meant to be used in server components where cookie handling is not needed
export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
} 