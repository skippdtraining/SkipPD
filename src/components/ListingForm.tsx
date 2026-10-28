"use client";

import { CATEGORIES, FORMATS, GRADES } from "@/lib/types";

interface Props {
  onSubmitted: () => void;
  onError: (message: string) => void;
}

const MAX_IMAGE_BYTES = 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Training listing form. UI only until Step 4 (teacher listings stored in the database). */
export default function ListingForm({ onSubmitted, onError }: Props) {
  return (
    <>
      <div className="notice">
        Preview: listings are not published yet. Teacher accounts and listings arrive in a later release.
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const file = (e.currentTarget.elements.namedItem("image") as HTMLInputElement).files?.[0];
          if (file && (file.size > MAX_IMAGE_BYTES || !IMAGE_TYPES.includes(file.type))) {
            onError("Choose a JPG, PNG, or WebP image under 1 MB.");
            return;
          }
          onSubmitted();
        }}
      >
        <label className="field">
          Course title
          <input name="title" maxLength={100} placeholder="Give your training a clear, specific name" required />
        </label>
        <div className="two">
          <label className="field">
            Trainer name
            <input name="trainer" maxLength={90} required />
          </label>
          <label className="field">
            Experience / credentials
            <input name="role" maxLength={180} placeholder="e.g., Literacy coach · 12 years teaching" required />
          </label>
        </div>
        <div className="two">
          <label className="field">
            Topic
            <select name="category">
              {CATEGORIES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Format
            <select name="format">
              {FORMATS.map((x) => (
                <option key={x}>{x}</option>
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
            {GRADES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Keywords (comma separated)
          <input name="tags" placeholder="Phonics, reading, literacy" maxLength={150} required />
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
          <input type="file" name="image" accept={IMAGE_TYPES.join(",")} />
        </label>
        <button className="btn wide">Add training to catalog</button>
      </form>
    </>
  );
}
