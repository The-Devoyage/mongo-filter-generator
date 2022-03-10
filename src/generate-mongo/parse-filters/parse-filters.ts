import { isFilter } from '../validate-filters';
import { FieldFilter } from '../../types';

export const parseFieldFilter = (
  object: any,
  location: string[]
): {
  fieldFilter: FieldFilter;
  location: string;
} => {
  const deepFilterSearch = (object: any): FieldFilter => {
    if (isFilter(object)) {
      return object;
    }

    for (const k in object) {
      location.push(k);
      const obj = object[k];
      if (typeof obj === 'object') {
        return deepFilterSearch(obj);
      }
    }
    return;
  };

  const fieldFilter = deepFilterSearch(object);

  return { fieldFilter, location: location.join('.') };
};
