/**
 * @fileoverview Data-access contract for user profiles (the details asked
 * at sign-up) and certification files.
 *
 * Same pattern as course-repository.ts: callers use the interface, the
 * factory picks the backend. All methods act as the signed-in user of the
 * current request; the backend only lets users see and change their own
 * profile.
 *
 * Server only.
 */

import type {Profile, ProfileInput} from '../types';
import {createSupabaseProfileRepository} from './supabase-profile-repository';

/** Everything the app can ask about the current user's profile. */
export interface ProfileRepository {
  /** The current user's profile, or null if they have not created one yet. */
  getMyProfile(): Promise<Profile | null>;
  /** Creates or updates the current user's profile. The account type cannot change. */
  saveMyProfile(input: ProfileInput): Promise<void>;
  /**
   * Stores a certification file and attaches it to the profile, which sets
   * its review status to "pending". The profile must already exist.
   */
  uploadMyCertification(file: File): Promise<void>;
}

/** Returns the repository the app should use. */
export function getProfileRepository(): ProfileRepository {
  return createSupabaseProfileRepository();
}
