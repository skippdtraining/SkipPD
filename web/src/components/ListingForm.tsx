/**
 * @fileoverview "Share your expertise" form for creating a training listing.
 *
 * Currently saves the listing in the browser (same as the POC). In Step 4 it
 * is only available to teacher accounts, writes to the database, and uploads
 * the image to Supabase Storage instead of storing it as text.
 */

'use client';

import {IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_LISTING_TAGS} from '@/config/catalog';
import {addListing} from '@/lib/browser-storage';
import {readFileAsDataUrl, readNumber, readText, splitList} from '@/lib/form-helpers';
import {
  CATEGORIES,
  FORMATS,
  GRADES,
  type Category,
  type Course,
  type Format,
  type Grade,
} from '@/lib/types';

/** Default look for listings without an image (purple "books" artwork). */
const DEFAULT_COVER = {color: '#e7dff6', accent: '#8264ad', type: 'books'} as const;

interface ListingFormProps {
  /** Called after the listing was saved. */
  onSubmitted: () => void;
  /** Called with a user-facing message when validation or saving failed. */
  onError: (message: string) => void;
}

/** Form for a new training listing. */
export function ListingForm({onSubmitted, onError}: ListingFormProps) {
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
      trainer: readText(data, 'trainer'),
      role: readText(data, 'role'),
      category: readText(data, 'category') as Category,
      format: readText(data, 'format') as Format,
      hours: readNumber(data, 'hours', 1),
      price: readNumber(data, 'price', 0),
      grades: gradeChoice === 'all' ? [...GRADES] : [gradeChoice as Grade],
      tags: splitList(readText(data, 'tags'), ',').slice(0, MAX_LISTING_TAGS),
      description: readText(data, 'description'),
      outcomes: splitList(readText(data, 'outcomes'), '\n'),
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
            Trainer name
            <input name="trainer" maxLength={90} required />
          </label>
          <label className="field">
            Experience / credentials
            <input
              name="role"
              maxLength={180}
              placeholder="e.g., Literacy coach · 12 years teaching"
              required
            />
          </label>
        </div>
        <div className="two">
          <label className="field">
            Topic
            <select name="category">
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
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
          Keywords (comma separated)
          <input
            name="tags"
            placeholder="Phonics, reading, literacy"
            maxLength={150}
            required
          />
        </label>
        <label className="field">
          Course description
          <textarea name="description" required maxLength={1500} />
        </label>
        <label className="field">
          Learning outcomes (one per line)
          <textarea name="outcomes" required maxLength={1200} />
        </label>
        <label className="field">
          Course image (optional, JPG / PNG / WebP, max 1 MB)
          <input type="file" name="image" accept={IMAGE_TYPES.join(',')} />
        </label>
        <button className="btn wide">Add training to catalog</button>
      </form>
    </>
  );
}
