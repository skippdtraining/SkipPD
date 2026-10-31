/**
 * @fileoverview {@link ProfileRepository} backed by Supabase: the
 * `profiles`, `trainer_profiles` and `school_profiles` tables and the
 * private `certifications` storage bucket (supabase/migrations/0002, 0003).
 *
 * The only file that knows profile column names. It joins the common row
 * with the trainer or school row into the app's single `Profile` type. Review columns
 * (certification_status, school_status) are read here but never written:
 * the database does not let users change them.
 *
 * Server only.
 */

import type {SupabaseClient} from '@supabase/supabase-js';
import {getRequestClient} from '@/lib/supabase/clients';
import type {AccountRole, Profile, ReviewStatus} from '../types';
import type {ProfileRepository} from './profile-repository';

/** Trainer-only columns (`public.trainer_profiles`). */
interface TrainerRow {
  credentials: string;
  is_employed: boolean;
  employer: string;
  bio: string;
  certification_path: string | null;
  certification_status: string;
  license_state: string;
  license_number: string;
  license_status: string;
}

/** School-only columns (`public.school_profiles`). */
interface SchoolRow {
  school_name: string;
  contact_position: string;
  is_likely_school_email: boolean;
  school_status: string;
}

/** A `profiles` row with its one-to-one detail row embedded (null if none). */
interface ProfileRow {
  role: string;
  full_name: string;
  email: string;
  trainer_profiles: TrainerRow | null;
  school_profiles: SchoolRow | null;
}

const PROFILE_COLUMNS =
  'role, full_name, email, ' +
  'trainer_profiles(credentials, is_employed, employer, bio, certification_path, ' +
  'certification_status, license_state, license_number, license_status), ' +
  'school_profiles(school_name, contact_position, is_likely_school_email, school_status)';

const CERTIFICATION_BUCKET = 'certifications';

/** Converts the joined rows into the app's flat {@link Profile} type. */
function toProfile(row: ProfileRow): Profile {
  const trainer = row.trainer_profiles;
  const school = row.school_profiles;
  return {
    // Safe: the tables' CHECK constraints only allow these values.
    role: row.role as AccountRole,
    certificationStatus: (trainer?.certification_status ?? 'none') as ReviewStatus,
    schoolStatus: (school?.school_status ?? 'none') as ReviewStatus,
    fullName: row.full_name,
    email: row.email,
    credentials: trainer?.credentials ?? '',
    licenseState: trainer?.license_state ?? '',
    licenseNumber: trainer?.license_number ?? '',
    licenseStatus: (trainer?.license_status ?? 'none') as ReviewStatus,
    isEmployed: trainer ? trainer.is_employed : null,
    employer: trainer?.employer ?? '',
    bio: trainer?.bio ?? '',
    hasCertification: Boolean(trainer?.certification_path),
    schoolName: school?.school_name ?? '',
    contactPosition: school?.contact_position ?? '',
    isLikelySchoolEmail: school?.is_likely_school_email ?? false,
  };
}

/**
 * Inserts the row if the user has none in `table`, otherwise updates it.
 * (Not an upsert: users may not update the `id` column.)
 */
async function saveOwnRow(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  values: Record<string, unknown>,
): Promise<void> {
  const {data: existing} = await supabase
    .from(table)
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  const {error} = existing
    ? await supabase.from(table).update(values).eq('id', userId)
    : await supabase.from(table).insert({id: userId, ...values});
  if (error) throw new Error(`Could not save ${table}: ${error.message}`);
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
      const {data: existing} = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .returns<{role: string}[]>()
        .maybeSingle();
      // The account type is set once, on insert; it never changes.
      const role = existing?.role ?? input.role;
      await saveOwnRow(
        supabase,
        'profiles',
        userId,
        existing ? {full_name: input.fullName} : {role, full_name: input.fullName},
      );
      if (role === 'trainer') {
        await saveOwnRow(supabase, 'trainer_profiles', userId, {
          credentials: input.credentials,
          license_state: input.licenseState,
          license_number: input.licenseNumber,
          is_employed: input.isEmployed ?? false,
          employer: input.employer,
          bio: input.bio,
        });
      } else {
        await saveOwnRow(supabase, 'school_profiles', userId, {
          school_name: input.schoolName,
          contact_position: input.contactPosition,
        });
      }
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
        .from('trainer_profiles')
        .update({certification_path: path})
        .eq('id', userId);
      if (error) throw new Error(`Could not attach certification: ${error.message}`);
    },
  };
}
