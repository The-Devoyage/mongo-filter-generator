import { isFilter } from '../validate-filters';
import { GMFFilterTypes } from '../../types';

export const parseFilters = (
  object: any,
  location: string[]
): {
  filtering: GMFFilterTypes;
  location: string;
} => {
  const deepFilterSearch = (object: any): GMFFilterTypes => {
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
