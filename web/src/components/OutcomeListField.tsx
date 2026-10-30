/**
 * @fileoverview "Learning outcomes" form field: one text input per outcome,
 * with "+ Add outcome" and a remove (×) button on each row. Clearer than a
 * single textarea where each line is an outcome.
 *
 * Every input shares the same `name`, so the parent form reads all values
 * with `FormData.getAll(name)`.
 */

'use client';

import {useRef, useState} from 'react';
import {MAX_OUTCOME_LENGTH, MAX_OUTCOMES} from '@/config/catalog';

interface OutcomeListFieldProps {
  /** Form field name shared by every input. */
  name: string;
}

/** Growing list of outcome inputs. At least one row is always shown. */
export function OutcomeListField({name}: OutcomeListFieldProps) {
  // Each row needs a stable key that survives removals; a counter gives one.
  const nextId = useRef(1);
  const [rowIds, setRowIds] = useState<number[]>([0]);

  function addRow() {
    setRowIds((ids) => [...ids, nextId.current++]);
  }

  function removeRow(id: number) {
    setRowIds((ids) => ids.filter((rowId) => rowId !== id));
  }

  return (
    <fieldset className="field outcome-list">
      <legend>Learning outcomes</legend>
      {rowIds.map((id, index) => (
        <div key={id} className="outcome-row">
          <input
            name={name}
            maxLength={MAX_OUTCOME_LENGTH}
            placeholder={index === 0 ? 'e.g., Plan explicit phonics instruction' : ''}
            aria-label={`Outcome ${index + 1}`}
            // Only the first outcome is mandatory; empty extra rows are ignored.
            required={index === 0}
          />
          {rowIds.length > 1 && (
            <button
              type="button"
              className="outcome-remove"
              aria-label={`Remove outcome ${index + 1}`}
              onClick={() => {
                removeRow(id);
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {rowIds.length < MAX_OUTCOMES && (
        <button type="button" className="btn light small outcome-add" onClick={addRow}>
          + Add outcome
        </button>
      )}
    </fieldset>
  );
}
