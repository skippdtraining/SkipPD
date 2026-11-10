/**
 * @fileoverview Reads and validates the training listing form (create and
 * edit).
 *
 * Runs on the server inside the save action, so the checks cannot be skipped
 * by editing the page. Pure: no database calls. Limits live in
 * `config/catalog.ts` and match the form inputs and the database constraints.
 */

import {
  IMAGE_TYPES,
  LISTING_LIMITS,
  MAX_CUSTOM_TOPIC_LENGTH,
  MAX_IMAGE_BYTES,
  MAX_OUTCOME_LENGTH,
  MAX_OUTCOMES,
} from '@/config/catalog';
import {readNumber, readText} from './form-helpers';
import {
  FORMATS,
  GRADES,
  OTHER_CATEGORY,
  type Format,
  type Grade,
  type ListingInput,
} from './types';

/** Result of reading the form: the values, or a message for the user. */
export type ParsedListingForm =
  | {
      ok: true;
      /** Listing being edited, or null when creating a new one. */
      listingId: number | null;
      input: ListingInput;
      image: File | null;
    }
  | {ok: false; message: string};

/** Validates the submitted listing form. */
export function parseListingForm(data: FormData): ParsedListingForm {
  const title = readText(data, 'title');
  if (title === '' || title.length > LISTING_LIMITS.title) {
    return {
      ok: false,
      message: `Enter a title of up to ${LISTING_LIMITS.title} characters.`,
    };
  }

  // "Other" reveals a free-text field; both end up in `category`.
  const categoryChoice = readText(data, 'category');
  const category =
    categoryChoice === OTHER_CATEGORY ? readText(data, 'customCategory') : categoryChoice;
  if (category === '' || category.length > MAX_CUSTOM_TOPIC_LENGTH) {
    return {
      ok: false,
      message: `Choose a topic of up to ${MAX_CUSTOM_TOPIC_LENGTH} characters.`,
    };
  }

  const format = readText(data, 'format');
  if (!FORMATS.includes(format as Format)) {
    return {ok: false, message: 'Choose a delivery format.'};
  }

  const hours = readNumber(data, 'hours', 0);
  if (hours < LISTING_LIMITS.minHours || hours > LISTING_LIMITS.maxHours) {
    return {
      ok: false,
      message: `Session length must be between ${LISTING_LIMITS.minHours} and ${LISTING_LIMITS.maxHours} hours.`,
    };
  }

  // -1 is the fallback so an empty or broken field fails the check below.
  const price = readNumber(data, 'price', -1);
  if (price < 0 || price > LISTING_LIMITS.maxPrice) {
    return {
      ok: false,
      message: `Enter a price between 0 and ${LISTING_LIMITS.maxPrice} USD.`,
    };
  }

  const gradeChoice = readText(data, 'grades');
  let grades: Grade[] = [];
  if (gradeChoice === 'all') {
    grades = [...GRADES];
  } else if (GRADES.includes(gradeChoice as Grade)) {
    grades = [gradeChoice as Grade];
  } else {
    return {ok: false, message: 'Choose a grade level.'};
  }

  const description = readText(data, 'description');
  if (description === '' || description.length > LISTING_LIMITS.description) {
    return {
      ok: false,
      message: `Enter a description of up to ${LISTING_LIMITS.description} characters.`,
    };
  }

  const outcomes = data
    .getAll('outcomes')
    .map((value) => String(value).trim())
    .filter((value) => value !== '');
  if (outcomes.length > MAX_OUTCOMES) {
    return {ok: false, message: `Add at most ${MAX_OUTCOMES} learning outcomes.`};
  }
  if (outcomes.some((outcome) => outcome.length > MAX_OUTCOME_LENGTH)) {
    return {
      ok: false,
      message: `Each learning outcome can have at most ${MAX_OUTCOME_LENGTH} characters.`,
    };
  }

  // A checkbox sends its value only when checked.
  const isPublished = data.get('isPublished') !== null;

  // An empty file input still sends a File with size 0.
  const file = data.get('image');
  const image = file instanceof File && file.size > 0 ? file : null;
  if (image) {
    if (!IMAGE_TYPES.includes(image.type)) {
      return {ok: false, message: 'Choose a JPG, PNG or WebP image.'};
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return {ok: false, message: 'Choose an image under 1 MB.'};
    }
  }

  // Hidden field on the edit form; absent when creating.
  const rawId = readText(data, 'listingId');
  const listingId = rawId === '' ? null : Number(rawId);
  if (listingId !== null && (!Number.isInteger(listingId) || listingId <= 0)) {
    return {ok: false, message: 'Could not identify the listing to edit.'};
  }

  return {
    ok: true,
    listingId,
    image,
    input: {
      title,
      category,
      format: format as Format,
      hours,
      price,
      grades,
      description,
      outcomes,
      isPublished,
    },
  };
}
