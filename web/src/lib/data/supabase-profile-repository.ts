/**
 * @fileoverview {@link ProfileRepository} backed by Supabase: the
 * `profiles` table and the private `certifications` storage bucket
 * (supabase/migrations/0002_accounts.sql).
 *
 * The only file that knows profile column names. Review columns
 * (certification_status, school_status) are read here but never written:
 * the database does not let users change them.
 *
 * Server only.
 */

import type {SupabaseClient} from '@supabase/supabase-js';
import {getRequestClient} from '@/lib/supabase/clients';
import type {AccountRole, Profile, ReviewStatus} from '../types';
import type {ProfileRepository} from './profile-repository';

/** Columns read from `public.profiles`, in database naming. */
interface ProfileRow {
  role: string;
  full_name: string;
  email: string;
  credentials: string;
  is_employed: boolean | null;
  employer: string;
  bio: string;
  certification_path: string | null;
  certification_status: string;
  school_name: string;
  contact_position: string;
  is_likely_school_email: boolean;
  school_status: string;
}

const PROFILE_COLUMNS =
  'role, full_name, email, credentials, is_employed, employer, bio, certification_path, ' +
  'certification_status, school_name, contact_position, is_likely_school_email, school_status';

const CERTIFICATION_BUCKET = 'certifications';

/** Converts a database row into the app's {@link Profile} type. */
function toProfile(row: ProfileRow): Profile {
  return {
    // Safe: the table's CHECK constraints only allow these values.
    role: row.role as AccountRole,
    certificationStatus: row.certification_status as ReviewStatus,
    schoolStatus: row.school_status as ReviewStatus,
    fullName: row.full_name,
    email: row.email,
    credentials: row.credentials,
    isEmployed: row.is_employed,
    employer: row.employer,
    bio: row.bio,
    hasCertification: row.certification_path !== null,
    schoolName: row.school_name,
    contactPosition: row.contact_position,
    isLikelySchoolEmail: row.is_likely_school_email,
  };
}

/** Returns the request client and the signed-in user's id, or throws. */
async function requireUser(): Promise<{supabase: SupabaseClient; userId: string}> {
  const supabase = await getRequestClient();
  const {data} = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not signed in.');
  return {supabase, userId: data.user.id};
}

/** Keeps letters, digits, dots, dashes and underscores, so paths stay valid. */
function safeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(-80);
}

/** Profile repository acting as the signed-in user. */
export function createSupabaseProfileRepository(): ProfileRepository {
  return {
    async getMyProfile() {
      const supabase = await getRequestClient();
      const {data: userData} = await supabase.auth.getUser();
      if (!userData.user) return null;
      const {data, error} = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userData.user.id)
        .returns<ProfileRow[]>()
        .maybeSingle();
      if (error) throw new Error(`Could not load profile: ${error.message}`);
      return data ? toProfile(data) : null;
    },

    async saveMyProfile(input) {
      const {supabase, userId} = await requireUser();
      const editable = {
        full_name: input.fullName,
        credentials: input.credentials,
        is_employed: input.isEmployed,
        employer: input.employer,
        bio: input.bio,
        school_name: input.schoolName,
        contact_position: input.contactPosition,
      };
      const {data: existing} = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      // Insert vs update: users may set `role` only once, on insert.
      const {error} = existing
        ? await supabase.from('profiles').update(editable).eq('id', userId)
        : await supabase
            .from('profiles')
            .insert({id: userId, role: input.role, ...editable});
      if (error) throw new Error(`Could not save profile: ${error.message}`);
    },

    async uploadMyCertification(file) {
      const {supabase, userId} = await requireUser();
      // A new name per upload, so earlier files stay for the admin's records.
      const path = `${userId}/${Date.now()}-${safeFileName(file.name)}`;
      const upload = await supabase.storage
        .from(CERTIFICATION_BUCKET)
        .upload(path, file, {contentType: file.type});
      if (upload.error) {
        throw new Error(`Could not upload certification: ${upload.error.message}`);
      }
      const {error} = await supabase
        .from('profiles')
        .update({certification_path: path})
        .eq('id', userId);
      if (error) throw new Error(`Could not attach certification: ${error.message}`);
    },
  };
}
