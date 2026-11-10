/**
 * @fileoverview Admin-only link to a trainer's certificate file. Re-checks
 * the admin flag, then redirects to a 10-minute signed Supabase URL.
 *
 * A plain <a target="_blank"> (not a server-action form), so the signed link
 * never enters the admin page's history and cannot navigate it away.
 *
 * Server only.
 */

import {notFound, redirect} from 'next/navigation';
import {getAdminRepository} from '@/lib/data/admin-repository';
import {getViewer} from '@/lib/viewer';

/** GET /admin/file/[userId] */
export async function GET(
  _request: Request,
  {params}: {params: Promise<{userId: string}>},
): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect('/sign-in?next=/admin');
  if (!viewer.isAdmin) notFound();

  const {userId} = await params;
  const url = await getAdminRepository().getCertificationUrl(userId);
  if (!url) redirect('/admin?file=missing');
  redirect(url);
}
