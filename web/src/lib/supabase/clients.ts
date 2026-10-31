/**
 * @fileoverview Creates Supabase clients. The single place that reads the
 * Supabase environment variables.
 *
 * Why this exists: both `lib/data/` (database) and `lib/auth/` (sign-in)
 * use Supabase. Sharing client creation here keeps keys and cookie handling
 * in one file. Only `lib/data/supabase-*` and `lib/auth/supabase-*` may
 * import this folder (docs/CONVENTIONS.md, section 8).
 *
 * Server only.
 */

import {createServerClient} from '@supabase/ssr';
import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
import type {NextRequest, NextResponse} from 'next/server';

/** Returns the Supabase URL and publishable key, or throws a helpful error. */
function readConfig(): {url: string; key: string} {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY. See docs/HOW-TO.md (Supabase).',
    );
  }
  return {url, key};
}

/** Reused across requests: public reads do not depend on who is asking. */
let publicClient: SupabaseClient | null = null;

/**
 * Client without a user session, for public data (the catalog). Not tied
 * to a request, so its results are the same for every visitor.
 */
export function getPublicClient(): SupabaseClient {
  if (publicClient) return publicClient;
  const {url, key} = readConfig();
  publicClient = createClient(url, key, {auth: {persistSession: false}});
  return publicClient;
}

/**
 * Client acting as the signed-in user of the current request (session read
 * from cookies). Row Level Security then limits it to that user's data.
 */
export async function getRequestClient(): Promise<SupabaseClient> {
  const {url, key} = readConfig();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const {name, value, options} of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies. Safe to ignore: the proxy
          // (src/proxy.ts) refreshes the session cookie on every request.
        }
      },
    },
  });
}

/**
 * Refreshes the session cookie for an incoming request. Called by
 * `src/proxy.ts` before every page, so sessions do not expire mid-visit.
 */
export async function refreshSessionCookies(
  request: NextRequest,
  makeResponse: () => NextResponse,
): Promise<NextResponse> {
  const {url, key} = readConfig();
  let response = makeResponse();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Update the request (for the page about to render) and the response
        // (for the browser), as @supabase/ssr requires.
        for (const {name, value} of cookiesToSet) request.cookies.set(name, value);
        response = makeResponse();
        for (const {name, value, options} of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [header, value] of Object.entries(headers)) {
          response.headers.set(header, value);
        }
      },
    },
  });
  // getClaims() validates the token and triggers a refresh when needed.
  await supabase.auth.getClaims();
  return response;
}
