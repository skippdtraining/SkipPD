/**
 * @fileoverview "Share your expertise" form for creating a training listing.
 *
 * Currently saves the listing in the browser (same as the POC). In Step 5 it
 * is only available to teacher accounts, writes to the database, and uploads
 * the image to Supabase Storage instead of storing it as text.
 */

'use client';

import {useState} from 'react';
import {IMAGE_TYPES, MAX_CUSTOM_TOPIC_LENGTH, MAX_IMAGE_BYTES} from '@/config/catalog';
import {addListing} from '@/lib/browser-storage';
import {readFileAsDataUrl, readNumber, readText} from '@/lib/form-helpers';
import {
  FORMATS,
  GRADES,
  OTHER_CATEGORY,
  type Course,
  type Format,
  type Grade,
} from '@/lib/types';
import {OutcomeListField} from './OutcomeListField';

/** Shown as trainer on browser-created listings until accounts exist (Step 4). */
const PREVIEW_TRAINER_NAME = 'You (preview)';

/** Default look for listings without an image (purple "books" artwork). */
const DEFAULT_COVER = {color: '#e7dff6', accent: '#8264ad', type: 'books'} as const;

interface ListingFormProps {
  /** Suggested topics for the topic dropdown, in display order. */
  categories: string[];
  /** Called after the listing was saved. */
  onSubmitted: () => void;
  /** Called with a user-facing message when validation or saving failed. */
  onError: (message: string) => void;
}

/** Form for a new training listing. */
export function ListingForm({categories, onSubmitted, onError}: ListingFormProps) {
  // Shows the custom topic field only when "Other" is selected.
  const [isOtherTopic, setIsOtherTopic] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // The file input is read directly: FormData always contains an (empty)
    // File object for it, even when nothing was chosen.
    const imageInput = form.elements.namedItem('image') as HTMLInputElement;
    const imageFile = imageInput.files?.[0];
    if (
      imageFile &&
      (imageFile.size > MAX_IMAGE_BYTES || !IMAGE_TYPES.includes(imageFile.type))
    ) {
      onError('Choose a JPG, PNG, or WebP image under 1 MB.');
      return;
    }

    const gradeChoice = readText(data, 'grades');
    // Casts are safe: the <select> options come from the same constant lists.
    const course: Course = {
      id: Date.now(),
      title: readText(data, 'title'),
      // Trainer name and credentials will come from the signed-in account
      // (Step 4); until then the listing is labelled with a placeholder.
      trainer: PREVIEW_TRAINER_NAME,
      role: '',
      category: isOtherTopic
        ? readText(data, 'customCategory')
        : readText(data, 'category'),
      format: readText(data, 'format') as Format,
      hours: readNumber(data, 'hours', 1),
      price: readNumber(data, 'price', 0),
      grades: gradeChoice === 'all' ? [...GRADES] : [gradeChoice as Grade],
      tags: [],
      description: readText(data, 'description'),
      outcomes: data
        .getAll('outcomes')
        .map((value) => String(value).trim())
        .filter((value) => value !== ''),
      ...DEFAULT_COVER,
      image: imageFile ? await readFileAsDataUrl(imageFile) : undefined,
    };

    if (addListing(course)) {
      onSubmitted();
    } else {
      onError('Browser storage is full. Try a smaller image.');
    }
  }

  return (
    <>
      <div className="notice">
        Preview: this listing is saved in this browser only and is not visible to other
        visitors.
      </div>

      {/* Field limits (maxLength, min, max) match the POC. */}
      <form onSubmit={handleSubmit}>
        <label className="field">
          Course title
          <input
            name="title"
            maxLength={100}
            placeholder="Give your training a clear, specific name"
            required
          />
        </label>
        <div className="two">
          <label className="field">
            Topic
            <select
              name="category"
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
            <select name="format">
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
              placeholder="e.g., Music education"
              required
            />
          </label>
        )}
        <div className="two">
          <label className="field">
            Duration (hours)
            <input name="hours" type="number" min={0.25} max={500} step={0.25} required />
          </label>
          <label className="field">
            Price per person (USD)
            <input name="price" type="number" min={0} max={99999} step={1} required />
          </label>
        </div>
        <label className="field">
          Grade level
          <select name="grades">
            <option value="all">All grades</option>
            {GRADES.map((grade) => (
              <option key={grade}>{grade}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Course description
          <textarea name="description" required maxLength={1500} />
        </label>
        <OutcomeListField name="outcomes" />
        <label className="field">
          Course image (optional, JPG / PNG / WebP, max 1 MB)
          <input type="file" name="image" accept={IMAGE_TYPES.join(',')} />
        </label>
        <button className="btn wide">Add training to catalog</button>
      </form>
    </>
  );
}
