/**
 * @fileoverview Small helpers for reading values out of HTML forms.
 *
 * Forms in this app are "uncontrolled": the browser keeps the field values
 * and we read them once on submit with `FormData`. This avoids one React
 * state variable per field and keeps the form components short.
 */

/** Returns a form field as trimmed text ("" if missing). */
export function readText(data: FormData, field: string): string {
  return String(data.get(field) ?? '').trim();
}

/**
 * Returns a form field as a number, or `fallback` if it is empty or not a
 * valid number. The inputs already use `type="number"` and `required`, so
 * the fallback is a safety net, not normal behaviour.
 */
export function readNumber(data: FormData, field: string, fallback: number): number {
  const value = Number(readText(data, field));
  return readText(data, field) !== '' && Number.isFinite(value) ? value : fallback;
}

/** Reads a file as a data URL (text) so it can be stored in localStorage. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result));
    };
    reader.onerror = () => {
      reject(new Error('Could not read image'));
    };
    reader.readAsDataURL(file);
  });
}
