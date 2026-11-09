/**
 * @fileoverview {@link AdminRepository} backed by Supabase
 * (supabase/migrations/0009_admin.sql).
 *
 * Acts as the signed-in admin: Row Level Security only lets admins read
 * other users' profiles and files, and `review_profile()` checks the admin
 * flag before changing anything.
 *
 * Server only.
 */

import {getRequestClient} from '@/lib/supabase/clients';
import type {ReviewRequest} from '../types';
import type {AdminRepository} from './admin-repository';

const CERTIFICATION_BUCKET = 'certifications';

/** How long a "View file" link works: 10 minutes. */
const FILE_LINK_SECONDS = 10 * 60;

/** Common columns embedded from `profiles`. */
interface OwnerRow {
  full_name: string;
  email: string;
}

/** `trainer_profiles` row with its owner, for the queue. */
interface TrainerQueueRow {
  id: string;
  credentials: string;
  is_employed: boolean;
  employer: string;
  certification_status: string;
  license_state: string;
  license_number: string;
  license_status: string;
  updated_at: string;
  profiles: OwnerRow | null;
}

/** `school_profiles` row with its owner, for the queue. */
interface SchoolQueueRow {
  id: string;
  school_name: string;
  contact_position: string;
  is_likely_school_email: boolean;
  updated_at: string;
  profiles: OwnerRow | null;
}

/** Turns one trainer row into the queue entries it needs (0, 1 or 2). */
function trainerRequests(row: TrainerQueueRow): ReviewRequest[] {
  const base = {
    userId: row.id,
    fullName: row.profiles?.full_name ?? '',
    email: row.profiles?.email ?? '',
    headline: row.credentials,
    isLikelySchoolEmail: false,
    updatedAt: row.updated_at,
  };
  const employment = row.is_employed
    ? `Works at ${row.employer}`
    : 'Not currently employed';
  const requests: ReviewRequest[] = [];
  if (row.certification_status === 'pending') {
    requests.push({...base, item: 'certification', details: [employment]});
  }
  if (row.license_status === 'pending') {
    requests.push({
      ...base,
      item: 'license',
      details: [`License: ${row.license_state} ${row.license_number}`, employment],
    });
  }
  return requests;
}

/** Turns one school row into its queue entry. */
function schoolRequest(row: SchoolQueueRow): ReviewRequest {
  return {
    userId: row.id,
    item: 'school',
    fullName: row.profiles?.full_name ?? '',
    email: row.profiles?.email ?? '',
    headline: row.school_name,
    details: [`Position: ${row.contact_position}`],
    isLikelySchoolEmail: row.is_likely_school_email,
    updatedAt: row.updated_at,
  };
}

/** Admin repository acting as the signed-in admin. */
export function createSupabaseAdminRepository(): AdminRepository {
  return {
    async isAdmin(userId) {
      const supabase = await getRequestClient();
      // Users can only see their own row, so this answers for them only.
      const {data, error} = await supabase
        .from('admins')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      // Log instead of failing: a broken check must not break every page,
      // but it should be visible when an admin is treated as a normal user.
      if (error) console.error(`Admin check failed: ${error.message}`);
      return data !== null;
    },

    async listPendingReviews() {
      const supabase = await getRequestClient();
      const [trainers, schools] = await Promise.all([
        supabase
          .from('trainer_profiles')
          .select(
            'id, credentials, is_employed, employer, certification_status, license_state, ' +
              'license_number, license_status, updated_at, profiles(full_name, email)',
          )
          .or('certification_status.eq.pending,license_status.eq.pending')
          .returns<TrainerQueueRow[]>(),
        supabase
          .from('school_profiles')
          .select(
            'id, school_name, contact_position, is_likely_school_email, updated_at, ' +
              'profiles(full_name, email)',
          )
          .eq('school_status', 'pending')
          .returns<SchoolQueueRow[]>(),
      ]);
      if (trainers.error)
        throw new Error(`Could not load trainers: ${trainers.error.message}`);
      if (schools.error)
        throw new Error(`Could not load schools: ${schools.error.message}`);
      return [
        ...trainers.data.flatMap(trainerRequests),
        ...schools.data.map(schoolRequest),
      ].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    },

    async review(userId, item, decision, reason) {
      const supabase = await getRequestClient();
      const {error} = await supabase.rpc('review_profile', {
        p_user: userId,
        p_item: item,
        p_decision: decision,
        p_reason: reason,
      });
      if (error) throw new Error(`Could not save review: ${error.message}`);
    },

    async getCertificationUrl(userId) {
      const supabase = await getRequestClient();
      const {data: row} = await supabase
        .from('trainer_profiles')
        .select('certification_path')
        .eq('id', userId)
        .returns<{certification_path: string | null}[]>()
        .maybeSingle();
      if (!row?.certification_path) return null;
      const {data, error} = await supabase.storage
        .from(CERTIFICATION_BUCKET)
        .createSignedUrl(row.certification_path, FILE_LINK_SECONDS);
      if (error) throw new Error(`Could not create file link: ${error.message}`);
      return data.signedUrl;
    },
  };
}
