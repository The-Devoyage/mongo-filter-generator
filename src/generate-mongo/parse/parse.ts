import { Validate } from '../validate';
import { FieldFilter } from '../../types';

export const parseFieldFilters = (object: unknown, rootLocation: string) => {
  const fieldFilters: { fieldFilter: FieldFilter; location: string }[] = [];
  if (Validate.isValidFieldFilter(object)) {
    fieldFilters.push({ fieldFilter: object, location: rootLocation });
  }

  for (const f in object as Record<string, unknown>) {
    const parsed = parseFieldFilter((object as Record<string, unknown>)[f], [
      rootLocation,
      f,
    ]);

    if (parsed && !!parsed.fieldFilter) {
      fieldFilters.push(
        parsed as { fieldFilter: FieldFilter; location: string }
      );
    } else if (!parsed && typeof object === 'object') {
      const nestedParsed = parseFieldFilters(
        object,
        [rootLocation, f].join('.')
      );
      for (const nestedFilter of nestedParsed) {
        fieldFilters.push(nestedFilter);
      }
    }
  }

  return fieldFilters;
};

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
