/**
 * @fileoverview "Share your expertise" form: creates or edits a training
 * listing.
 *
 * Saves through `saveListingAction` (Step 6). The trainer name and
 * credentials are copied from the signed-in profile by the server; the cover
 * image is uploaded to Supabase Storage instead of being stored as text.
 */

'use client';

import {useActionState, useEffect, useEffectEvent, useState} from 'react';
import {saveListingAction} from '@/app/actions/listings';
import {IMAGE_TYPES, LISTING_LIMITS, MAX_CUSTOM_TOPIC_LENGTH} from '@/config/catalog';
import {FORMATS, GRADES, OTHER_CATEGORY, type Course} from '@/lib/types';
import {FormError} from './FormError';
import {OutcomeListField} from './OutcomeListField';

interface ListingFormProps {
  /** Suggested topics for the topic dropdown, in display order. */
  categories: string[];
  /** Existing listing to edit; omitted when creating a new one. */
  listing?: Course;
  /** Called after the listing was saved. */
  onSaved: () => void;
}

/** Create / edit form for a training listing. */
export function ListingForm({categories, listing, onSaved}: ListingFormProps) {
  const [state, formAction, pending] = useActionState(saveListingAction, {});
  const isEditing = listing !== undefined;

  // A custom topic (typed under "Other") is not in the suggested list.
  const usesCustomTopic = listing !== undefined && !categories.includes(listing.category);
  // Shows the custom topic field only when "Other" is selected.
  const [isOtherTopic, setIsOtherTopic] = useState(usesCustomTopic);

  // Each successful save bumps savedCount; tell the parent once per save.
  const notifySaved = useEffectEvent(() => {
    onSaved();
  });
  useEffect(() => {
    if (state.savedCount) notifySaved();
  }, [state.savedCount]);

  // "All grades" is stored as the full list, so length tells the two apart.
  const gradeDefault =
    listing === undefined || listing.grades.length === GRADES.length
      ? 'all'
      : listing.grades[0];

  return (
    <form action={formAction}>
      <FormError message={state.error} trigger={state} />
      {isEditing && <input type="hidden" name="listingId" value={listing.id} />}

      <label className="field">
        Course title
        <input
          name="title"
          maxLength={LISTING_LIMITS.title}
          defaultValue={listing?.title}
          placeholder="Give your training a clear, specific name"
          required
        />
      </label>
      <div className="two">
        <label className="field">
          Topic
          <select
            name="category"
            defaultValue={usesCustomTopic ? OTHER_CATEGORY : listing?.category}
            onChange={(event) => {
              setIsOtherTopic(event.target.value === OTHER_CATEGORY);
            }}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
            <option>{OTHER_CATEGORY}</option>
          </select>
        </label>
        <label className="field">
          Format
          <select name="format" defaultValue={listing?.format}>
            {FORMATS.map((format) => (
              <option key={format}>{format}</option>
            ))}
          </select>
        </label>
      </div>
      {isOtherTopic && (
        <label className="field">
          Your topic
          <input
            name="customCategory"
            maxLength={MAX_CUSTOM_TOPIC_LENGTH}
            defaultValue={usesCustomTopic ? listing?.category : undefined}
            placeholder="e.g., Music education"
            required
          />
        </label>
      )}
      <div className="two">
        <label className="field">
          Duration (hours)
          <input
            name="hours"
            type="number"
            min={LISTING_LIMITS.minHours}
            max={LISTING_LIMITS.maxHours}
            step={0.25}
            defaultValue={listing?.hours}
            required
          />
        </label>
        <label className="field">
          Price per person (USD)
          <input
            name="price"
            type="number"
            min={0}
            max={LISTING_LIMITS.maxPrice}
            step={1}
            defaultValue={listing?.price}
            required
          />
        </label>
      </div>
      <label className="field">
        Grade level
        <select name="grades" defaultValue={gradeDefault}>
          <option value="all">All grades</option>
          {GRADES.map((grade) => (
            <option key={grade}>{grade}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Course description
        <textarea
          name="description"
          required
          maxLength={LISTING_LIMITS.description}
          defaultValue={listing?.description}
        />
      </label>
      <OutcomeListField name="outcomes" initial={listing?.outcomes} />
      <label className="field">
        Course image (optional, JPG / PNG / WebP, max 1 MB)
        <input type="file" name="image" accept={IMAGE_TYPES.join(',')} />
      </label>
      {isEditing && (
        <p className="small-text">
          {listing.image
            ? 'Leave the image empty to keep the current one.'
            : 'This listing has no image yet.'}
        </p>
      )}
      <label className="check">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={listing?.isPublished ?? true}
        />
        <span>Show in the catalog (uncheck to hide it while you work on it)</span>
      </label>
      <button className="btn wide" disabled={pending}>
        {pending ? 'Saving…' : isEditing ? 'Save changes' : 'Add training to catalog'}
      </button>
    </form>
  );
}
