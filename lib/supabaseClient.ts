import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

/*
 * Creates a browser-based Supabase client that works seamlessly with the
 * Auth Helpers library. It reads the Supabase URL and anon key from
 * environment variables prefixed with `NEXT_PUBLIC_`. Make sure to define
 * NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your
 * `.env.local` file when running the application locally.
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);