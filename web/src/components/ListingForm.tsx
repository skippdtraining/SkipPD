/**
 * @fileoverview "Share your expertise" form: creates or edits a training
 * listing.
 *
 * Saves through `saveListingAction` (Step 6). The trainer name and
 * credentials are copied from the signed-in profile by the server; the cover
 * image is uploaded to Supabase Storage instead of being stored as text.
 *
 * React resets an action form the moment the submit starts, so every typed
 * value is snapshotted first and put back when the save failed.
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

/** What one submit sent, kept so a failed save can show it again. */
interface FormSnapshot {
  /** Single-value fields by input name; a checked checkbox appears here. */
  fields: Record<string, string>;
  /** One entry per learning-outcome row, empty ones included. */
  outcomes: string[];
  /** True when the submit carried an image (a file input cannot be refilled). */
  hasImage: boolean;
}

/** Reads the submitted form into {@link FormSnapshot}. */
function snapshotOf(data: FormData): FormSnapshot {
  const fields: Record<string, string> = {};
  data.forEach((value, key) => {
    if (typeof value === 'string' && key !== 'outcomes') fields[key] = value;
  });
  const image = data.get('image');
  return {
    fields,
    outcomes: data.getAll('outcomes').map((value) => String(value)),
    hasImage: image instanceof File && image.size > 0,
  };
}

/** Create / edit form for a training listing. */
export function ListingForm({categories, listing, onSaved}: ListingFormProps) {
  const [state, formAction, pending] = useActionState(saveListingAction, {});
  const isEditing = listing !== undefined;

  // Values of the submit that is running right now; read again when the
  // action comes back with an error. State, not a ref: it is read in render.
  const [snapshot, setSnapshot] = useState<FormSnapshot | null>(null);

  // React resets the form as soon as the action starts. Snapshot first, then
  // let the action run as usual.
  function submit(data: FormData) {
    setSnapshot(snapshotOf(data));
    return formAction(data);
  }

  // A failed attempt changes `attempt`, so the form is rebuilt from the
  // snapshot; the fresh key makes React apply the restored defaultValues.
  const restored = state.error !== undefined ? snapshot : null;
  const restoredField = (name: string, fallback?: string | number) =>
    restored?.fields[name] ?? fallback;
  const restoredOutcomes = restored ? restored.outcomes : listing?.outcomes;

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
    <form key={state.attempt ?? 0} action={submit}>
      <FormError message={state.error} trigger={state} />
      {isEditing && <input type="hidden" name="listingId" value={listing.id} />}

      <label className="field">
        Course title
        <input
          name="title"
          maxLength={LISTING_LIMITS.title}
          defaultValue={restoredField('title', listing?.title)}
          placeholder="Give your training a clear, specific name"
          required
        />
      </label>
      <div className="two">
        <label className="field">
          Topic
          <select
            name="category"
            defaultValue={restoredField(
              'category',
              usesCustomTopic ? OTHER_CATEGORY : listing?.category,
            )}
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
          <select name="format" defaultValue={restoredField('format', listing?.format)}>
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
            defaultValue={restoredField(
              'customCategory',
              usesCustomTopic ? listing?.category : undefined,
            )}
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
            defaultValue={restoredField('hours', listing?.hours)}
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
            defaultValue={restoredField('price', listing?.price)}
            required
          />
        </label>
      </div>
      <label className="field">
        Grade level
        <select name="grades" defaultValue={restoredField('grades', gradeDefault)}>
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
          defaultValue={restoredField('description', listing?.description)}
        />
      </label>
      <OutcomeListField name="outcomes" initial={restoredOutcomes} />
      <label className="field">
        Course image (optional, JPG / PNG / WebP, max 1 MB)
        <input type="file" name="image" accept={IMAGE_TYPES.join(',')} />
        {restored?.hasImage && (
          <small>
            Choose the image file again — it cannot be kept after a failed save.
          </small>
        )}
      </label>
      {isEditing && !restored && (
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
          defaultChecked={
            restored ? 'isPublished' in restored.fields : (listing?.isPublished ?? true)
          }
        />
        <span>Show in the catalog (uncheck to hide it while you work on it)</span>
      </label>
      <button className="btn wide" disabled={pending}>
        {pending ? 'Saving…' : isEditing ? 'Save changes' : 'Add training to catalog'}
      </button>
    </form>
  );
}
