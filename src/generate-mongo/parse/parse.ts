import { Validate } from '../validate';
import { FieldFilter } from '../../types';

export const parseFieldFilter = (
  object: unknown,
  location: string[]
): {
  fieldFilter: FieldFilter | undefined;
  location: string;
} => {
  const deepFilterSearch = (object: unknown): FieldFilter | undefined => {
    // If Valid Field Filter, Return, no need to update location.
    if (Validate.isValidFieldFilter(object)) {
      return object;
    }

    // If not FieldFilter, keep looking deeper, and update location.
    for (const k in object as Record<string, unknown>) {
      location.push(k);
      const obj = (object as Record<string, unknown>)[k];
      if (typeof obj === 'object') {
        return deepFilterSearch(obj as Record<string, unknown>);
      }
    }
    return;
  };

  let fieldFilter: FieldFilter | undefined;
  if (typeof object === 'object') {
    fieldFilter = deepFilterSearch(object);
  }

  return { fieldFilter, location: location.join('.') };
};
