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
  ever_approved: boolean;
  license_state: string;
  license_number: string;
  license_status: string;
  certification_reason: string;
  license_reason: string;
}

/** School-only columns (`public.school_profiles`). */
interface SchoolRow {
  school_name: string;
  contact_position: string;
  is_likely_school_email: boolean;
  school_status: string;
  ever_approved: boolean;
  school_reason: string;
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
  'certification_status, ever_approved, license_state, license_number, license_status, certification_reason, license_reason), ' +
  'school_profiles(school_name, contact_position, is_likely_school_email, school_status, ever_approved, school_reason)';

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
    wasEverApproved: Boolean(trainer?.ever_approved || school?.ever_approved),
    certificationReason: trainer?.certification_reason ?? '',
    licenseReason: trainer?.license_reason ?? '',
    schoolReason: school?.school_reason ?? '',
  };
}

/** Most files listed per Storage request (the API caps a page at 100). */
const LIST_PAGE_SIZE = 100;

/** Keeps letters, digits, dots, dashes and underscores, so paths stay valid. */
function safeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(-80);
}

/** Profile repository acting as the signed-in user. */
export function createSupabaseProfileRepository(): ProfileRepository {
  return {
    async getMyProfile(userId) {
      const supabase = await getRequestClient();
      const {data, error} = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .returns<ProfileRow[]>()
        .maybeSingle();
      if (error) throw new Error(`Could not load profile: ${error.message}`);
      return data ? toProfile(data) : null;
    },

    async saveMyProfile(_userId, input) {
      const supabase = await getRequestClient();
      // One database transaction for the profile and its details; the
      // function works out the user from the session (migration 0007).
      const {error} = await supabase.rpc('save_my_profile', {
        p_role: input.role,
        p_full_name: input.fullName,
        p_credentials: input.credentials,
        p_is_employed: input.isEmployed ?? false,
        p_employer: input.employer,
        p_bio: input.bio,
        p_license_state: input.licenseState,
        p_license_number: input.licenseNumber,
        p_school_name: input.schoolName,
        p_contact_position: input.contactPosition,
      });
      if (error) throw new Error(`Could not save profile: ${error.message}`);
    },

    async uploadMyCertification(userId, file) {
      const supabase = await getRequestClient();
      // A new name per upload, so earlier files stay for the admin's records
      // (the database caps each trainer at 10 files).
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

    async deleteMyAccount(userId) {
      const supabase = await getRequestClient();
      const bucket = supabase.storage.from(CERTIFICATION_BUCKET);

      // Detach the file first, so a failure below never leaves the profile
      // pointing at a deleted file. (No-op for schools.)
      await supabase
        .from('trainer_profiles')
        .update({certification_path: null})
        .eq('id', userId);

      // Files before the account: once the account is gone, the user can no
      // longer delete them. Removed files leave the list, so always read the
      // first page until it is empty.
      for (;;) {
        const {data: files, error} = await bucket.list(userId, {limit: LIST_PAGE_SIZE});
        if (error) throw new Error(`Could not list files: ${error.message}`);
        if (files.length === 0) break;
        const removal = await bucket.remove(
          files.map((file) => `${userId}/${file.name}`),
        );
        if (removal.error) {
          throw new Error(`Could not delete files: ${removal.error.message}`);
        }
      }

      const {error} = await supabase.rpc('delete_my_account');
      if (error) throw new Error(`Could not delete account: ${error.message}`);
    },
  };
}
