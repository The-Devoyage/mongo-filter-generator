import { isFilter } from '../validate-filters';
import { FieldFilter } from '../../types';

export const parseFieldFilters = (
  object: any,
  location: string[]
): {
  filtering: FieldFilter;
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

  const filtering = deepFilterSearch(object);

  return { filtering, location: location.join('.') };
};
